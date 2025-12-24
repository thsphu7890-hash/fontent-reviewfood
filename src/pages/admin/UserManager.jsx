import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Search, Trash2, Lock, Unlock,
  Shield, User, Mail, Calendar
} from 'lucide-react';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy admin hiện tại
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Lỗi tải user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert('Bạn không thể xóa chính mình!');
      return;
    }

    if (!window.confirm('CẢNH BÁO: Xóa vĩnh viễn tài khoản này?')) return;

    try {
      await api.delete(`/users/${id}`);
      alert('Đã xóa người dùng!');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  // ================= LOCK / UNLOCK =================
  const handleToggleLock = async (user) => {
    if (user.id === currentUser.id) {
      alert('Bạn không thể khóa chính mình!');
      return;
    }

    if (!window.confirm(`${user.locked ? 'Mở khóa' : 'Khóa'} tài khoản ${user.username}?`)) return;

    try {
      await api.put(`/users/${user.id}/lock`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  // ================= FILTER =================
  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mgr-container">
      <style>{`
        .mgr-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
        .search-box { position:relative; max-width:400px; margin-bottom:24px; }
        .search-inp { width:100%; padding:12px 12px 12px 40px; border:1px solid #e4e4e7; border-radius:10px; }
        .search-inp:focus { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,.1); }
        .search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#a1a1aa; }

        .user-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
        .user-card { background:#fff; border-radius:16px; padding:20px; border:1px solid #f3f4f6; display:flex; flex-direction:column; gap:12px; transition:.2s; }
        .user-card:hover { transform:translateY(-3px); box-shadow:0 10px 15px rgba(0,0,0,.05); }
        .user-card.locked { background:#f9fafb; opacity:.8; }

        .user-header { display:flex; justify-content:space-between; }
        .user-avatar {
          width:48px; height:48px; border-radius:50%;
          background:#f3f4f6; display:flex;
          align-items:center; justify-content:center;
          font-weight:800; font-size:20px; color:#374151;
        }
        .user-avatar svg { width:26px; height:26px; }

        .user-role { font-size:11px; font-weight:800; padding:4px 10px; border-radius:20px; }
        .role-admin { background:#fee2e2; color:#ef4444; }
        .role-user { background:#e0f2fe; color:#0284c7; }

        .user-info h4 { margin:0; font-size:16px; font-weight:700; }
        .user-info span { font-size:13px; color:#71717a; }

        .info-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#52525b; }

        .card-actions { margin-top:auto; padding-top:16px; border-top:1px dashed #e5e7eb; display:flex; justify-content:flex-end; gap:8px; }
        .btn-icon { width:36px; height:36px; border-radius:8px; border:none; cursor:pointer; }
        .btn-lock { background:#fff7ed; color:#ea580c; }
        .btn-unlock { background:#ecfdf5; color:#059669; }
        .btn-del { background:#fef2f2; color:#ef4444; }
      `}</style>

      <div className="mgr-header">
        <h2>Quản lý <span style={{ color: '#ef4444' }}>Người dùng</span></h2>
        <div>Tổng: {users.length} tài khoản</div>
      </div>

      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          className="search-inp"
          placeholder="Tìm tên, email hoặc tài khoản..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>
      ) : (
        <div className="user-grid">
          {filteredUsers.map(u => (
            <div key={u.id} className={`user-card ${u.locked ? 'locked' : ''}`}>
              <div className="user-header">
                <div className="user-avatar">
                  {(u.fullName || u.username)
                    ? (u.fullName || u.username).charAt(0).toUpperCase()
                    : <User />}
                </div>

                <span className={`user-role ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                  {u.role === 'ADMIN' && <Shield size={10} />} {u.role}
                </span>
              </div>

              <div className="user-info">
                <h4>{u.fullName || '(Chưa cập nhật tên)'}</h4>
                <span>@{u.username}</span>
              </div>

              <div className="info-row">
                <Mail size={14} /> {u.email}
              </div>
              <div className="info-row">
                <Calendar size={14} />
                {new Date(u.createdAt || Date.now()).toLocaleDateString('vi-VN')}
              </div>

              <div className="card-actions">
                {u.id !== currentUser.id ? (
                  <>
                    <button
                      className={`btn-icon ${u.locked ? 'btn-unlock' : 'btn-lock'}`}
                      onClick={() => handleToggleLock(u)}
                    >
                      {u.locked ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                    <button
                      className="btn-icon btn-del"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>Tài khoản của bạn</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManager;

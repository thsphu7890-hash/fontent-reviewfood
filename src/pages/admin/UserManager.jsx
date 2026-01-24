import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  Search, Trash2, Edit, User, Mail, Phone, MapPin, 
  Loader, Shield, ShieldAlert, CheckCircle, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';

const UserManager = () => {
  // --- STATE ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Tăng lên 8 để đẹp grid 4 cột

  // --- API CALLS ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users');
      // Đảm bảo dữ liệu luôn là mảng
      const dataArray = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setUsers(dataArray);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách người dùng");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      try {
        await api.delete(`/api/users/${id}`);
        toast.success("Đã xóa người dùng!");
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        toast.error("Không thể xóa người dùng này.");
      }
    }
  };

  // --- DATA PROCESSING ---
  const processedData = useMemo(() => {
    let data = Array.isArray(users) ? users : [];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(lower)) || 
        (u.email && u.email.toLowerCase().includes(lower))
      );
    }

    // Filter
    if (roleFilter !== 'ALL') {
      data = data.filter(u => u.role === roleFilter);
    }

    // Pagination
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    return { total: data.length, totalPages, currentData };
  }, [users, searchTerm, roleFilter, currentPage]);

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'ADMIN' || u.role === 'ROLE_ADMIN').length,
    user: users.filter(u => u.role === 'USER' || u.role === 'ROLE_USER').length,
    driver: users.filter(u => u.role === 'DRIVER' || u.role === 'ROLE_DRIVER').length,
  };

  return (
    <div className="user-manager">
      <style>{`
        .user-manager { font-family: 'Inter', sans-serif; color: #1e293b; }
        
        /* 1. STATS BAR */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
        .stat-card { background: white; padding: 15px 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .stat-content div:first-child { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
        .stat-content div:last-child { font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1; }

        /* 2. TOOLBAR */
        .toolbar { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 15px; flex-wrap: wrap; }
        .search-container { position: relative; width: 320px; }
        .search-input { width: 100%; padding: 10px 10px 10px 40px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; font-size: 14px; transition: 0.2s; background: white; }
        .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .filter-select { padding: 10px 15px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; font-size: 14px; background: white; cursor: pointer; color: #475569; font-weight: 500; }

        /* 3. USER GRID (CARDS) */
        .user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        
        .user-card { 
          background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; 
          display: flex; flex-direction: column; align-items: center; text-align: center;
          position: relative; transition: 0.2s; cursor: default;
        }
        .user-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-color: #cbd5e1; }

        .menu-btn { position: absolute; top: 15px; right: 15px; color: #94a3b8; cursor: pointer; padding: 5px; border-radius: 50%; transition: 0.2s; }
        .menu-btn:hover { background: #f1f5f9; color: #475569; }

        .avatar-lg { 
          width: 80px; height: 80px; border-radius: 50%; background: #f1f5f9; color: #64748b; 
          display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700;
          margin-bottom: 15px; border: 4px solid #f8fafc; box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        
        .user-name { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .user-email { font-size: 13px; color: #64748b; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
        
        .role-badge { 
          padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
          display: inline-flex; align-items: center; gap: 5px; margin-bottom: 15px;
        }
        .role-admin { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
        .role-driver { background: #fff7ed; color: #f97316; border: 1px solid #fed7aa; }
        .role-user { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; }

        .info-row { width: 100%; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: auto; }
        .info-item { display: flex; flex-direction: column; gap: 2px; align-items: center; font-size: 12px; color: #64748b; width: 50%; }
        .info-item span:first-child { font-weight: 600; color: #334155; }
        .v-divider { width: 1px; background: #f1f5f9; height: 30px; }

        .delete-btn { 
          position: absolute; top: 15px; left: 15px; color: #cbd5e1; cursor: pointer; padding: 6px; border-radius: 50%; transition: 0.2s; opacity: 0;
        }
        .user-card:hover .delete-btn { opacity: 1; }
        .delete-btn:hover { background: #fef2f2; color: #ef4444; }

        /* PAGINATION */
        .pagination { display: flex; justify-content: space-between; align-items: center; padding-top: 25px; border-top: 1px solid #e2e8f0; margin-top: 10px; }
        .page-info { font-size: 13px; color: #64748b; }
        .page-controls { display: flex; gap: 6px; }
        .page-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: white; border-radius: 8px; cursor: pointer; color: #64748b; font-size: 13px; transition: 0.2s; }
        .page-btn:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }
        .page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* 1. THỐNG KÊ */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-slate-100 text-slate-600"><User /></div>
          <div className="stat-content"><div>Tổng User</div><div>{stats.total}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-100 text-red-600"><ShieldAlert /></div>
          <div className="stat-content"><div>Admin</div><div>{stats.admin}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange-100 text-orange-600"><MapPin /></div>
          <div className="stat-content"><div>Tài xế</div><div>{stats.driver}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600"><Shield /></div>
          <div className="stat-content"><div>Khách hàng</div><div>{stats.user}</div></div>
        </div>
      </div>

      {/* 2. CÔNG CỤ TÌM KIẾM */}
      <div className="toolbar">
        <div className="flex gap-3">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              className="search-input" 
              placeholder="Tìm kiếm theo tên, email..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select 
            className="filter-select"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="USER">Khách hàng</option>
            <option value="DRIVER">Tài xế</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </div>
      </div>

      {/* 3. DANH SÁCH USER (GRID CARDS) */}
      {loading ? (
        <div className="text-center py-20"><Loader className="animate-spin mx-auto text-blue-500" size={32}/></div>
      ) : (
        <>
          <div className="user-grid">
            {processedData.currentData.map(u => {
              let roleClass = 'role-user';
              let RoleIcon = User;
              if (u.role.includes('ADMIN')) { roleClass = 'role-admin'; RoleIcon = ShieldAlert; }
              if (u.role.includes('DRIVER')) { roleClass = 'role-driver'; RoleIcon = MapPin; }

              return (
                <div key={u.id} className="user-card">
                  <div className="delete-btn" onClick={() => handleDelete(u.id)} title="Xóa tài khoản">
                    <Trash2 size={18}/>
                  </div>
                  <div className="menu-btn"><MoreHorizontal size={20}/></div>

                  <div className="avatar-lg">
                    {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <h3 className="user-name">{u.fullName || 'Chưa đặt tên'}</h3>
                  <div className="user-email"><Mail size={12}/> {u.email}</div>

                  <div className={`role-badge ${roleClass}`}>
                    <RoleIcon size={12}/> {u.role}
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span>ID</span>
                      #{u.id}
                    </div>
                    <div className="v-divider"></div>
                    <div className="info-item">
                      <span>Điện thoại</span>
                      {u.phone || 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {processedData.currentData.length === 0 && (
            <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-slate-100 mt-4">
              <User size={48} className="mx-auto mb-3 opacity-20"/>
              <p>Không tìm thấy người dùng nào phù hợp.</p>
            </div>
          )}

          {/* 4. PHÂN TRANG */}
          {processedData.totalPages > 1 && (
            <div className="pagination">
              <div className="page-info">
                Hiển thị <b>{processedData.currentData.length}</b> trên tổng <b>{processedData.total}</b> tài khoản
              </div>
              <div className="page-controls">
                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft size={16}/>
                </button>
                {[...Array(processedData.totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="page-btn" disabled={currentPage === processedData.totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserManager;
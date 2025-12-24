import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Lock, Unlock, Phone, Mail, User, ShieldCheck, ShieldAlert } from 'lucide-react';

const DriverManager = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Lấy danh sách tài xế khi vào trang
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      // ✅ ĐÃ SỬA: Xóa chữ /api ở đầu để tránh bị lặp (thành /api/api/...)
      const res = await api.get('/users/drivers'); 
      setDrivers(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách tài xế:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Khóa / Mở khóa tài xế
  const handleToggleLock = async (driverId, currentStatus) => {
    const action = currentStatus ? "MỞ KHÓA" : "KHÓA";
    if (window.confirm(`Bạn có chắc muốn ${action} tài khoản tài xế này?`)) {
      try {
        // ✅ ĐÃ SỬA: Xóa chữ /api ở đầu
        await api.put(`/users/${driverId}/toggle-lock`);
        
        // Cập nhật lại danh sách local để giao diện đổi màu ngay
        setDrivers(drivers.map(d => 
            d.id === driverId ? { ...d, locked: !d.locked } : d
        ));
      } catch (error) {
        alert("Lỗi cập nhật trạng thái: " + (error.response?.data?.message || "Lỗi server"));
      }
    }
  };

  // 3. Logic Tìm kiếm (Filter)
  const filteredDrivers = drivers.filter(driver => {
      const term = searchTerm.toLowerCase();
      const name = (driver.fullName || '').toLowerCase();
      const phone = (driver.phone || '');
      const email = (driver.email || '').toLowerCase();
      return name.includes(term) || phone.includes(term) || email.includes(term);
  });

  return (
    <div className="manager-container">
      <style>{`
        .manager-container { font-family: 'Inter', sans-serif; }
        .m-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 15px; }
        .m-title { font-size: 24px; font-weight: 800; color: #111827; }
        
        /* Search Bar Styles */
        .search-box { position: relative; width: 100%; max-width: 320px; }
        .search-inp { width: 100%; padding: 10px 10px 10px 40px; border-radius: 10px; border: 1px solid #e5e7eb; outline: none; transition: 0.2s; }
        .search-inp:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }

        /* Table Styles */
        .table-wrapper { background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .d-table { width: 100%; border-collapse: collapse; }
        .d-table th { background: #f9fafb; text-align: left; padding: 16px; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; }
        .d-table td { padding: 16px; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
        .d-table tr:last-child td { border-bottom: none; }
        .d-table tr:hover { background-color: #f8fafc; }

        /* User Info Styles */
        .user-info { display: flex; align-items: center; gap: 12px; }
        .u-avatar { width: 40px; height: 40px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
        .u-name { font-weight: 600; color: #111827; font-size: 14px; }
        .u-meta { font-size: 12px; color: #6b7280; margin-top: 2px; }

        /* Contact Styles */
        .contact-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #4b5563; margin-bottom: 4px; }

        /* Status Badge */
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-flex; align-items: center; gap: 4px; }
        .b-active { background: #ecfdf5; color: #059669; }
        .b-locked { background: #fef2f2; color: #ef4444; }

        /* Action Button */
        .btn-act { padding: 8px 14px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
        .btn-lock { background: #fff1f2; color: #ef4444; border: 1px solid #fecaca; }
        .btn-lock:hover { background: #fee2e2; }
        .btn-unlock { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .btn-unlock:hover { background: #d1fae5; }
        
        .empty-state { text-align: center; padding: 40px; color: #9ca3af; }
      `}</style>

      <div className="m-header">
        <h2 className="m-title">Quản lý Tài xế ({filteredDrivers.length})</h2>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            className="search-inp" 
            placeholder="Tìm theo tên, SĐT hoặc email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="d-table">
          <thead>
            <tr>
              <th>Tài xế</th>
              <th>Thông tin liên hệ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="empty-state">Đang tải dữ liệu...</td></tr>
            ) : filteredDrivers.length > 0 ? (
              filteredDrivers.map(driver => (
                <tr key={driver.id}>
                  <td>
                    <div className="user-info">
                      <div className="u-avatar">
                        {driver.fullName ? driver.fullName.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <div>
                        <div className="u-name">{driver.fullName}</div>
                        <div className="u-meta">ID: #{driver.id} • Tham gia: {new Date(driver.createdAt || Date.now()).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-row">
                        <Phone size={14} /> {driver.phone || <span style={{color:'#9ca3af', fontStyle:'italic'}}>Chưa có SĐT</span>}
                    </div>
                    <div className="contact-row">
                        <Mail size={14} /> {driver.email}
                    </div>
                  </td>
                  <td>
                    {driver.locked ? (
                        <span className="badge b-locked"><ShieldAlert size={12}/> Đã Khóa</span>
                    ) : (
                        <span className="badge b-active"><ShieldCheck size={12}/> Hoạt động</span>
                    )}
                  </td>
                  <td>
                    <button 
                        className={`btn-act ${driver.locked ? 'btn-unlock' : 'btn-lock'}`}
                        onClick={() => handleToggleLock(driver.id, driver.locked)}
                    >
                        {driver.locked ? <><Unlock size={14}/> Mở khóa</> : <><Lock size={14}/> Khóa TK</>}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-state">
                  <User size={48} style={{opacity:0.2, marginBottom:10}}/>
                  <p>Không tìm thấy tài xế nào phù hợp.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverManager;
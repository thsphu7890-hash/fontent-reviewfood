import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast'; // Đảm bảo đã import
import { 
  Phone, Mail, CheckCircle, XCircle, Search, 
  ShieldCheck, Bike, Lock, Loader2, User
} from 'lucide-react';

const DriverManager = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. CALL API (Đã sửa URL khớp với Backend)
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/driver/all'); 
      setDrivers(Array.isArray(res.data) ? res.data : []);
      // Không cần toast success ở đây vì đây là hành động load trang mặc định
    } catch (error) {
      console.error("Lỗi fetch:", error);
      toast.error("Không thể tải danh sách tài xế. Vui lòng thử lại sau."); // Thêm thông báo lỗi load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // 2. ACTIONS
  const handleApprove = async (id) => {
    if (!window.confirm("Xác nhận duyệt tài xế này?")) return;
    
    // Hiển thị loading toast
    const loadId = toast.loading("Đang xử lý yêu cầu duyệt..."); 

    try {
      await api.put(`/api/driver/approve/${id}`);
      
      // Cập nhật toast thành success
      toast.success("Đã duyệt tài xế thành công!", { id: loadId }); 
      
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: 'ACTIVE' } : d));
    } catch (error) {
      // Cập nhật toast thành error
      const errorMsg = error.response?.data?.message || "Duyệt thất bại. Vui lòng thử lại.";
      toast.error(errorMsg, { id: loadId }); 
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm("Bạn muốn khóa tài khoản này?")) return;
    
    // Hiển thị loading toast
    const loadId = toast.loading("Đang khóa tài khoản...");

    try {
      await api.put(`/api/driver/block/${id}`);
      
      // Cập nhật toast thành success
      toast.success("Đã khóa tài khoản thành công!", { id: loadId });
      
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: 'BLOCKED' } : d));
    } catch (error) {
      // Cập nhật toast thành error
      const errorMsg = error.response?.data?.message || "Khóa thất bại. Vui lòng thử lại.";
      toast.error(errorMsg, { id: loadId });
    }
  };

  // 3. RENDER
  const filteredDrivers = drivers.filter(d => 
    d.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.phone?.includes(searchTerm)
  );

  return (
    <div className="dm-container">
      <style>{`
        .dm-container { padding: 20px; font-family: 'Inter', sans-serif; color: #1e293b; background: #f8fafc; min-height: 100vh; }
        .dm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .dm-title { font-size: 24px; fontWeight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .dm-search-box { position: relative; width: 300px; }
        .dm-search-input { width: 100%; padding: 10px 10px 10px 40px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; }
        .dm-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .dm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
        .dm-card { background: white; border: 1px solid #e2e8f0; borderRadius: 16px; padding: 20px; transition: 0.2s; }
        .dm-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .dm-user-info { display: flex; gap: 15px; margin-bottom: 15px; }
        .dm-avatar { width: 50px; height: 50px; background: #eff6ff; color: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; }
        .dm-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; borderRadius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 5px; }
        .bg-pending { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }
        .bg-active { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
        .bg-blocked { background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5; }
        .dm-footer { border-top: 1px solid #f1f5f9; padding-top: 15px; display: flex; justify-content: flex-end; gap: 10px; }
        .btn { padding: 8px 16px; borderRadius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-approve { background: #16a34a; color: white; }
        .btn-approve:hover { background: #15803d; }
        .btn-block { background: white; border: 1px solid #ef4444; color: #ef4444; }
        .btn-block:hover { background: #fef2f2; }
      `}</style>

      <div className="dm-header">
        <div className="dm-title"><Bike size={28} /> Quản lý Tài xế ({filteredDrivers.length})</div>
        <div className="dm-search-box">
          <Search size={18} className="dm-search-icon" />
          <input className="dm-search-input" placeholder="Tìm tên, SĐT..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{textAlign:'center', marginTop: 50}}><Loader2 className="animate-spin" size={32}/></div>
      ) : (
        <div className="dm-grid">
          {filteredDrivers.map(driver => (
            <div key={driver.id} className="dm-card">
              <div className="dm-user-info">
                <div className="dm-avatar">{driver.fullName ? driver.fullName.charAt(0) : 'D'}</div>
                <div>
                  <div style={{fontWeight: 700, fontSize: 16}}>{driver.fullName}</div>
                  <div style={{fontSize: 13, color: '#64748b', marginTop: 4}}><Phone size={12} style={{display:'inline'}}/> {driver.phone}</div>
                  
                  {driver.status === 'PENDING' && <span className="dm-badge bg-pending">Chờ duyệt</span>}
                  {driver.status === 'ACTIVE' && <span className="dm-badge bg-active">Đang hoạt động</span>}
                  {driver.status === 'BLOCKED' && <span className="dm-badge bg-blocked">Đã khóa</span>}
                </div>
              </div>

              <div className="dm-footer">
                {driver.status === 'PENDING' && (
                  <button className="btn btn-approve" onClick={() => handleApprove(driver.id)}>
                    <ShieldCheck size={16}/> Duyệt ngay
                  </button>
                )}
                {driver.status === 'ACTIVE' && (
                  <button className="btn btn-block" onClick={() => handleBlock(driver.id)}>
                    <Lock size={16}/> Khóa TK
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverManager;
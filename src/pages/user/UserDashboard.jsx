import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Gift, LogOut, MapPin, Phone } from 'lucide-react';
import api from '../../api/axios'; // Nhớ import api để gọi dữ liệu user nếu cần

// --- IMPORT COMPONENT NHIỆM VỤ ---
import MissionHunting from './MissionHunting'; 

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('missions'); // Mặc định vào tab nhiệm vụ xem cho sướng
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    if (!userInfo) navigate('/login');
    // Có thể gọi API lấy thông tin mới nhất của user tại đây nếu muốn
  }, [userInfo, navigate]);

  const handleLogout = () => {
    if(window.confirm("Đăng xuất?")) {
        localStorage.removeItem('user');
        navigate('/login');
    }
  };

  // --- COMPONENT CON: HỒ SƠ ---
  const UserProfile = () => (
    <div className="card">
        <h3 style={{marginBottom: 20}}>Hồ sơ cá nhân</h3>
        <div style={{display:'flex', flexDirection:'column', gap:15}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
                <User size={20} color="#3b82f6"/> 
                <div>
                    <span style={{fontSize:13, color:'#6b7280'}}>Họ tên</span>
                    <div style={{fontWeight:600}}>{userInfo?.fullName}</div>
                </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
                <Phone size={20} color="#3b82f6"/> 
                <div>
                    <span style={{fontSize:13, color:'#6b7280'}}>Số điện thoại</span>
                    <div style={{fontWeight:600}}>{userInfo?.phone || 'Chưa cập nhật'}</div>
                </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
                <MapPin size={20} color="#3b82f6"/> 
                <div>
                    <span style={{fontSize:13, color:'#6b7280'}}>Địa chỉ</span>
                    <div style={{fontWeight:600}}>{userInfo?.address || 'Chưa cập nhật'}</div>
                </div>
            </div>
        </div>
    </div>
  );

  if (!userInfo) return null;

  return (
    <div className="user-dashboard-wrapper">
      <style>{`
        .user-dashboard-wrapper { display: flex; min-height: 100vh; background: #f3f4f6; font-family: 'Inter', sans-serif; }
        
        /* Sidebar Styles */
        .u-sidebar { width: 260px; background: white; padding: 24px; display: flex; flex-direction: column; border-right: 1px solid #e5e7eb; position: sticky; top: 0; height: 100vh; }
        .u-profile-summary { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f3f4f6; }
        .u-avatar { width: 80px; height: 80px; background: #eff6ff; color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; margin: 0 auto 12px; border: 4px solid #dbeafe; }
        .u-name { font-weight: 700; color: #111827; font-size: 16px; }
        
        .u-menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; color: #4b5563; cursor: pointer; font-weight: 600; margin-bottom: 6px; transition: all 0.2s; }
        .u-menu-item:hover { background: #f9fafb; color: #111827; }
        .u-active { background: #eff6ff !important; color: #2563eb !important; }

        /* Main Content */
        .u-content { flex: 1; padding: 32px; overflow-y: auto; }
        .u-header { margin-bottom: 24px; }
        .u-title { font-size: 24px; font-weight: 800; color: #1f2937; }
        
        .card { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
      `}</style>

      {/* SIDEBAR */}
      <aside className="u-sidebar">
        <div className="u-profile-summary">
            <div className="u-avatar">{userInfo.fullName?.charAt(0).toUpperCase()}</div>
            <div className="u-name">{userInfo.fullName}</div>
            <div style={{fontSize:12, color:'#9ca3af', marginTop:4}}>Thành viên thân thiết</div>
        </div>

        <div className={`u-menu-item ${activeTab === 'profile' ? 'u-active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={20}/> Hồ sơ của tôi
        </div>
        <div className={`u-menu-item ${activeTab === 'orders' ? 'u-active' : ''}`} onClick={() => navigate('/history')}>
            <ShoppingBag size={20}/> Lịch sử đơn hàng
        </div>
        
        {/* TAB NHIỆM VỤ */}
        <div className={`u-menu-item ${activeTab === 'missions' ? 'u-active' : ''}`} onClick={() => setActiveTab('missions')}>
            <Gift size={20}/> Săn Thưởng
        </div>

        <div className="u-menu-item" onClick={handleLogout} style={{marginTop:'auto', color:'#ef4444'}}>
            <LogOut size={20}/> Đăng xuất
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="u-content">
        <div className="u-header">
            <h1 className="u-title">
                {activeTab === 'profile' && 'Thông tin tài khoản'}
                {activeTab === 'missions' && 'Nhiệm vụ & Quà tặng'}
            </h1>
        </div>

        {activeTab === 'profile' && <UserProfile />}
        
        {/* HIỂN THỊ COMPONENT NHIỆM VỤ */}
        {activeTab === 'missions' && <MissionHunting />}
      </main>
    </div>
  );
};

export default UserDashboard;
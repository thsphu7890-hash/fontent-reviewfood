import React, { useEffect, useState } from 'react';
import { User, ShoppingBag, Gift, CreditCard, ChevronRight, Star, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Lấy thông tin User
      const userRes = await api.get('api/users/profile');
      setUser(userRes.data);

      // 2. Lấy đơn hàng gần nhất (chỉ lấy 3 đơn đầu)
      const orderRes = await api.get('api/orders/my-orders');
      setRecentOrders(orderRes.data.slice(0, 3));
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
      toast.error("Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Đăng xuất thành công");
    navigate('/login');
  };

  if (loading) return <div className="p-10 text-center">Đang tải thông tin...</div>;

  return (
    <div className="dashboard-container">
      {/* Header Profile */}
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-circle">
            {user?.avatar ? <img src={user.avatar} alt="avatar" /> : <User size={40} />}
          </div>
          <div className="user-info">
            <h2>{user?.fullName || user?.username}</h2>
            <p className="badge">Thành viên Bạc</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout"><LogOut size={18} /> Đăng xuất</button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/history')}>
          <div className="icon-box bg-blue"><ShoppingBag size={24} /></div>
          <div>
            <h3>{recentOrders.length}</h3>
            <p>Đơn hàng</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/mission')}>
          <div className="icon-box bg-orange"><Gift size={24} /></div>
          <div>
            <h3>12</h3>
            <p>Điểm thưởng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-box bg-green"><CreditCard size={24} /></div>
          <div>
            <h3>0 đ</h3>
            <p>Ví tiền</p>
          </div>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="menu-section">
        <h3>Tiện ích</h3>
        <div className="menu-grid">
            <div className="menu-item" onClick={() => navigate('/mission')}>
                <Star size={20} color="#eab308" />
                <span>Nhiệm vụ săn quà</span>
                <ChevronRight size={16} className="arrow" />
            </div>
            <div className="menu-item" onClick={() => navigate('/history')}>
                <Clock size={20} color="#3b82f6" />
                <span>Lịch sử đơn hàng</span>
                <ChevronRight size={16} className="arrow" />
            </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders">
        <h3>Đơn hàng gần đây</h3>
        {recentOrders.length === 0 ? (
            <p className="empty-text">Chưa có đơn hàng nào</p>
        ) : (
            recentOrders.map(order => (
                <div key={order.id} className="order-item">
                    <div className="order-info">
                        <h4>Đơn #{order.id}</h4>
                        <span className={`status ${order.status}`}>{order.status}</span>
                    </div>
                    <div className="order-price">
                        {order.totalPrice?.toLocaleString()} đ
                    </div>
                </div>
            ))
        )}
      </div>

      <style>{`
        .dashboard-container { max-width: 800px; margin: 0 auto; padding: 20px; background: #f8fafc; min-height: 100vh; }
        .profile-header { display: flex; justify-content: space-between; align-items: center; background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .avatar-section { display: flex; align-items: center; gap: 15px; }
        .avatar-circle { width: 60px; height: 60px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
        .user-info h2 { margin: 0; font-size: 18px; }
        .badge { background: #cbd5e1; font-size: 12px; padding: 2px 8px; border-radius: 10px; color: #475569; display: inline-block; margin-top: 4px; }
        .btn-logout { background: none; border: 1px solid #ef4444; color: #ef4444; padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: transform 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .stat-card:hover { transform: translateY(-3px); }
        .icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .bg-blue { background: #3b82f6; } .bg-orange { background: #f97316; } .bg-green { background: #22c55e; }
        .stat-card h3 { margin: 0; font-size: 18px; }
        .stat-card p { margin: 0; font-size: 12px; color: #64748b; }

        .menu-section { background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px; }
        .menu-section h3, .recent-orders h3 { margin: 0 0 15px 0; font-size: 16px; color: #334155; }
        .menu-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; cursor: pointer; }
        .menu-item:last-child { border-bottom: none; }
        .menu-item span { flex: 1; font-weight: 500; color: #334155; }
        .arrow { color: #cbd5e1; }

        .recent-orders { background: white; border-radius: 15px; padding: 20px; }
        .order-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .order-info h4 { margin: 0 0 4px 0; font-size: 14px; }
        .status { font-size: 12px; padding: 2px 8px; border-radius: 4px; background: #eee; }
        .order-price { font-weight: bold; color: #ef4444; }
      `}</style>
    </div>
  );
};

export default UserDashboard;
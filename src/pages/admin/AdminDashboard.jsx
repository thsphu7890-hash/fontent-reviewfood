import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Utensils, Store, 
  LogOut, Layers, Users, ShieldAlert, ShoppingBag,
  MessageSquare, TrendingUp, Ticket, 
  Truck,       // Icon cho quản lý tài xế
  Navigation,  // Icon cho nút chuyển trang
  Home,        // Icon cho nút về trang chủ
  Trophy       // Icon cho quản lý nhiệm vụ
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

// --- IMPORT THƯ VIỆN BIỂU ĐỒ ---
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';

// Import các Component con
import RestaurantManager from './RestaurantManager';
import FoodManager from './FoodManager';
import CategoryManager from './CategoryManager';
import UserManager from './UserManager';
import OrderManager from './OrderManager';
import ReviewManager from './ReviewManager';
import VoucherManager from './VoucherManager';
import DriverManager from './DriverManager'; 
import MissionManager from './MissionManager'; // Import MissionManager

const AdminDashboard = ({ tab }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab || 'dashboard');
  
  // State thống kê
  const [stats, setStats] = useState({ 
      restaurants: 0, categories: 0, foods: 0, users: 0, orders: 0 
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || "";

  // Dữ liệu giả lập cho biểu đồ
  const dataRevenue = [
    { name: 'T1', total: 40000000 }, { name: 'T2', total: 30000000 },
    { name: 'T3', total: 20000000 }, { name: 'T4', total: 27800000 },
    { name: 'T5', total: 18900000 }, { name: 'T6', total: 23900000 },
    { name: 'T7', total: 34900000 },
  ];

  const dataOrders = [
    { name: 'T2', orders: 40, cancel: 2 }, { name: 'T3', orders: 30, cancel: 1 },
    { name: 'T4', orders: 20, cancel: 0 }, { name: 'T5', orders: 27, cancel: 3 },
    { name: 'T6', orders: 18, cancel: 1 }, { name: 'T7', orders: 23, cancel: 2 },
    { name: 'CN', orders: 34, cancel: 4 },
  ];

  const formatCurrency = (value) => {
    if(value >= 1000000) return `${(value / 1000000).toFixed(1)}Tr`;
    return value.toLocaleString('vi-VN');
  };

  // FETCH THỐNG KÊ
  useEffect(() => {
    if (!user || (role !== 'ADMIN' && role !== 'ROLE_ADMIN')) return;

    const fetchStats = async () => {
      try {
        const [resRes, catRes, foodRes, userRes, orderRes] = await Promise.all([
          api.get('/restaurants'),
          api.get('/categories'),
          api.get('/foods'),
          api.get('/users'),
          api.get('/orders') 
        ]);
        
        setStats({
          restaurants: resRes.data?.length || 0,
          categories: catRes.data?.length || 0,
          foods: Array.isArray(foodRes.data) ? foodRes.data.length : (foodRes.data?.content?.length || 0),
          users: userRes.data?.length || 0,
          orders: orderRes.data?.length || 0
        });
      } catch (err) {
        console.error("Lỗi lấy thống kê:", err);
      }
    };

    if (activeTab === 'dashboard') fetchStats();
  }, [activeTab, role, user]);

  const handleLogout = () => {
    if (window.confirm("Bạn muốn đăng xuất khỏi hệ thống?")) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // KIỂM TRA QUYỀN
  if (!user || (role !== 'ADMIN' && role !== 'ROLE_ADMIN')) {
    return (
      <div className="access-denied">
        <ShieldAlert size={80} color="#ef4444" />
        <h1>TRUY CẬP BỊ TỪ CHỐI</h1>
        <p>Bạn không có quyền quản trị viên để vào trang này.</p>
        <button onClick={() => navigate('/')}>Quay về trang chủ</button>
      </div>
    );
  }

  // RENDER NỘI DUNG CHÍNH
  const renderContent = () => {
    switch (activeTab) {
      case 'restaurants': return <RestaurantManager />;
      case 'foods': return <FoodManager />;
      case 'categories': return <CategoryManager />;
      case 'users': return <UserManager />;
      case 'orders': return <OrderManager />;
      case 'reviews': return <ReviewManager />;
      case 'vouchers': return <VoucherManager />;
      case 'drivers': return <DriverManager />; 
      case 'missions': return <MissionManager />; // Thêm case MissionManager
      case 'dashboard':
      default:
        return (
          <div className="dashboard-view">
            <header className="content-header">
              <h2 className="content-title">Bảng điều khiển</h2>
              <p>Chào mừng trở lại, <b>{user.fullName || 'Quản trị viên'}</b></p>
            </header>
            
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Tổng doanh thu</span>
                  <p className="stat-val">194.5Tr</p>
                </div>
                <div className="stat-icon bg-blue"><TrendingUp size={24} /></div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Đơn hàng</span>
                  <p className="stat-val">{stats.orders}</p>
                </div>
                <div className="stat-icon bg-red"><ShoppingBag size={24} /></div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Nhà hàng</span>
                  <p className="stat-val">{stats.restaurants}</p>
                </div>
                <div className="stat-icon bg-orange"><Store size={24} /></div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Người dùng</span>
                  <p className="stat-val">{stats.users}</p>
                </div>
                <div className="stat-icon bg-green"><Users size={24} /></div>
              </div>
            </div>

            <div className="charts-container">
              <div className="chart-box main-chart">
                <h3 className="chart-title">Biểu đồ doanh thu (VNĐ)</h3>
                <div style={{ width: '100%', height: 300, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataRevenue}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-box">
                <h3 className="chart-title">Trạng thái đơn hàng</h3>
                <div style={{ width: '100%', height: 300, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataOrders}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} />
                      <Legend iconType="circle" />
                      <Bar dataKey="orders" name="Thành công" fill="#10b981" radius={[4, 4, 0, 0]} barSize={15} />
                      <Bar dataKey="cancel" name="Đã hủy" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={15} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-wrapper">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .admin-wrapper { display: flex; min-height: 100vh; background: #f8fafc; width: 100%; font-family: 'Inter', sans-serif; }
        
        /* Sidebar */
        .admin-sidebar { width: 260px; background: #0f172a; color: #94a3b8; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
        .admin-logo { padding: 32px 24px; font-size: 20px; font-weight: 800; color: #fff; border-bottom: 1px solid #1e293b; }
        .admin-logo span { color: #f43f5e; }
        .nav-list { flex: 1; padding: 20px 12px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; border-radius: 8px; font-size: 14px; font-weight: 500; transition: 0.2s; margin-bottom: 4px; }
        .nav-item:hover { background: #1e293b; color: #fff; }
        .nav-active { background: #f43f5e !important; color: #fff !important; }
        .nav-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #475569; margin: 20px 16px 8px; font-weight: 700; }
        
        /* Content */
        .admin-content { flex: 1; padding: 32px; overflow-y: auto; }
        .content-title { font-size: 28px; font-weight: 800; color: #0f172a; }
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin: 32px 0; }
        .stat-card { background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .stat-label { font-size: 13px; color: #64748b; font-weight: 600; }
        .stat-val { font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 4px; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .bg-blue { background: #eff6ff; color: #3b82f6; }
        .bg-red { background: #fff1f2; color: #f43f5e; }
        .bg-orange { background: #fff7ed; color: #f97316; }
        .bg-green { background: #f0fdf4; color: #22c55e; }

        /* Charts */
        .charts-container { display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; }
        .chart-box { background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; }
        .chart-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 24px; }

        /* Access Denied */
        .access-denied { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: #fff; padding: 20px; }
        .access-denied h1 { margin: 20px 0 10px; font-size: 32px; font-weight: 900; }
        .access-denied button { padding: 12px 30px; background: #0f172a; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; margin-top: 24px; }

        @media (max-width: 1024px) { .charts-container { grid-template-columns: 1fr; } }
      `}</style>

      <aside className="admin-sidebar">
        <div className="admin-logo">FOOD<span>HUB</span></div>
        <div className="nav-list">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'nav-active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} /> Tổng quan
          </div>

          <p className="nav-label">Quản lý</p>
          <div className={`nav-item ${activeTab === 'orders' ? 'nav-active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ShoppingBag size={18} /> Đơn hàng
          </div>
          <div className={`nav-item ${activeTab === 'restaurants' ? 'nav-active' : ''}`} onClick={() => setActiveTab('restaurants')}>
            <Store size={18} /> Nhà hàng
          </div>
          <div className={`nav-item ${activeTab === 'foods' ? 'nav-active' : ''}`} onClick={() => setActiveTab('foods')}>
            <Utensils size={18} /> Món ăn
          </div>
          <div className={`nav-item ${activeTab === 'categories' ? 'nav-active' : ''}`} onClick={() => setActiveTab('categories')}>
            <Layers size={18} /> Danh mục
          </div>
          <div className={`nav-item ${activeTab === 'vouchers' ? 'nav-active' : ''}`} onClick={() => setActiveTab('vouchers')}>
            <Ticket size={18} /> Mã giảm giá
          </div>
          <div className={`nav-item ${activeTab === 'missions' ? 'nav-active' : ''}`} onClick={() => setActiveTab('missions')}>
            <Trophy size={18} /> Quản lý Nhiệm vụ
          </div>

          <p className="nav-label">Cài đặt</p>
          <div className={`nav-item ${activeTab === 'drivers' ? 'nav-active' : ''}`} onClick={() => setActiveTab('drivers')}>
            <Truck size={18} /> Quản lý Tài xế
          </div>
          
          <div className={`nav-item ${activeTab === 'users' ? 'nav-active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={18} /> Người dùng
          </div>
          <div className={`nav-item ${activeTab === 'reviews' ? 'nav-active' : ''}`} onClick={() => setActiveTab('reviews')}>
            <MessageSquare size={18} /> Đánh giá
          </div>

          {/* --- KHU VỰC CHUYỂN ĐỔI GIAO DIỆN --- */}
          <p className="nav-label">Chế độ xem</p>
          <div className="nav-item" onClick={() => navigate('/driver/dashboard')} style={{color: '#60a5fa'}}>
            <Navigation size={18} /> Giao diện Tài xế
          </div>
          <div className="nav-item" onClick={() => navigate('/')} style={{color: '#34d399'}}>
            <Home size={18} /> Trang chủ Khách hàng
          </div>
          {/* ------------------------------------ */}

          <div className="nav-item" onClick={handleLogout} style={{ marginTop: '20px', color: '#f43f5e' }}>
            <LogOut size={18} /> Đăng xuất
          </div>
        </div>
      </aside>

      <main className="admin-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
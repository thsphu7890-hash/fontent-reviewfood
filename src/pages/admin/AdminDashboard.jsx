import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Utensils, Store, LogOut, Layers, Users, 
  ShieldAlert, ShoppingBag, Ticket, Truck, 
  Home, Trophy, Bell, Search, Menu,
  ArrowUpRight, CreditCard, Sparkles, MessageSquare, Calendar, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// --- IMPORT API ---
import api from '../../api/axios'; 

// --- CHART LIBRARIES ---
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

// --- IMPORT CÁC COMPONENT QUẢN LÝ (Đảm bảo file tồn tại) ---
import RestaurantManager from './RestaurantManager';
import FoodManager from './FoodManager';
import CategoryManager from './CategoryManager';
import UserManager from './UserManager';
import OrderManager from './OrderManager';
import ReviewManager from './ReviewManager';
import VoucherManager from './VoucherManager';
import DriverManager from './DriverManager'; 
import MissionManager from './MissionManager';
import EventManagement from './EventManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); 
  const [loading, setLoading] = useState(false);

  // --- DATA STATE ---
  const [stats, setStats] = useState({ restaurants: 0, categories: 0, foods: 0, users: 0, orders: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  // --- KIỂM TRA QUYỀN ADMIN ---
  // Lấy user từ localStorage (hoặc Context nếu bạn dùng)
  const user = JSON.parse(localStorage.getItem('user'));
  // Kiểm tra Role linh hoạt (chấp nhận cả "ADMIN" và "ROLE_ADMIN")
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

  // --- LOGIC XỬ LÝ DỮ LIỆU BIỂU ĐỒ ---
  const processChartData = (orders) => {
    if (!orders || orders.length === 0) {
        setRevenueData([]);
        setStatusData([]);
        return;
    }

    // 1. Biểu đồ Tròn (Trạng thái)
    const statusCount = orders.reduce((acc, order) => {
      const status = order.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusMapping = {
      'COMPLETED': { name: 'Thành công', color: '#10b981' },
      'DELIVERING': { name: 'Đang giao', color: '#3b82f6' },
      'CANCELLED':  { name: 'Đã hủy', color: '#ef4444' },
      'PENDING':    { name: 'Chờ xử lý', color: '#f59e0b' },
      'CONFIRMED':  { name: 'Đã nhận', color: '#8b5cf6' }
    };

    const pieData = Object.keys(statusCount).map(key => {
      const config = statusMapping[key] || { name: key, color: '#94a3b8' };
      return { name: config.name, value: statusCount[key], color: config.color };
    });
    setStatusData(pieData);

    // 2. Biểu đồ Doanh thu (7 ngày gần nhất)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    const revenueMap = {};
    orders.forEach(order => {
      // Chỉ tính đơn thành công
      if (['COMPLETED', 'DONE'].includes(order.status)) {
        const dateKey = new Date(order.createdAt || order.orderDate).toLocaleDateString('vi-VN');
        revenueMap[dateKey] = (revenueMap[dateKey] || 0) + (order.totalPrice || 0);
      }
    });

    const areaData = last7Days.map(date => {
      const dateKey = date.toLocaleDateString('vi-VN');
      const dayLabel = date.toLocaleDateString('vi-VN', { weekday: 'short' }); // T2, T3...
      // Chia cho 1 triệu để số đẹp hơn
      const totalMillion = (revenueMap[dateKey] || 0) / 1000000; 
      
      return {
        name: dayLabel,
        fullDate: dateKey,
        total: parseFloat(totalMillion.toFixed(2))
      };
    });
    setRevenueData(areaData);
  };

  // --- GỌI API ---
  useEffect(() => {
    if (activeTab !== 'dashboard') return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Gọi song song các API đếm số lượng
        const [res, cat, food, usr, ord] = await Promise.all([
          api.get('/restaurants').catch(() => ({ data: [] })), // catch lẻ để tránh sập toàn bộ nếu 1 cái lỗi
          api.get('/categories').catch(() => ({ data: [] })),
          api.get('/foods').catch(() => ({ data: { content: [] } })),
          api.get('/users').catch(() => ({ data: [] })),
          api.get('/orders').catch(() => ({ data: [] }))
        ]);

        setStats({
          restaurants: res.data?.length || 0,
          categories: cat.data?.length || 0,
          foods: food.data?.content?.length || food.data?.length || 0,
          users: usr.data?.length || 0,
          orders: ord.data?.length || 0
        });

        processChartData(ord.data || []);

      } catch (error) {
        console.error("Dashboard Error:", error);
        if (error.response?.status === 401) {
            toast.error("Phiên đăng nhập hết hạn");
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeTab, navigate]);

  // --- XỬ LÝ ĐĂNG XUẤT (QUAN TRỌNG VỚI SESSION) ---
  const handleLogout = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
    
    try {
        // 1. Gọi API để Server hủy Session
        await api.post('/users/logout'); 
    } catch (error) {
        console.error("Lỗi logout server:", error);
    } finally {
        // 2. Xóa dữ liệu Client và chuyển trang
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Nếu còn sót lại
        toast.success("Đã đăng xuất");
        navigate('/login');
    }
  };

  // --- RENDER COMPONENT CON ---
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
      case 'missions': return <MissionManager />;
      case 'events': return <EventManagement />;
      default: return renderDashboardHome();
    }
  };

  // --- DASHBOARD HOME VIEW ---
  const renderDashboardHome = () => (
    <div className="dashboard-content animate-fade-in">
      {/* Header Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Xin chào, Quản trị viên <Sparkles size={24} className="inline-icon" fill="#fbbf24" color="#fbbf24"/></h1>
          <p>Tổng quan tình hình kinh doanh hôm nay.</p>
        </div>
        <div className="header-actions">
           {/* Nút giả lập bộ lọc */}
          <div className="time-filter">
            <button className={timeRange === 'week' ? 'active' : ''} onClick={() => setTimeRange('week')}>Tuần này</button>
            <button className={timeRange === 'month' ? 'active' : ''} onClick={() => setTimeRange('month')}>Tháng này</button>
          </div>
          <button className="btn-report"><Calendar size={16}/> Xuất báo cáo</button>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: 50, color: '#64748b'}}>
            <Loader2 className="animate-spin" size={40} style={{margin: '0 auto 10px'}}/>
            <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
            {/* Stats Cards */}
            <div className="stats-grid">
                {[
                { label: 'DOANH THU', val: `${revenueData.reduce((a,b)=>a+b.total,0).toFixed(1)} Tr`, sub: 'Tổng thu thực tế', icon: <CreditCard />, color: 'blue-bg' },
                { label: 'ĐƠN HÀNG', val: stats.orders, sub: 'Toàn hệ thống', icon: <ShoppingBag />, color: 'red-bg' },
                { label: 'NHÀ HÀNG', val: stats.restaurants, sub: 'Đối tác hoạt động', icon: <Store />, color: 'orange-bg' },
                { label: 'NGƯỜI DÙNG', val: stats.users, sub: 'Thành viên', icon: <Users />, color: 'teal-bg' }
                ].map((item, idx) => (
                <div key={idx} className="stat-card">
                    <div className={`icon-wrapper ${item.color}`}>{item.icon}</div>
                    <div className="stat-info">
                    <span className="label">{item.label}</span>
                    <h3 className="value">{item.val}</h3>
                    <span className="trend positive"><ArrowUpRight size={14}/> {item.sub}</span>
                    </div>
                </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="charts-wrapper">
                {/* Area Chart */}
                <div className="chart-box main-chart">
                <div className="card-header">
                    <h3>Biểu đồ doanh thu (7 ngày)</h3>
                </div>
                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                        <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                            formatter={(val) => [`${val} Triệu`, 'Doanh thu']}
                        />
                        <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} fill="url(#colorRev)" activeDot={{r: 6}} />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
                </div>

                {/* Pie Chart */}
                <div className="chart-box pie-chart">
                <h3>Trạng thái đơn hàng</h3>
                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                        data={statusData} 
                        innerRadius={60} 
                        outerRadius={90} 
                        paddingAngle={5} 
                        dataKey="value" 
                        >
                        {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>
            </div>
        </>
      )}
    </div>
  );

  // --- MÀN HÌNH TỪ CHỐI (Nếu không phải Admin) ---
  if (!user || !isAdmin) {
    return (
      <div className="denied-screen">
        <ShieldAlert size={80} color="#ef4444" />
        <h1>TRUY CẬP BỊ TỪ CHỐI</h1>
        <p>Tài khoản <b>{user?.username}</b> không có quyền truy cập trang quản trị.</p>
        <div style={{display:'flex', gap: 10}}>
            <button onClick={() => navigate('/')} className="btn-back">Về trang chủ</button>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn-logout">Đăng nhập lại</button>
        </div>
        <style>{`
            .denied-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; font-family: 'Inter', sans-serif; }
            .denied-screen h1 { color: #ef4444; margin: 20px 0 10px; }
            .btn-back { padding: 10px 20px; background: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
            .btn-logout { padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* GLOBAL STYLES (Giữ nguyên CSS của bạn nhưng gom gọn lại) */}
      <style>{`
        .admin-layout { display: flex; min-height: 100vh; background: #F8FAFC; color: #1e293b; font-family: 'Inter', sans-serif; overflow: hidden; }
        
        /* SIDEBAR */
        .sidebar { 
            width: ${isSidebarOpen ? '260px' : '80px'}; 
            background: #fff; border-right: 1px solid #e2e8f0; 
            display: flex; flex-direction: column; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: sticky; top: 0; height: 100vh; z-index: 100; box-shadow: 4px 0 24px rgba(0,0,0,0.02);
        }
        .logo-box { height: 70px; display: flex; align-items: center; justify-content: ${isSidebarOpen ? 'space-between' : 'center'}; padding: 0 20px; border-bottom: 1px solid #f1f5f9; }
        .logo-text { font-size: 20px; font-weight: 800; display: ${isSidebarOpen ? 'block' : 'none'}; }
        .logo-text span { color: #ef4444; }
        .toggle-btn { cursor: pointer; color: #64748b; padding: 5px; border-radius: 6px; }
        
        .nav-list { flex: 1; overflow-y: auto; padding: 20px 10px; scrollbar-width: none; }
        .nav-group-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin: 15px 10px 5px; display: ${isSidebarOpen ? 'block' : 'none'}; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; border-radius: 10px; cursor: pointer; color: #64748b; font-weight: 500; transition: 0.2s; justify-content: ${isSidebarOpen ? 'flex-start' : 'center'}; }
        .nav-item:hover { background: #f1f5f9; color: #1e293b; }
        .nav-item.active { background: #fef2f2; color: #ef4444; font-weight: 700; }
        .nav-label { white-space: nowrap; display: ${isSidebarOpen ? 'block' : 'none'}; }

        /* MAIN CONTENT */
        .main-viewport { flex: 1; display: flex; flex-direction: column; overflow: hidden; height: 100vh; }
        .top-bar { height: 70px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; flex-shrink: 0; }
        .search-admin { display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 8px 16px; border-radius: 30px; width: 300px; border: 1px solid #e2e8f0; }
        .search-admin input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; }
        
        .content-scroll { flex: 1; overflow-y: auto; padding: 30px; scrollbar-width: none; }
        
        /* DASHBOARD */
        .welcome-banner { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
        .header-actions { display: flex; gap: 10px; }
        .btn-report { background: #1e293b; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer; }
        
        .time-filter { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 4px; display: flex; }
        .time-filter button { border: none; background: transparent; padding: 6px 12px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; border-radius: 6px; }
        .time-filter button.active { background: #f1f5f9; color: #1e293b; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .blue-bg { background: #eff6ff; color: #3b82f6; }
        .red-bg { background: #fef2f2; color: #ef4444; }
        .orange-bg { background: #fff7ed; color: #f97316; }
        .teal-bg { background: #f0fdfa; color: #14b8a6; }
        .stat-info .value { font-size: 22px; font-weight: 800; margin: 2px 0; color: #1e293b; }
        .trend { font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 2px; }
        .trend.positive { color: #10b981; }

        .charts-wrapper { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .chart-box { background: #fff; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; }

        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>

      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="logo-box">
          <div className="logo-text">ADMIN<span>PANEL</span></div>
          <Menu className="toggle-btn" size={20} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>

        <div className="nav-list">
          <p className="nav-group-title">Tổng quan</p>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> <span className="nav-label">Dashboard</span>
          </div>

          <p className="nav-group-title">Quản lý cửa hàng</p>
          {[
            { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Đơn hàng' },
            { id: 'restaurants', icon: <Store size={20} />, label: 'Nhà hàng' },
            { id: 'foods', icon: <Utensils size={20} />, label: 'Món ăn' },
            { id: 'categories', icon: <Layers size={20} />, label: 'Danh mục' }
          ].map(item => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              {item.icon} <span className="nav-label">{item.label}</span>
            </div>
          ))}

          <p className="nav-group-title">Người dùng & Hệ thống</p>
          {[
            { id: 'users', icon: <Users size={20} />, label: 'Khách hàng' },
            { id: 'drivers', icon: <Truck size={20} />, label: 'Tài xế' },
            { id: 'missions', icon: <Trophy size={20} />, label: 'Nhiệm vụ' },
            { id: 'vouchers', icon: <Ticket size={20} />, label: 'Vouchers' },
            { id: 'events', icon: <Calendar size={20} />, label: 'Sự kiện' },
            { id: 'reviews', icon: <MessageSquare size={20} />, label: 'Đánh giá' }
          ].map(item => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              {item.icon} <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{padding: 15, borderTop: '1px solid #f1f5f9'}}>
            <div className="nav-item" onClick={() => navigate('/')} style={{color: '#10b981'}}>
                <Home size={20}/> <span className="nav-label">Xem Website</span>
            </div>
            <div className="nav-item" onClick={handleLogout} style={{color: '#ef4444', marginTop: 5}}>
                <LogOut size={20}/> <span className="nav-label">Đăng xuất</span>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="main-viewport">
        {/* Top Header */}
        <div className="top-bar">
            <div className="search-admin">
                <Search size={16} color="#94a3b8"/>
                <input placeholder="Tìm kiếm nhanh (Ctrl+K)..." />
            </div>
            <div className="admin-profile">
                <div className="notif-btn">
                    <Bell size={20} color="#64748b"/>
                    <span className="dot"></span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap: 10}}>
                    <div className="avatar" style={{width: 36, height: 36, background: '#ef4444', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                        {user?.fullName?.charAt(0) || 'A'}
                    </div>
                    <div style={{fontSize: 13}}>
                        <div style={{fontWeight: 600}}>{user?.fullName || 'Admin'}</div>
                        <div style={{color: '#64748b', fontSize: 11}}>{user?.role}</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Body */}
        <div className="content-scroll">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
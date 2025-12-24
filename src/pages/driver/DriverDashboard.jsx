import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import { 
  MapPin, Navigation, Package, CheckCircle, Loader, 
  History, Wallet, Clock, Store, LayoutDashboard, LogOut, 
  ToggleLeft, ToggleRight, Moon, Sun, Bell, Star, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- COMPONENT CON: BẢN ĐỒ GIẢ LẬP ---
const MiniMap = ({ address }) => (
    <div className="mini-map">
        <div className="map-overlay">
            <MapPin size={32} color="#ef4444" className="map-pin-icon"/>
            <span className="map-label">{address}</span>
        </div>
        <img src="https://image.maps.ls.hereapi.com/mia/1.6/mapview?apiKey=YOUR_API_KEY&c=10.762622,106.660172&z=14" 
             onError={(e) => e.target.src='https://placehold.co/600x200/e2e8f0/94a3b8?text=Map+View'}
             alt="Map" className="map-img"/>
    </div>
);

// --- COMPONENT CON: BIỂU ĐỒ THỐNG KÊ ---
const StatsCard = ({ title, value, icon, color }) => (
    <div className="stats-card">
        <div className="stats-icon" style={{background: `${color}20`, color: color}}>{icon}</div>
        <div>
            <div className="stats-val" style={{color: color}}>{value}</div>
            <div className="stats-title">{title}</div>
        </div>
    </div>
);

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('AVAILABLE'); 
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true); // Trạng thái Online/Offline
  const [darkMode, setDarkMode] = useState(false); // Chế độ tối

  const user = JSON.parse(localStorage.getItem('user'));
  const SHIP_FEE = 15000;

  // --- ÂM THANH THÔNG BÁO ---
  const playSound = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    
    // Giả lập socket: Cứ 10s quét đơn mới 1 lần nếu đang Online
    const interval = setInterval(() => {
        if(isOnline && activeTab === 'AVAILABLE') fetchData(false);
    }, 10000);

    fetchData(true);
    return () => clearInterval(interval);
  }, [activeTab, isOnline]);

  const fetchData = async (showLoading = true) => {
    if(showLoading) setLoading(true);
    try {
        if (activeTab === 'AVAILABLE') {
            const res = await api.get('/driver/available-orders');
            // Kiểm tra an toàn trước khi so sánh length
            const list = Array.isArray(res.data) ? res.data : [];
            if(list.length > orders.length) playSound();
            setOrders(list);
        } else if (activeTab === 'SHIPPING') {
            const res = await api.get(`/driver/my-current-order/${user.id}`);
            
            // 🔥 FIX LỖI MAP: Kiểm tra nếu data là Object thì gói vào mảng, nếu Array thì giữ nguyên
            if (Array.isArray(res.data)) {
                setMyOrders(res.data);
            } else if (res.data && typeof res.data === 'object') {
                setMyOrders([res.data]); // Gói object vào mảng
            } else {
                setMyOrders([]); // Nếu null hoặc rỗng thì set mảng rỗng
            }

        } else {
            const res = await api.get(`/driver/history/${user.id}`);
            const list = Array.isArray(res.data) ? res.data : [];
            setHistory(list.filter(o => o.status === 'DELIVERED'));
        }
    } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        // Reset về mảng rỗng để tránh crash giao diện
        if(activeTab === 'AVAILABLE') setOrders([]);
        if(activeTab === 'SHIPPING') setMyOrders([]);
        if(activeTab === 'HISTORY') setHistory([]);
    } finally {
        if(showLoading) setLoading(false);
    }
  };

  const handleAccept = async (orderId) => {
    if(!isOnline) return alert("Vui lòng BẬT trạng thái hoạt động để nhận đơn!");
    if (window.confirm("Bạn chắc chắn muốn nhận đơn này?")) {
        try {
            await api.post(`/driver/accept?orderId=${orderId}&driverId=${user.id}`);
            alert("Đã nhận đơn! Chuyển sang mục 'Đang giao'.");
            setActiveTab('SHIPPING');
        } catch (err) {
            alert(err.response?.data || "Lỗi nhận đơn");
            fetchData();
        }
    }
  };

  const handleComplete = async (orderId) => {
    if (window.confirm("Xác nhận giao hàng thành công?")) {
        try {
            await api.post(`/driver/complete?orderId=${orderId}`);
            alert("Hoàn tất! +15.000đ vào ví.");
            fetchData();
        } catch (err) {
            alert("Lỗi cập nhật");
        }
    }
  };

  const handleLogout = () => {
    if(window.confirm("Đăng xuất?")) {
        localStorage.removeItem('user');
        navigate('/login');
    }
  };

  const totalIncome = history.length * SHIP_FEE;
  
  // Tính toán thống kê
  const acceptanceRate = useMemo(() => {
      const total = history.length + 5; // Giả lập tổng đơn
      return Math.round((history.length / total) * 100) || 100;
  }, [history]);

  return (
    <div className={`web-driver-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <style>{`
        /* --- CORE STYLES --- */
        * { box-sizing: border-box; }
        .web-driver-wrapper { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; color: #0f172a; transition: 0.3s; }
        
        /* --- DARK MODE --- */
        .web-driver-wrapper.dark-mode { background: #0f172a; color: #f1f5f9; }
        .dark-mode .sidebar { background: #1e293b; border-color: #334155; }
        .dark-mode .user-name { color: #f1f5f9; }
        .dark-mode .menu-item:hover { background: #334155; color: #fff; }
        .dark-mode .order-card { background: #1e293b; border-color: #334155; }
        .dark-mode .order-id, .dark-mode .info-row { color: #cbd5e1; }
        .dark-mode .page-title { color: #fff; }
        .dark-mode .history-table-container { background: #1e293b; border-color: #334155; }
        .dark-mode .history-table th { background: #334155; color: #cbd5e1; border-color: #475569; }
        .dark-mode .history-table td { border-color: #334155; color: #cbd5e1; }

        /* --- SIDEBAR --- */
        .sidebar { width: 280px; background: white; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 50; transition: 0.3s; }
        .profile-section { padding: 30px 24px; text-align: center; }
        .avatar-circle { width: 80px; height: 80px; background: #eff6ff; color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 24px; font-weight: bold; border: 4px solid #dbeafe; }
        .user-name { font-weight: 800; font-size: 18px; color: #0f172a; margin-bottom: 5px; }
        .user-role { font-size: 11px; color: #64748b; background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-weight: 700; letter-spacing: 0.5px; }

        /* STATUS TOGGLE */
        .status-toggle { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 15px; cursor: pointer; padding: 10px; border-radius: 12px; background: #f0f9ff; transition: 0.2s; }
        .status-toggle.offline { background: #fef2f2; }
        .status-text { font-weight: 700; font-size: 14px; }
        .st-online { color: #10b981; } .st-offline { color: #ef4444; }

        .menu-list { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }
        .menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; cursor: pointer; color: #64748b; font-weight: 600; transition: 0.2s; }
        .menu-item:hover { background: #f8fafc; color: #0f172a; }
        .menu-item.active { background: #eff6ff; color: #2563eb; }

        .wallet-card { margin: 20px; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3); }
        .wallet-label { font-size: 12px; opacity: 0.9; margin-bottom: 5px; }
        .wallet-amount { font-size: 24px; font-weight: 800; }

        /* --- MAIN CONTENT --- */
        .main-content { flex: 1; margin-left: 280px; padding: 30px; }
        .top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .page-title { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
        .page-subtitle { color: #64748b; margin-top: 5px; font-size: 14px; }
        
        .top-actions { display: flex; gap: 15px; }
        .action-btn { width: 40px; height: 40px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: 0.2s; }
        .action-btn:hover { background: #f1f5f9; color: #0f172a; }
        .dark-mode .action-btn { background: #1e293b; border-color: #334155; }

        /* STATS BAR */
        .stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stats-card { background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; }
        .dark-mode .stats-card { background: #1e293b; border-color: #334155; }
        .stats-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .stats-val { font-weight: 800; font-size: 18px; }
        .stats-title { font-size: 12px; color: #64748b; font-weight: 600; }

        /* ORDERS GRID */
        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .order-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; transition: 0.2s; position: relative; overflow: hidden; display: flex; flex-direction: column; }
        .order-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -10px rgba(0,0,0,0.1); border-color: #93c5fd; }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed #e2e8f0; }
        .order-id { font-weight: 700; color: #334155; font-size: 16px; }
        .order-fee { background: #ecfdf5; color: #059669; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 700; }
        
        .info-row { display: flex; gap: 12px; margin-bottom: 12px; font-size: 14px; color: #475569; line-height: 1.5; }
        .info-icon { flex-shrink: 0; margin-top: 2px; }

        /* MINI MAP */
        .mini-map { height: 120px; border-radius: 10px; overflow: hidden; position: relative; margin: 15px 0; border: 1px solid #e2e8f0; }
        .map-img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(0.2); }
        .map-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .map-label { background: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-top: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 90%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #000; }

        .btn-action { width: 100%; padding: 12px; border-radius: 10px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: auto; transition: 0.2s; }
        .btn-accept { background: #2563eb; color: white; } .btn-accept:hover { background: #1d4ed8; }
        .btn-finish { background: #10b981; color: white; } .btn-finish:hover { background: #059669; }

        /* HISTORY TABLE */
        .history-table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .history-table { width: 100%; border-collapse: collapse; }
        .history-table th { background: #f8fafc; text-align: left; padding: 16px; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
        .history-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #ecfdf5; color: #059669; border-radius: 20px; font-size: 12px; font-weight: 600; }

        .center-msg { text-align: center; padding: 60px; color: #94a3b8; }
        .loading-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="profile-section">
            <div className="avatar-circle">
                {user?.fullName?.charAt(0).toUpperCase() || "T"}
            </div>
            <div className="user-name">{user?.fullName || "Tài xế"}</div>
            
            {/* NÚT ONLINE/OFFLINE */}
            <div className={`status-toggle ${!isOnline ? 'offline' : ''}`} onClick={() => setIsOnline(!isOnline)}>
                {isOnline ? <ToggleRight size={24} color="#10b981"/> : <ToggleLeft size={24} color="#ef4444"/>}
                <span className={`status-text ${isOnline ? 'st-online' : 'st-offline'}`}>
                    {isOnline ? "ĐANG HOẠT ĐỘNG" : "TẠM NGHỈ"}
                </span>
            </div>
        </div>

        <nav className="menu-list">
            <div className={`menu-item ${activeTab === 'AVAILABLE' ? 'active' : ''}`} onClick={() => setActiveTab('AVAILABLE')}>
                <Navigation size={20}/> Săn đơn mới
                {orders.length > 0 && <span style={{marginLeft:'auto', background:'#ef4444', color:'white', fontSize:10, padding:'2px 6px', borderRadius:10}}>{orders.length}</span>}
            </div>
            <div className={`menu-item ${activeTab === 'SHIPPING' ? 'active' : ''}`} onClick={() => setActiveTab('SHIPPING')}>
                <Package size={20}/> Đơn đang giao
                {myOrders.length > 0 && <span style={{marginLeft:'auto', background:'#3b82f6', color:'white', fontSize:10, padding:'2px 6px', borderRadius:10}}>{myOrders.length}</span>}
            </div>
            <div className={`menu-item ${activeTab === 'HISTORY' ? 'active' : ''}`} onClick={() => setActiveTab('HISTORY')}>
                <History size={20}/> Lịch sử hoạt động
            </div>
            <div className="menu-item" onClick={handleLogout} style={{marginTop: 'auto', color: '#ef4444'}}>
                <LogOut size={20}/> Đăng xuất
            </div>
        </nav>

        <div className="wallet-card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                    <div className="wallet-label">Thu nhập hôm nay</div>
                    <div className="wallet-amount">{totalIncome.toLocaleString()}đ</div>
                </div>
                <Wallet size={32} style={{opacity: 0.8}}/>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="main-content">
        <div className="top-bar">
            <div>
                <h1 className="page-title">
                    {activeTab === 'AVAILABLE' && "Săn Đơn Hàng Mới"}
                    {activeTab === 'SHIPPING' && "Đơn Hàng Đang Giao"}
                    {activeTab === 'HISTORY' && "Lịch Sử Hoạt Động"}
                </h1>
                <p className="page-subtitle">
                    {!isOnline ? "Bạn đang offline. Bật trạng thái để nhận đơn nhé." : "Hệ thống đang tìm kiếm đơn hàng gần bạn..."}
                </p>
            </div>
            
            <div className="top-actions">
                <button className="action-btn" onClick={() => setDarkMode(!darkMode)} title="Chế độ tối">
                    {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
                </button>
                <button className="action-btn" title="Thông báo">
                    <Bell size={20}/>
                </button>
            </div>
        </div>

        {/* STATS BAR (Luôn hiện) */}
        <div className="stats-bar">
            <StatsCard title="Tỉ lệ nhận đơn" value={`${acceptanceRate}%`} icon={<TrendingUp size={20}/>} color="#2563eb" />
            <StatsCard title="Đánh giá" value="4.9 ⭐" icon={<Star size={20}/>} color="#f59e0b" />
            <StatsCard title="Đơn hoàn thành" value={history.length} icon={<CheckCircle size={20}/>} color="#10b981" />
        </div>

        {loading ? (
            <div className="center-msg"><Loader className="loading-spin" size={40}/></div>
        ) : (
            <>
                {/* VIEW 1 & 2: GRID CARD CHO ĐƠN HÀNG */}
                {(activeTab === 'AVAILABLE' || activeTab === 'SHIPPING') && (
                    <>
                        {!isOnline && activeTab === 'AVAILABLE' ? (
                            <div className="center-msg">
                                <LogOut size={60} style={{marginBottom:20, opacity:0.2}}/>
                                <p>Bạn đang offline. Hãy bật trạng thái để nhận đơn.</p>
                            </div>
                        ) : (
                            <div className="orders-grid">
                                {(activeTab === 'AVAILABLE' ? orders : myOrders).length > 0 ? (
                                    (activeTab === 'AVAILABLE' ? orders : myOrders).map(order => (
                                        <div key={order.id} className="order-card">
                                            <div className="card-header">
                                                <div className="order-id">Đơn #{order.id}</div>
                                                <div className="order-fee">+{SHIP_FEE.toLocaleString()}đ</div>
                                            </div>
                                            
                                            <div className="info-row">
                                                <Store className="info-icon" size={18} color="#ef4444"/>
                                                <div>
                                                    <strong>{order.restaurantName || "Nhà hàng"}</strong>
                                                    <div style={{fontSize:13, opacity:0.7}}>{order.restaurantAddress}</div>
                                                </div>
                                            </div>

                                            {/* MINI MAP GIẢ LẬP */}
                                            <MiniMap address={order.address} />

                                            <div className="info-row">
                                                <MapPin className="info-icon" size={18} color="#10b981"/>
                                                <div>
                                                    <strong>{order.customerName || "Khách hàng"}</strong>
                                                    <div style={{fontSize:13, opacity:0.7}}>{order.address}</div>
                                                </div>
                                            </div>

                                            {activeTab === 'SHIPPING' && (
                                                <div className="info-row" style={{marginTop:10, padding:10, background: darkMode ? '#334155' : '#f8fafc', borderRadius:8}}>
                                                    <Package className="info-icon" size={18} color="#3b82f6"/>
                                                    <div style={{fontWeight:600}}>
                                                        Thu hộ (COD): <span style={{color:'#ef4444', fontSize:16}}>{order.totalAmount?.toLocaleString()}đ</span>
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'AVAILABLE' ? (
                                                <button className="btn-action btn-accept" onClick={() => handleAccept(order.id)}>
                                                    <Navigation size={18}/> NHẬN ĐƠN NGAY
                                                </button>
                                            ) : (
                                                <button className="btn-action btn-finish" onClick={() => handleComplete(order.id)}>
                                                    <CheckCircle size={18}/> XÁC NHẬN ĐÃ GIAO
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="center-msg" style={{gridColumn: '1 / -1'}}>
                                        <LayoutDashboard size={60} style={{marginBottom:20, opacity:0.2}}/>
                                        <p>Chưa có đơn hàng nào.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* VIEW 3: TABLE CHO LỊCH SỬ */}
                {activeTab === 'HISTORY' && (
                    <div className="history-table-container">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Thời gian</th>
                                    <th>Chi tiết</th>
                                    <th>Thu nhập</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? history.map(order => (
                                    <tr key={order.id}>
                                        <td><strong>#{order.id}</strong></td>
                                        <td style={{opacity:0.8}}>
                                            <div style={{display:'flex', alignItems:'center', gap:5}}>
                                                <Clock size={14}/> {new Date(order.createdAt).toLocaleString('vi-VN')}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{fontWeight:600}}>{order.restaurantName}</div>
                                            <div style={{fontSize:12, opacity:0.7}}>To: {order.address}</div>
                                        </td>
                                        <td style={{color:'#10b981', fontWeight:700}}>+{SHIP_FEE.toLocaleString()}đ</td>
                                        <td>
                                            <span className="status-badge"><CheckCircle size={12}/> Hoàn thành</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="center-msg">Chưa có lịch sử giao hàng.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </>
        )}
      </main>
    </div>
  );
};

export default DriverDashboard;
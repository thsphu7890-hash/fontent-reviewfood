import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  MapPin, Navigation, Clock, CheckCircle, Package, 
  RefreshCw, Bike, DollarSign, User, LogOut, Phone, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [driverInfo, setDriverInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('driverInfo');
    if (!stored) {
       navigate('/driver/login', { replace: true });
       return;
    }
    setDriverInfo(JSON.parse(stored));
  }, [navigate]);

  const CURRENT_DRIVER_ID = driverInfo?.id;

  const fetchOrders = async () => {
    if (!CURRENT_DRIVER_ID) return;
    setLoading(true);
    try {
      let endpoint = '';
      // Logic API (Giả định BE đã có các endpoint này)
      if (activeTab === 'available') endpoint = '/driver/available-orders';
      else if (activeTab === 'current') endpoint = `/driver/my-current-order/${CURRENT_DRIVER_ID}`;
      else endpoint = `/driver/history/${CURRENT_DRIVER_ID}`; // History

      const res = await api.get(endpoint);
      // Đảm bảo data luôn là mảng
      setOrders(Array.isArray(res.data) ? res.data : []); 
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [activeTab, CURRENT_DRIVER_ID]);

  // --- ACTIONS ---
  const handleAcceptOrder = async (orderId) => {
    if (!window.confirm("Bạn chắc chắn muốn nhận đơn này?")) return;
    try {
        await api.put(`/driver/accept/${orderId}/${CURRENT_DRIVER_ID}`);
        toast.success("Đã nhận đơn! Hãy di chuyển đến nhà hàng.");
        setActiveTab('current'); // Chuyển ngay sang tab Đang giao
    } catch (error) {
        toast.error(error.response?.data || "Lỗi nhận đơn");
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm("Xác nhận đã giao hàng thành công?")) return;
    try {
        await api.put(`/driver/complete/${orderId}`);
        toast.success("Tuyệt vời! Đơn hàng đã hoàn thành.");
        fetchOrders(); // Reload lại
    } catch (error) {
        toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleOpenMap = (address) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const handleLogout = () => {
    if (window.confirm("Bạn muốn đăng xuất?")) {
      localStorage.removeItem('driverInfo');
      navigate('/driver/login');
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  if (!driverInfo) return null;

  // --- STYLES ---
  const s = {
    wrapper: { minHeight: '100vh', background: '#0f172a', color: 'white', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px', fontFamily: "'Inter', sans-serif" },
    header: { background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '30px 20px', borderRadius: '0 0 30px 30px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', position: 'sticky', top: 0, zIndex: 50 },
    profileBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    avatar: { width: '56px', height: '56px', background: 'linear-gradient(45deg, #6366f1, #8b5cf6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' },
    info: { flex: 1, marginLeft: '15px' },
    name: { margin: 0, fontSize: '18px', fontWeight: '700' },
    plate: { margin: 0, color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' },
    walletBox: { background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' },
    tabs: { display: 'flex', background: '#1e293b', padding: '6px', borderRadius: '16px', margin: '25px 20px', gap: '6px', position: 'sticky', top: '130px', zIndex: 40, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', border: 'none', background: active ? '#6366f1' : 'transparent', color: active ? 'white' : '#94a3b8', cursor: 'pointer', borderRadius: '12px', fontWeight: '700', fontSize: '13px', transition: '0.3s' }),
    card: { background: '#1e293b', margin: '0 20px 20px', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', animation: 'slideUp 0.3s ease-out' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '15px' },
    row: { display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '14px', alignItems: 'flex-start' },
    actionBtn: (type) => ({ width: '100%', padding: '16px', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', marginTop: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: type === 'accept' ? 'linear-gradient(to right, #6366f1, #8b5cf6)' : type === 'complete' ? 'linear-gradient(to right, #10b981, #059669)' : '#334155', color: 'white', fontSize: '15px', transition: 'transform 0.2s' }),
    empty: { textAlign: 'center', padding: '60px 20px', color: '#64748b' }
  };

  return (
    <div style={s.wrapper}>
      {/* 1. Header */}
      <div style={s.header}>
        <div style={s.profileBox}>
          <div style={{display:'flex', alignItems:'center'}}>
            <div style={s.avatar}>{driverInfo.fullName.charAt(0)}</div>
            <div style={s.info}>
              <h3 style={s.name}>{driverInfo.fullName}</h3>
              <p style={s.plate}><Bike size={14}/> {driverInfo.licensePlate} • <span style={{color:'#10b981'}}>Online</span></p>
            </div>
          </div>
          <button onClick={handleLogout} style={{background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '12px', cursor:'pointer'}}><LogOut size={20}/></button>
        </div>
        
        <div style={s.walletBox}>
          <div>
            <div style={{fontSize:'12px', color:'#94a3b8', marginBottom:'4px'}}>Thu nhập hôm nay</div>
            <div style={{fontSize:'24px', fontWeight:'800', color:'#10b981'}}>850.000₫</div>
          </div>
          <button onClick={fetchOrders} style={{background: 'rgba(255,255,255,0.1)', border:'none', width:'40px', height:'40px', borderRadius:'10px', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
            <RefreshCw size={20} className={loading ? "animate-spin" : ""}/>
          </button>
        </div>
      </div>

      {/* 2. Tabs */}
      <div style={s.tabs}>
        {[
          { key: 'available', label: 'Săn Đơn', icon: Package },
          { key: 'current', label: 'Đang Giao', icon: Bike },
          { key: 'history', label: 'Lịch Sử', icon: Clock }
        ].map(t => (
          <button key={t.key} style={s.tabBtn(activeTab === t.key)} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 3. Order List */}
      <div>
        {loading ? (
          <div style={s.empty}>Đang tải dữ liệu...</div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <span style={{background:'#334155', padding:'4px 8px', borderRadius:'6px', fontSize:'12px', fontWeight:'bold'}}>#{order.id}</span>
                  <span style={{marginLeft:'10px', fontSize:'13px', color:'#94a3b8'}}>{order.items?.length || 1} món</span>
                </div>
                <div style={{color: '#6366f1', fontWeight: '800', fontSize: '16px'}}>{formatPrice(order.totalAmount)}</div>
              </div>

              {/* Pickup Info */}
              <div style={s.row} onClick={() => handleOpenMap(order.restaurantAddress)}>
                <div style={{minWidth:'24px', textAlign:'center'}}><StoreIcon color="#f59e0b"/></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'12px', color:'#94a3b8', marginBottom:'2px'}}>Lấy hàng tại</div>
                  <div style={{fontWeight:'600'}}>{order.restaurantName || "Nhà hàng đối tác"}</div>
                  <div style={{fontSize:'13px', color:'#94a3b8', marginTop:'2px'}}>{order.restaurantAddress}</div>
                </div>
              </div>

              {/* Dropoff Info */}
              <div style={s.row} onClick={() => handleOpenMap(order.address)}>
                <div style={{minWidth:'24px', textAlign:'center'}}><Navigation size={20} color="#10b981"/></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'12px', color:'#94a3b8', marginBottom:'2px'}}>Giao đến</div>
                  <div style={{fontWeight:'600'}}>{order.customerName} • {order.phone}</div>
                  <div style={{fontSize:'13px', color:'#94a3b8', marginTop:'2px'}}>{order.address}</div>
                </div>
                <button style={{background:'rgba(16,185,129,0.15)', border:'none', width:'36px', height:'36px', borderRadius:'50%', color:'#10b981', display:'flex', alignItems:'center', justifyContent:'center'}} onClick={(e) => { e.stopPropagation(); window.open(`tel:${order.phone}`); }}>
                    <Phone size={18}/>
                </button>
              </div>

              {/* Actions */}
              {activeTab === 'available' && (
                <button style={s.actionBtn('accept')} onClick={() => handleAcceptOrder(order.id)}>
                  NHẬN ĐƠN NGAY <ArrowRightIcon/>
                </button>
              )}
              
              {activeTab === 'current' && (
                <button style={s.actionBtn('complete')} onClick={() => handleCompleteOrder(order.id)}>
                  <CheckCircle size={20}/> XÁC NHẬN GIAO THÀNH CÔNG
                </button>
              )}

              {activeTab === 'history' && (
                <div style={{marginTop:'15px', padding:'10px', background:'rgba(255,255,255,0.05)', borderRadius:'10px', textAlign:'center', fontSize:'13px', color:'#94a3b8'}}>
                  {order.status === 'COMPLETED' ? <span style={{color:'#10b981'}}>Đã giao thành công</span> : <span style={{color:'#ef4444'}}>Đã hủy</span>}
                  {' • '}{new Date(order.updatedAt || Date.now()).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={s.empty}>
            <Package size={64} style={{opacity:0.2, marginBottom:'15px'}}/>
            <p>Hiện chưa có đơn hàng nào.</p>
            {activeTab === 'available' && <p style={{fontSize:'13px', marginTop:'5px'}}>Hãy kiên nhẫn chờ nhé bác tài!</p>}
          </div>
        )}
      </div>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// Mini Icons Components to keep code clean
const StoreIcon = ({color}) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM9 9h6v6H9z"/></svg>
);
const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);

export default DriverDashboard;
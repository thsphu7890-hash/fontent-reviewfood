import React, { useState, useEffect } from 'react';
import { 
  Package, Clock, CheckCircle, XCircle, Truck, 
  ShoppingBag, Calendar, Phone, Star, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import ReviewFormModal from '../components/ReviewFormModal'; 

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);

  // Hàm lấy Token an toàn (Tìm mọi ngóc ngách)
  const getTokenSafe = () => {
      return localStorage.getItem('token') || 
             (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).token);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Gọi API (Axios sẽ tự lấy token gửi đi)
      const res = await api.get('/api/orders/my-orders');
      
      const sortedOrders = Array.isArray(res.data) 
        ? res.data.sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
        : [];
        
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
      
      // Chỉ đá về login nếu Backend thực sự trả về 401 (Hết hạn hoặc Sai token)
      if (error.response && error.response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.clear(); // Xóa sạch để đăng nhập lại từ đầu
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn muốn hủy đơn hàng này?")) return;
    try {
      await api.put(`/api/orders/${orderId}/cancel`);
      toast.success("Đã hủy đơn hàng");
      fetchOrders(); 
    } catch (error) {
      toast.error(error.response?.data || "Không thể hủy đơn hàng này");
    }
  };

  useEffect(() => {
    // 👇 KIỂM TRA KỸ HƠN: Tìm token ở cả 2 chỗ trước khi đá về login
    const token = getTokenSafe();
    
    if (!token) {
        // Chưa đăng nhập thật sự
        navigate('/login');
        return;
    }
    
    // Nếu có token thì gọi API
    fetchOrders();
  }, []);

  // --- Helpers & UI ---
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';
  const getImg = (img) => img ? (img.startsWith('http') ? img : `http://localhost:8080${img}`) : "https://placehold.co/100";
  
  const getStatusInfo = (s) => {
      if(s === 'PENDING') return {text:'Chờ xác nhận', color:'#eab308', bg:'#fef9c3', icon:<Clock size={16}/>};
      if(s === 'CONFIRMED') return {text:'Đang chuẩn bị', color:'#3b82f6', bg:'#eff6ff', icon:<Package size={16}/>};
      if(s === 'DELIVERING') return {text:'Đang giao', color:'#0ea5e9', bg:'#e0f2fe', icon:<Truck size={16}/>};
      if(s === 'COMPLETED') return {text:'Hoàn thành', color:'#22c55e', bg:'#dcfce7', icon:<CheckCircle size={16}/>};
      if(s === 'CANCELLED') return {text:'Đã hủy', color:'#ef4444', bg:'#fee2e2', icon:<XCircle size={16}/>};
      return {text:s, color:'#64748b', bg:'#f1f5f9', icon:<Package size={16}/>};
  };

  const handleOpenReview = (item, orderId) => {
    setSelectedItemForReview({ ...item, orderId });
    setReviewModalOpen(true);
  };

  return (
    <div style={{background:'#f8fafc', minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      <Header />
      
      <div style={{maxWidth:800, margin:'30px auto', width:'100%', padding:'0 15px', flex:1}}>
        <h2 style={{fontSize:24, fontWeight:800, color:'#1e293b', marginBottom:20}}>Lịch sử đơn hàng</h2>
        
        {loading ? (
             <div style={{textAlign:'center', padding:60, color:'#64748b'}}>
                <Loader2 className="animate-spin" style={{margin:'0 auto 10px'}}/> 
                Đang tải dữ liệu...
                <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
             </div>
        ) : orders.length > 0 ? (
            orders.map(order => {
              const status = getStatusInfo(order.status);
              return (
                <div key={order.id} style={{background:'white', padding:20, borderRadius:16, marginBottom:20, border:'1px solid #e2e8f0', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.05)'}}>
                  
                  {/* Header Card */}
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:15, paddingBottom:15, borderBottom:'1px solid #f1f5f9'}}>
                    <div style={{fontWeight:700, color:'#334155', display:'flex', alignItems:'center', gap:8}}>
                        <ShoppingBag size={18} color="#ef4444"/> Đơn hàng #{order.id}
                    </div>
                    <div>
                        <div style={{fontSize:11, color:'#94a3b8', textAlign:'right', marginBottom:4}}>
                            {formatDate(order.createdAt || order.orderDate)}
                        </div>
                        <div style={{background:status.bg, color:status.color, padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:5, justifyContent:'flex-end'}}>
                           {status.icon} {status.text}
                        </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{display:'flex', gap:15, marginBottom:15}}>
                        <img src={getImg(item.image)} style={{width:60, height:60, borderRadius:8, objectFit:'cover', border:'1px solid #e2e8f0'}} onError={(e)=>e.target.src="https://placehold.co/100"}/>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600, color:'#334155'}}>{item.foodName}</div>
                          <div style={{fontSize:13, color:'#64748b'}}>x{item.quantity} • {formatPrice(item.price)}</div>
                          
                          {/* Review Button */}
                          {order.status === 'COMPLETED' && !item.isReviewed && (
                             <button onClick={() => handleOpenReview(item, order.id)} style={{marginTop:5, fontSize:12, color:'#ef4444', background:'white', border:'1px solid #ef4444', padding:'4px 10px', borderRadius:4, cursor:'pointer', display:'flex', alignItems:'center', gap:4}}>
                                <Star size={12}/> Đánh giá
                             </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Card */}
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:15, paddingTop:15, borderTop:'1px solid #f1f5f9'}}>
                      <div style={{fontSize:14, color:'#64748b'}}>Tổng tiền: <span style={{fontSize:18, fontWeight:700, color:'#ef4444'}}>{formatPrice(order.totalAmount || order.totalPrice)}</span></div>
                      
                      <div style={{display:'flex', gap:10}}>
                         {order.status === 'PENDING' && (
                           <button onClick={() => handleCancelOrder(order.id)} style={{padding:'8px 16px', background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:6, fontWeight:600, cursor:'pointer'}}>Hủy đơn</button>
                         )}
                         <button onClick={() => navigate(`/order/${order.id}`)} style={{padding:'8px 16px', background:'white', border:'1px solid #cbd5e1', color:'#475569', borderRadius:6, fontWeight:600, cursor:'pointer'}}>Chi tiết</button>
                      </div>
                  </div>

                </div>
              );
            })
        ) : (
            <div style={{textAlign:'center', padding:60, color:'#94a3b8'}}>
               <ShoppingBag size={48} style={{opacity:0.2, marginBottom:15}}/>
               <p>Bạn chưa có đơn hàng nào.</p>
               <button onClick={()=>navigate('/')} style={{marginTop:15, padding:'10px 20px', background:'#ef4444', color:'white', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer'}}>Đặt món ngay</button>
            </div>
        )}
      </div>

      <Footer />

      <ReviewFormModal 
        isOpen={reviewModalOpen} 
        onClose={() => setReviewModalOpen(false)}
        orderItem={selectedItemForReview}
        onSuccess={fetchOrders}
      />
    </div>
  );
};

export default OrderHistory;
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Clock, CheckCircle, XCircle, Truck, 
  ShoppingBag, Calendar, ArrowRight, Star, Filter, AlertCircle
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
  const [activeTab, setActiveTab] = useState('ALL'); // State cho bộ lọc
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);

  // Hàm lấy Token an toàn
  const getTokenSafe = () => {
      return localStorage.getItem('token') || 
             (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).token);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders/my-orders');
      const sortedOrders = Array.isArray(res.data) 
        ? res.data.sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
        : [];
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
      if (error.response && error.response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn.");
          localStorage.clear();
          navigate('/login');
      }
    } finally {
      // Giả lập delay một chút để thấy hiệu ứng Skeleton (có thể bỏ trong thực tế)
      setTimeout(() => setLoading(false), 500);
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
    const token = getTokenSafe();
    if (!token) {
        navigate('/login');
        return;
    }
    fetchOrders();
  }, []);

  // --- LOGIC LỌC ĐƠN HÀNG ---
  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    if (activeTab === 'PENDING') return orders.filter(o => ['PENDING', 'CONFIRMED', 'DELIVERING'].includes(o.status));
    if (activeTab === 'COMPLETED') return orders.filter(o => o.status === 'COMPLETED');
    if (activeTab === 'CANCELLED') return orders.filter(o => o.status === 'CANCELLED');
    return orders;
  }, [orders, activeTab]);

  // --- HELPERS ---
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'}) : '';
  const getImg = (img) => img ? (img.startsWith('http') ? img : `http://localhost:8080${img}`) : "https://placehold.co/100";
  
  const getStatusInfo = (s) => {
      if(s === 'PENDING') return {text:'Chờ xác nhận', color:'#b45309', bg:'#fef3c7', icon:<Clock size={14}/>};
      if(s === 'CONFIRMED') return {text:'Đang chuẩn bị', color:'#1d4ed8', bg:'#dbeafe', icon:<Package size={14}/>};
      if(s === 'DELIVERING') return {text:'Đang giao hàng', color:'#0369a1', bg:'#e0f2fe', icon:<Truck size={14}/>};
      if(s === 'COMPLETED') return {text:'Giao thành công', color:'#15803d', bg:'#dcfce7', icon:<CheckCircle size={14}/>};
      if(s === 'CANCELLED') return {text:'Đã hủy', color:'#b91c1c', bg:'#fee2e2', icon:<XCircle size={14}/>};
      return {text:s, color:'#475569', bg:'#f1f5f9', icon:<AlertCircle size={14}/>};
  };

  const handleOpenReview = (item, orderId) => {
    setSelectedItemForReview({ ...item, orderId });
    setReviewModalOpen(true);
  };

  // --- SKELETON COMPONENT (Hiệu ứng khi đang tải) ---
  const OrderSkeleton = () => (
    <div className="order-card skeleton-card">
      <div className="skeleton-header">
        <div className="sk-line sk-w-40"></div>
        <div className="sk-line sk-w-20"></div>
      </div>
      <div className="skeleton-body">
        <div className="sk-square"></div>
        <div className="sk-content">
            <div className="sk-line sk-w-60"></div>
            <div className="sk-line sk-w-30"></div>
        </div>
      </div>
      <div className="skeleton-footer">
         <div className="sk-line sk-w-30"></div>
         <div className="sk-btn"></div>
      </div>
    </div>
  );

  return (
    <div className="history-page">
      <style>{`
        .history-page { background-color: #F8FAFC; min-height: 100vh; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; }
        .history-container { max-width: 900px; margin: 0 auto; width: 100%; padding: 40px 20px; flex: 1; }
        
        .page-title { font-size: 28px; font-weight: 800; color: #1e293b; margin-bottom: 24px; display: flex; alignItems: center; gap: 10px; }
        
        /* TABS */
        .tabs-container { display: flex; gap: 10px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
        .tabs-container::-webkit-scrollbar { display: none; }
        .tab-btn { 
            padding: 10px 20px; border-radius: 99px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: 0.2s; border: 1px solid transparent; 
            background: white; color: #64748b; border-color: #e2e8f0;
        }
        .tab-btn:hover { background: #f1f5f9; }
        .tab-btn.active { background: #1e293b; color: white; border-color: #1e293b; box-shadow: 0 4px 10px rgba(30, 41, 59, 0.2); }

        /* ORDER CARD */
        .order-card { background: white; border-radius: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0; overflow: hidden; transition: 0.2s; }
        .order-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border-color: #cbd5e1; }
        
        .card-header { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fcfcfc; }
        .order-id { font-weight: 700; color: #334155; display: flex; align-items: center; gap: 8px; font-size: 15px; }
        .order-date { font-size: 13px; color: #94a3b8; text-align: right; }
        
        .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

        .card-body { padding: 20px; }
        .order-item { display: flex; gap: 16px; margin-bottom: 16px; }
        .item-img { width: 70px; height: 70px; border-radius: 10px; object-fit: cover; border: 1px solid #f1f5f9; }
        .item-info { flex: 1; }
        .item-name { font-weight: 600; color: #1e293b; font-size: 15px; margin-bottom: 4px; }
        .item-meta { font-size: 13px; color: #64748b; }
        .review-btn { margin-top: 8px; font-size: 12px; color: #ef4444; background: #fff1f2; border: 1px solid #fecdd3; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: 0.2s; }
        .review-btn:hover { background: #ef4444; color: white; border-color: #ef4444; }

        .card-footer { padding: 16px 20px; background: #f8fafc; border-top: 1px dashed #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
        .total-price { display: flex; flex-direction: column; }
        .total-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .total-value { font-size: 20px; fontWeight: 800; color: #ef4444; }

        .action-group { display: flex; gap: 10px; }
        .btn { padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-cancel { background: #fff; border: 1px solid #ef4444; color: #ef4444; }
        .btn-cancel:hover { background: #fff1f2; }
        .btn-detail { background: #1e293b; color: white; }
        .btn-detail:hover { background: #334155; }

        /* EMPTY STATE */
        .empty-state { text-align: center; padding: 80px 20px; color: #94a3b8; }
        .empty-icon { opacity: 0.2; margin-bottom: 20px; }
        .btn-home { margin-top: 20px; padding: 12px 24px; background: #ef4444; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s; }
        .btn-home:hover { background: #dc2626; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }

        /* SKELETON ANIMATION */
        .skeleton-card { height: 200px; padding: 20px; }
        .sk-line { height: 12px; background: #f1f5f9; border-radius: 6px; margin-bottom: 10px; }
        .sk-square { width: 70px; height: 70px; background: #f1f5f9; border-radius: 10px; }
        .skeleton-body { display: flex; gap: 15px; margin-top: 20px; }
        .skeleton-header { display: flex; justify-content: space-between; }
        .sk-w-40 { width: 40%; height: 20px; } .sk-w-20 { width: 20%; } .sk-w-60 { width: 60%; } .sk-w-30 { width: 30%; }
        .skeleton-footer { margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
        .sk-btn { width: 100px; height: 36px; background: #f1f5f9; border-radius: 8px; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .skeleton-card * { animation: pulse 1.5s infinite ease-in-out; }

        @media (max-width: 640px) {
            .card-header, .card-footer { flex-direction: column; align-items: flex-start; gap: 10px; }
            .status-badge { align-self: flex-start; margin-top: 5px; }
            .action-group { width: 100%; }
            .btn { flex: 1; justify-content: center; }
            .order-date { text-align: left; }
        }
      `}</style>

      <Header />
      
      <div className="history-container">
        <h2 className="page-title"><ShoppingBag size={32} className="text-rose-500"/> Lịch sử đơn hàng</h2>
        
        {/* TABS FILTER */}
        <div className="tabs-container">
            {[
                {id: 'ALL', label: 'Tất cả đơn'},
                {id: 'PENDING', label: 'Đang xử lý'},
                {id: 'COMPLETED', label: 'Hoàn thành'},
                {id: 'CANCELLED', label: 'Đã hủy'}
            ].map(tab => (
                <button 
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
        
        {/* CONTENT */}
        {loading ? (
             <div className="skeleton-container">
                 {[1,2,3].map(i => <OrderSkeleton key={i}/>)}
             </div>
        ) : filteredOrders.length > 0 ? (
            <div className="orders-list">
                {filteredOrders.map(order => {
                    const status = getStatusInfo(order.status);
                    return (
                        <div key={order.id} className="order-card">
                            
                            {/* Header */}
                            <div className="card-header">
                                <div>
                                    <div className="order-id">
                                        Đơn hàng #{order.id}
                                    </div>
                                    <div className="order-date">{formatDate(order.createdAt || order.orderDate)}</div>
                                </div>
                                <div className="status-badge" style={{background: status.bg, color: status.color}}>
                                    {status.icon} {status.text}
                                </div>
                            </div>

                            {/* Body: Items */}
                            <div className="card-body">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="order-item">
                                        <img 
                                            src={getImg(item.image)} 
                                            className="item-img" 
                                            alt={item.foodName}
                                            onError={(e)=>e.target.src="https://placehold.co/100"}
                                        />
                                        <div className="item-info">
                                            <div className="item-name">{item.foodName}</div>
                                            <div className="item-meta">
                                                Số lượng: <b>{item.quantity}</b> • Giá: {formatPrice(item.price)}
                                            </div>
                                            
                                            {/* Nút đánh giá */}
                                            {order.status === 'COMPLETED' && !item.isReviewed && (
                                                <button className="review-btn" onClick={() => handleOpenReview(item, order.id)}>
                                                    <Star size={14}/> Viết đánh giá
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer: Action & Total */}
                            <div className="card-footer">
                                <div className="total-price">
                                    <span className="total-label">Tổng thanh toán</span>
                                    <span className="total-value">{formatPrice(order.totalAmount || order.totalPrice)}</span>
                                </div>
                                
                                <div className="action-group">
                                    {order.status === 'PENDING' && (
                                        <button className="btn btn-cancel" onClick={() => handleCancelOrder(order.id)}>
                                            <XCircle size={18}/> Hủy đơn
                                        </button>
                                    )}
                                    <button className="btn btn-detail" onClick={() => navigate(`/order/${order.id}`)}>
                                        Chi tiết <ArrowRight size={18}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="empty-state">
               <div className="empty-icon"><ShoppingBag size={80}/></div>
               <h3>Chưa có đơn hàng nào</h3>
               <p>Bạn chưa có đơn hàng nào trong mục này. Hãy đặt món ngay!</p>
               <button className="btn-home" onClick={()=>navigate('/')}>
                   Đặt món ngay <ArrowRight size={18}/>
               </button>
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
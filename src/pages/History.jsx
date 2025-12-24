import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import api from '../api/axios';
import { 
  ShoppingBag, Clock, MapPin, ChevronRight, 
  CheckCircle2, Truck, XCircle, AlertCircle, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      // API: GET /api/orders/user/{userId}
      const res = await api.get(`/orders/user/${user.id}`);
      // Sắp xếp đơn mới nhất lên đầu
      const sortedOrders = res.data.sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Lỗi lấy lịch sử đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      try {
        // API: PUT /api/orders/{id}/cancel
        await api.put(`/orders/${orderId}/cancel`);
        alert("Đã hủy đơn hàng thành công");
        fetchOrderHistory(); // Load lại danh sách
      } catch (error) {
        alert("Không thể hủy đơn hàng. Vui lòng liên hệ hỗ trợ.");
      }
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING': return { label: 'Đang chờ duyệt', color: '#f59e0b', icon: <Clock size={16}/> };
      case 'SHIPPING': return { label: 'Đang giao hàng', color: '#3b82f6', icon: <Truck size={16}/> };
      case 'COMPLETED': return { label: 'Đã hoàn thành', color: '#10b981', icon: <CheckCircle2 size={16}/> };
      case 'CANCELLED': return { label: 'Đã hủy', color: '#ef4444', icon: <XCircle size={16}/> };
      default: return { label: status, color: '#6b7280', icon: <AlertCircle size={16}/> };
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <>
      <Header />
      <div className="history-wrapper">
        <style>{`
          .history-wrapper { background: #f9fafb; min-height: 90vh; padding: 40px 20px; font-family: 'Inter', sans-serif; }
          .history-container { max-width: 800px; margin: 0 auto; }
          .page-title { font-size: 24px; font-weight: 900; margin-bottom: 25px; display: flex; align-items: center; gap: 12px; }

          .order-card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 20px; transition: 0.2s; }
          .order-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

          .order-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 1px dashed #eee; margin-bottom: 15px; }
          .order-id { font-weight: 800; font-size: 15px; color: #111; }
          .status-badge { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 50px; font-size: 12px; font-weight: 700; }

          .item-list { margin-bottom: 15px; }
          .item-detail { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #4b5563; }

          .order-footer { display: flex; justify-content: space-between; align-items: flex-end; }
          .total-box { text-align: right; }
          .total-label { font-size: 13px; color: #6b7280; }
          .total-price { font-size: 18px; font-weight: 900; color: #ef4444; }

          .btn-cancel-order { background: white; color: #ef4444; border: 1.5px solid #ef4444; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s; }
          .btn-cancel-order:hover { background: #fef2f2; }

          .empty-history { text-align: center; padding: 80px 0; background: white; border-radius: 20px; border: 1px solid #e5e7eb; }
        `}</style>

        <div className="history-container">
          <h1 className="page-title">
            <ShoppingBag size={28} color="#ef4444"/> Lịch sử đơn hàng
          </h1>

          {loading ? (
            <div style={{textAlign: 'center', padding: '50px'}}>Đang tải dữ liệu...</div>
          ) : orders.length > 0 ? (
            orders.map(order => {
              const status = getStatusInfo(order.status);
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <span className="order-id">Mã đơn: #{order.id}</span>
                      <div style={{fontSize: 12, color: '#9ca3af', marginTop: 4}}>{order.orderDate || 'Vừa xong'}</div>
                    </div>
                    <div className="status-badge" style={{ backgroundColor: status.color + '15', color: status.color }}>
                      {status.icon} {status.label}
                    </div>
                  </div>

                  <div className="item-list">
                    {/* Giả sử order có mảng items, nếu không bạn cần chỉnh field này khớp với Backend */}
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="item-detail">
                        <span>{item.foodName} <span style={{color: '#9ca3af'}}>x{item.quantity}</span></span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {!order.items && <p style={{fontSize: 13, color: '#6b7280'}}><Package size={14}/> Chi tiết đơn hàng đang cập nhật...</p>}
                  </div>

                  <div className="order-footer">
                    <div>
                      <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280'}}>
                        <MapPin size={14}/> {order.address}
                      </div>
                    </div>
                    
                    <div className="total-box">
                      <div className="total-label">Tổng thanh toán</div>
                      <div className="total-price">{formatPrice(order.totalAmount)}</div>
                      
                      {/* Chỉ cho phép hủy khi đơn ở trạng thái PENDING */}
                      {order.status === 'PENDING' && (
                        <button 
                          className="btn-cancel-order" 
                          style={{marginTop: 10}}
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-history">
              <ShoppingBag size={64} color="#e5e7eb" style={{marginBottom: 20}}/>
              <h3>Bạn chưa có đơn hàng nào!</h3>
              <p style={{color: '#6b7280', marginBottom: 25}}>Hãy khám phá các món ngon và đặt đơn ngay.</p>
              <button 
                onClick={() => navigate('/')}
                style={{background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer'}}
              >
                Đặt hàng ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default History;
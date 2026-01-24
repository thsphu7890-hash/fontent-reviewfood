import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Phone, User, Clock, 
  ShoppingBag, Bike, Star, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Header from '../components/Header';

const OrderDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL (ví dụ: /order/123)
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        // Gọi API lấy chi tiết đơn hàng
        const res = await api.get(`/api/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
        toast.error("Không tìm thấy đơn hàng hoặc bạn không có quyền xem.");
        navigate('/history'); // Quay về lịch sử nếu lỗi
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetail();
  }, [id, navigate]);

  // Hàm helper xử lý ảnh
  const getImg = (img) => {
    if (!img) return "https://placehold.co/100x100?text=Food";
    if (img.startsWith('http')) return img;
    const path = img.startsWith('/') ? img : `/${img}`;
    return `http://localhost:8080${path}`;
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';

  if (loading) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <Loader2 className="animate-spin" size={40} color="#ef4444"/>
    </div>
  );

  if (!order) return null;

  return (
    <div style={{background: '#f8fafc', minHeight: '100vh', fontFamily:'Inter, sans-serif'}}>
      <Header />
      
      <div style={{maxWidth: 800, margin: '30px auto', padding: '0 20px'}}>
        {/* Nút quay lại */}
        <button 
            onClick={() => navigate(-1)} 
            style={{display:'flex', alignItems:'center', gap:8, border:'none', background:'transparent', cursor:'pointer', marginBottom:20, color:'#64748b', fontWeight:600}}
        >
            <ArrowLeft size={20}/> Quay lại lịch sử
        </button>

        <div style={{background:'white', borderRadius:16, padding:30, boxShadow:'0 10px 30px -10px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9'}}>
            
            {/* Header Đơn hàng */}
            <div style={{borderBottom:'1px dashed #e2e8f0', paddingBottom:20, marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                    <h2 style={{margin:'0 0 5px', color:'#1e293b', display:'flex', alignItems:'center', gap:10}}>
                        Đơn hàng #{order.id}
                        <span style={{fontSize:13, padding:'4px 12px', borderRadius:20, background:'#eff6ff', color:'#2563eb', border:'1px solid #dbeafe'}}>
                            {order.status}
                        </span>
                    </h2>
                    <div style={{color:'#64748b', fontSize:14, display:'flex', alignItems:'center', gap:5}}>
                        <Clock size={14}/> {new Date(order.createdAt || order.orderDate).toLocaleString('vi-VN')}
                    </div>
                </div>
            </div>

            {/* Thông tin giao nhận */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:30, marginBottom:30}}>
                {/* Cột Trái: Người nhận */}
                <div>
                    <h4 style={{margin:'0 0 15px', color:'#94a3b8', textTransform:'uppercase', fontSize:12, fontWeight:700}}>Thông tin nhận hàng</h4>
                    <div style={{display:'flex', gap:12, marginBottom:12}}>
                        <div style={{width:36, height:36, borderRadius:'50%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <User size={18} color="#475569"/>
                        </div>
                        <div>
                            <div style={{fontWeight:600, color:'#1e293b'}}>{order.customerName}</div>
                            <div style={{fontSize:13, color:'#64748b'}}>{order.phone}</div>
                        </div>
                    </div>
                    <div style={{display:'flex', gap:12}}>
                        <div style={{width:36, height:36, borderRadius:'50%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <MapPin size={18} color="#475569"/>
                        </div>
                        <div style={{fontSize:14, color:'#334155', lineHeight:'1.5'}}>
                            {order.address}
                        </div>
                    </div>
                </div>

                {/* Cột Phải: Tài xế (Nếu có) */}
                {order.driverName && (
                    <div style={{background:'#f0fdf4', padding:20, borderRadius:12, border:'1px solid #dcfce7'}}>
                        <h4 style={{margin:'0 0 15px', color:'#166534', textTransform:'uppercase', fontSize:12, fontWeight:700}}>Tài xế phụ trách</h4>
                        <div style={{display:'flex', alignItems:'center', gap:15}}>
                            <img 
                                src={getImg(order.driverAvatar)} 
                                style={{width:50, height:50, borderRadius:'50%', objectFit:'cover', border:'2px solid white'}}
                                onError={(e)=>{e.target.src="https://placehold.co/100?text=TX"}}
                            />
                            <div>
                                <div style={{fontWeight:700, color:'#14532d'}}>{order.driverName}</div>
                                <div style={{fontSize:13, color:'#15803d', display:'flex', alignItems:'center', gap:4}}>
                                    <Bike size={14}/> {order.driverPlate || 'Đang cập nhật'}
                                </div>
                            </div>
                            <a href={`tel:${order.driverPhone}`} style={{marginLeft:'auto', background:'#fff', width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#16a34a', border:'1px solid #16a34a'}}>
                                <Phone size={16}/>
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Danh sách món ăn */}
            <div style={{background:'#f8fafc', borderRadius:12, padding:20}}>
                {order.items?.map((item, idx) => (
                    <div key={idx} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: idx !== order.items.length-1 ? 15 : 0, paddingBottom: idx !== order.items.length-1 ? 15 : 0, borderBottom: idx !== order.items.length-1 ? '1px solid #e2e8f0' : 'none'}}>
                        <div style={{display:'flex', gap:15, alignItems:'center'}}>
                            <img src={getImg(item.image)} style={{width:60, height:60, borderRadius:8, objectFit:'cover', border:'1px solid #e2e8f0'}} />
                            <div>
                                <div style={{fontWeight:600, color:'#1e293b'}}>{item.foodName}</div>
                                <div style={{fontSize:13, color:'#64748b'}}>Số lượng: <b>x{item.quantity}</b></div>
                            </div>
                        </div>
                        <div style={{fontWeight:700, color:'#1e293b'}}>
                            {formatPrice(item.price)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tổng tiền */}
            <div style={{marginTop:20, paddingTop:20, borderTop:'2px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{fontSize:14, color:'#64748b'}}>Phương thức thanh toán: <b style={{color:'#1e293b'}}>{order.paymentMethod || 'Tiền mặt'}</b></div>
                <div style={{textAlign:'right'}}>
                    <div style={{fontSize:12, color:'#64748b', textTransform:'uppercase', fontWeight:700}}>Tổng thanh toán</div>
                    <div style={{fontSize:24, fontWeight:800, color:'#ef4444'}}>{formatPrice(order.totalAmount)}</div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import { 
  Star, MapPin, Clock, Utensils, MessageSquare, ArrowLeft, 
  Phone, Share2, Heart, X, ShoppingCart, Minus, Plus 
} from 'lucide-react';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE CHO MODAL & TÙY CHỌN ---
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('M');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resDetail, resFoods] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/foods/restaurant/${id}`)
        ]);
        setRestaurant(resDetail.data);
        setFoods(resFoods.data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0); 
  }, [id]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setQuantity(1);
    setSize('M');
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedFood(null);
    document.body.style.overflow = 'unset';
  };

  const handleAddToCart = () => {
    let finalPrice = selectedFood.price;
    if (size === 'L') finalPrice += 5000;

    const productToAdd = { ...selectedFood, price: finalPrice };
    const options = { size: size };

    addToCart(productToAdd, quantity, options);
    handleCloseModal();
  };

  if (loading) return <div className="detail-loading">Đang tải dữ liệu...</div>;
  if (!restaurant) return <div className="detail-loading">Không tìm thấy nhà hàng.</div>;

  return (
    <div className="detail-layout">
      <style>{`
        .detail-layout { min-height: 100vh; background-color: #F9FAFB; padding-bottom: 80px; font-family: 'Inter', sans-serif; color: #1f2937; }
        .detail-loading { text-align: center; padding: 60px; font-weight: bold; color: #6b7280; }

        /* Banner */
        .detail-banner-group { position: relative; height: 350px; width: 100%; overflow: hidden; }
        .detail-banner-img { width: 100%; height: 100%; object-fit: cover; }
        .detail-banner-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); }
        .detail-banner-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 40px 20px; max-width: 1200px; margin: 0 auto; color: white; display: flex; justify-content: space-between; align-items: flex-end; }
        .detail-back-btn { position: absolute; top: 20px; left: 20px; background: rgba(255,255,255,0.9); border: none; padding: 10px; border-radius: 50%; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; }

        /* Grid */
        .detail-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .detail-grid-wrapper { display: grid; grid-template-columns: 1fr; gap: 30px; margin-top: 40px; }
        @media (min-width: 1024px) { .detail-grid-wrapper { grid-template-columns: 2fr 1fr; } }

        /* Section */
        .detail-section-box { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; margin-bottom: 30px; }
        .detail-section-title { font-size: 22px; font-weight: 800; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; color: #111827; }

        /* Food Card & Description Line Clamp */
        .detail-food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .detail-food-card { display: flex; gap: 16px; padding: 16px; border: 1px solid #f3f4f6; border-radius: 12px; transition: 0.2s; background: #fff; cursor: pointer; }
        .detail-food-card:hover { border-color: #f97316; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .detail-food-img { width: 90px; height: 90px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
        
        .food-desc-clamp { 
          font-size: 13px; color: #6b7280; margin: 4px 0 8px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;  
          overflow: hidden; text-overflow: ellipsis; line-height: 1.4;
        }

        /* Sidebar Sticky */
        .detail-sticky-wrapper { position: sticky; top: 100px; }
        .promo-card { background: linear-gradient(135deg, #f97316, #ef4444); color: white; padding: 24px; border-radius: 16px; text-align: center; }

        /* Modal & Modal Line Clamp */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-box { background: #fff; width: 95%; max-width: 850px; border-radius: 24px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; position: relative; }
        @media (min-width: 768px) { .modal-box { flex-direction: row; height: 600px; } }
        
        .modal-img-side { flex: 1; flex-shrink: 0; }
        .modal-img-side img { width: 100%; height: 250px; object-fit: cover; }
        @media (min-width: 768px) { .modal-img-side img { height: 100%; } }
        
        .modal-content-side { flex: 1.2; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; }
        .modal-desc-clamp {
          font-size: 14px; color: #4b5563; line-height: 1.6;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;  
          overflow: hidden; text-overflow: ellipsis; margin-bottom: 20px;
        }

        .size-btn { flex: 1; padding: 10px; border: 1.5px solid #e5e7eb; border-radius: 10px; background: white; cursor: pointer; font-weight: 600; transition: 0.2s; }
        .size-btn.active { border-color: #f97316; background: #fff7ed; color: #f97316; }
        .qty-box { display: flex; align-items: center; gap: 15px; background: #f3f4f6; padding: 8px 16px; border-radius: 50px; width: fit-content; }
        .btn-add-main { width: 100%; background: #ea580c; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 20px; }
      `}</style>

      {/* Hero Banner */}
      <div className="detail-banner-group">
        <button onClick={() => navigate(-1)} className="detail-back-btn"><ArrowLeft size={24}/></button>
        <img src={restaurant.image} className="detail-banner-img" alt={restaurant.name} />
        <div className="detail-banner-overlay"></div>
        <div className="detail-banner-content">
          <div>
            <h1 style={{fontSize:'36px', fontWeight:'900', margin: 0}}>{restaurant.name}</h1>
            <p style={{display:'flex', alignItems:'center', gap:'6px', margin:'10px 0 0', opacity:0.9}}><MapPin size={16}/> {restaurant.address}</p>
          </div>
          <div style={{display:'flex', gap:'10px'}}>
             <button style={{background:'rgba(255,255,255,0.2)', border:'none', padding:'12px', borderRadius:'50%', color:'white'}}><Heart size={20}/></button>
          </div>
        </div>
      </div>

      <div className="detail-container">
        <div className="detail-grid-wrapper">
          <div className="detail-col-left">
            {/* Thực đơn */}
            <section className="detail-section-box">
              <h2 className="detail-section-title"><Utensils size={24} color="#f97316"/> Thực đơn nhà hàng</h2>
              <div className="detail-food-grid">
                {foods.map(food => (
                  <div key={food.id} className="detail-food-card" onClick={() => handleFoodClick(food)}>
                    <img src={food.image || "https://via.placeholder.com/90"} className="detail-food-img" alt={food.name} />
                    <div style={{flex: 1, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                      <div>
                        <h4 style={{margin:0, fontWeight:700}}>{food.name}</h4>
                        <p className="food-desc-clamp">{food.description || "Bấm để xem chi tiết món ăn này."}</p>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{color:'#ea580c', fontWeight:700}}>{formatPrice(food.price)}</span>
                        <span style={{fontSize:12, background:'#f3f4f6', padding:'2px 8px', borderRadius:4, fontWeight:600, color:'#666'}}>+ THÊM</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Đánh giá tổng quát */}
            <section className="detail-section-box">
              <h2 className="detail-section-title"><MessageSquare size={24} color="#f97316"/> Đánh giá món ăn</h2>
              <ReviewSection foodId={foods[0]?.id} /> 
            </section>
          </div>

          <div className="detail-col-right">
            <div className="detail-sticky-wrapper">
              <div className="detail-section-box">
                <h3 style={{fontSize:18, fontWeight:700, marginBottom:16}}><Clock size={20} color="#f97316"/> Giờ hoạt động</h3>
                <div style={{fontSize:14, display:'flex', flexDirection:'column', gap:10}}>
                   <div style={{display:'flex', justifyContent:'space-between'}}><span>Thứ 2 - Thứ 6:</span> <strong>08:00 - 22:00</strong></div>
                   <div style={{display:'flex', justifyContent:'space-between', color:'#ea580c'}}><span>Thứ 7 - Chủ Nhật:</span> <strong>08:00 - 23:30</strong></div>
                </div>
              </div>
              <div className="promo-card">
                 <h3 style={{margin:0, fontSize:20}}>GIẢM GIÁ 20%</h3>
                 <p style={{fontSize:13, opacity:0.9, margin:'8px 0 16px'}}>Áp dụng cho đơn hàng trên 200k</p>
                 <button style={{width:'100%', padding:12, borderRadius:10, border:'none', fontWeight:'bold', color:'#ef4444'}}>ĐẶT NGAY: 1900 1234</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết món */}
      {selectedFood && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button style={{position:'absolute', top:15, right:15, zIndex:10, background:'white', border:'none', borderRadius:'50%', padding:5, cursor:'pointer'}} onClick={handleCloseModal}><X size={24}/></button>
            
            <div className="modal-img-side">
                <img src={selectedFood.image} alt={selectedFood.name} />
            </div>
            
            <div className="modal-content-side">
                <h2 style={{fontSize:28, fontWeight:900, margin:'0 0 8px'}}>{selectedFood.name}</h2>
                <div style={{fontSize:22, color:'#ea580c', fontWeight:800, marginBottom:15}}>{formatPrice(selectedFood.price + (size === 'L' ? 5000 : 0))}</div>
                
                <div style={{fontWeight:'bold', marginBottom:8, fontSize:14}}>Mô tả:</div>
                <p className="modal-desc-clamp">{selectedFood.description || "Món ăn nóng hổi, thơm ngon sẵn sàng phục vụ quý khách."}</p>

                <div style={{marginBottom:20}}>
                    <div style={{fontWeight:'bold', marginBottom:10, fontSize:14}}>Chọn kích cỡ:</div>
                    <div style={{display:'flex', gap:10}}>
                        <button className={`size-btn ${size === 'M' ? 'active' : ''}`} onClick={() => setSize('M')}>Size M</button>
                        <button className={`size-btn ${size === 'L' ? 'active' : ''}`} onClick={() => setSize('L')}>Size L (+5k)</button>
                    </div>
                </div>

                <div style={{marginBottom:20}}>
                    <div style={{fontWeight:'bold', marginBottom:10, fontSize:14}}>Số lượng:</div>
                    <div className="qty-box">
                        <button style={{border:'none', background:'none', cursor:'pointer'}} onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={18}/></button>
                        <span style={{fontSize:18, fontWeight:800}}>{quantity}</span>
                        <button style={{border:'none', background:'none', cursor:'pointer'}} onClick={() => setQuantity(q => q + 1)}><Plus size={18}/></button>
                    </div>
                </div>

                <div style={{borderTop:'1px solid #eee', paddingTop:20, marginTop:10}}>
                   <ReviewSection foodId={selectedFood.id} />
                </div>

                <button className="btn-add-main" onClick={handleAddToCart}>
                    <ShoppingCart size={20} /> THÊM VÀO GIỎ - {formatPrice((selectedFood.price + (size === 'L' ? 5000 : 0)) * quantity)}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Thêm thư viện thông báo
import api from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FoodOptionModal from '../components/FoodOptionModal';
import ReviewSection from '../components/ReviewSection';
import { 
  Star, MapPin, Clock, Info, Share2, Heart, 
  Search, ThumbsUp, Truck, ShieldCheck, Check
} from 'lucide-react';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  // --- STATE ---
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // State cho chức năng Yêu thích
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const menuRef = useRef(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resDetail, resFoods] = await Promise.all([
          api.get(`/restaurants/${id}`), 
          api.get(`/foods/restaurant/${id}?size=100`) 
        ]);

        setRestaurant(resDetail.data);
        
        // Kiểm tra xem user đã like nhà hàng này chưa (Giả sử backend trả về field isFavorite)
        // Nếu backend chưa có, ta có thể gọi thêm API: /users/favorites/check/{restaurantId}
        if (resDetail.data.isFavorite) setIsFavorite(true);

        // Xử lý list món ăn
        let foodList = [];
        if (resFoods.data && Array.isArray(resFoods.data.content)) {
            foodList = resFoods.data.content;
        } else if (Array.isArray(resFoods.data)) {
            foodList = resFoods.data;
        }
        setFoods(foodList);

        // Fake categories
        const fakeCats = [
            { id: 'all', name: 'Tất cả món' },
            { id: 'popular', name: 'Món Phổ Biến' },
            { id: 'main', name: 'Món Chính' },
            { id: 'drink', name: 'Đồ Uống' }
        ];
        setCategories(fakeCats);

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  // --- FUNCTION: XỬ LÝ YÊU THÍCH ---
  const handleToggleFavorite = async () => {
    if (!user) {
        toast.error("Vui lòng đăng nhập để lưu nhà hàng!");
        return navigate('/login');
    }

    // Optimistic UI update: Đổi màu ngay lập tức cho mượt
    const previousState = isFavorite;
    setIsFavorite(!isFavorite); 
    setFavLoading(true);

    try {
        if (!previousState) {
            // Gọi API Thêm yêu thích
            // await api.post(`/users/favorites/${id}`);
            toast.success("Đã thêm vào danh sách yêu thích! ❤️");
        } else {
            // Gọi API Bỏ yêu thích
            // await api.delete(`/users/favorites/${id}`);
            toast.success("Đã xóa khỏi danh sách yêu thích.");
        }
    } catch (error) {
        // Nếu lỗi thì revert lại trạng thái cũ
        setIsFavorite(previousState);
        toast.error("Lỗi kết nối, vui lòng thử lại.");
    } finally {
        setFavLoading(false);
    }
  };

  // --- FUNCTION: XỬ LÝ CHIA SẺ ---
  const handleShare = async () => {
    const shareData = {
        title: `FoodNest - ${restaurant?.name}`,
        text: `Mời bạn thưởng thức món ngon tại ${restaurant?.name} trên FoodNest!`,
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback cho PC: Copy link
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
        }
    } catch (err) {
        console.error("Lỗi chia sẻ:", err);
    }
  };

  const handleOpenModal = (food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

  if (loading) return (
    <div style={{minHeight:'100vh', background:'#f9fafb', display:'flex', justifyContent:'center', alignItems:'center'}}>
        <div className="loader"></div>
        <style>{`.loader { width: 48px; height: 48px; border: 5px solid #ef4444; border-bottom-color: transparent; border-radius: 50%; animation: rotation 1s linear infinite; } @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!restaurant) return <div style={{padding:50, textAlign:'center'}}>Không tìm thấy nhà hàng.</div>;

  return (
    <div className="res-layout">
      <Header />
      
      <style>{`
        /* --- CSS (Giữ nguyên từ phiên bản trước) --- */
        .res-layout { background: #F9FAFB; min-height: 100vh; font-family: 'Inter', sans-serif; color: #1f2937; }
        .res-container { max-width: 1200px; margin: 0 auto; padding: 0 20px 60px; position: relative; }

        .res-hero { position: relative; height: 350px; background: #fff; margin-bottom: 30px; }
        .hero-bg { width: 100%; height: 100%; object-fit: cover; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); }
        
        .hero-info { 
            position: absolute; bottom: 0; left: 0; right: 0; 
            max-width: 1200px; margin: 0 auto; padding: 30px 20px; color: white; 
            display: flex; justify-content: space-between; align-items: flex-end;
        }
        .res-name { font-size: 36px; font-weight: 800; margin: 0 0 10px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .res-tags { display: flex; gap: 15px; font-size: 14px; font-weight: 500; opacity: 0.9; }
        .tag-item { display: flex; align-items: center; gap: 6px; }
        
        .hero-actions { display: flex; gap: 10px; }
        .btn-hero { 
            background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.3);
            color: white; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; 
            display: flex; align-items: center; gap: 6px; transition: 0.2s;
        }
        .btn-hero:hover { background: white; color: #ef4444; }
        .btn-hero.active { background: white; color: #ef4444; } /* Style cho nút Like khi active */

        .res-grid { display: flex; gap: 30px; }
        .col-left { width: 260px; flex-shrink: 0; }
        .col-main { flex: 1; min-width: 0; }
        .col-right { width: 300px; flex-shrink: 0; }

        .cat-menu { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; position: sticky; top: 100px; }
        .cat-item { 
            padding: 14px 20px; border-bottom: 1px solid #f3f4f6; cursor: pointer; 
            font-size: 14px; font-weight: 600; color: #4b5563; transition: 0.2s; display: flex; justify-content: space-between;
        }
        .cat-item:hover { background: #f9fafb; color: #ef4444; }
        .cat-item.active { background: #fef2f2; color: #ef4444; border-left: 3px solid #ef4444; }

        .page-tabs { 
            display: flex; gap: 30px; border-bottom: 1px solid #e5e7eb; margin-bottom: 30px; 
            background: white; padding: 0 20px; border-radius: 12px 12px 0 0;
        }
        .tab-btn { 
            padding: 15px 0; font-weight: 600; color: #6b7280; cursor: pointer; 
            position: relative; transition: 0.2s; font-size: 15px;
        }
        .tab-btn:hover { color: #ef4444; }
        .tab-btn.active { color: #ef4444; }
        .tab-btn.active::after { 
            content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 3px; background: #ef4444; border-radius: 3px 3px 0 0; 
        }

        .menu-section-title { font-size: 18px; font-weight: 800; margin-bottom: 15px; color: #1f2937; }
        .food-card-row { 
            display: flex; gap: 15px; background: white; padding: 15px; 
            border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 15px; 
            transition: 0.2s; cursor: pointer; position: relative;
        }
        .food-card-row:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-color: #fed7aa; }
        
        .food-img { width: 120px; height: 120px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
        .food-info { flex: 1; display: flex; flex-direction: column; }
        .food-name { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 6px; }
        .food-desc { font-size: 13px; color: #6b7280; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .food-sales { font-size: 12px; color: #9ca3af; margin-top: auto; }
        
        .food-price-box { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; }
        .f-price { font-size: 16px; font-weight: 700; color: #ef4444; }
        .btn-add-mini { 
            width: 32px; height: 32px; background: #fef2f2; color: #ef4444; 
            border: 1px solid #fee2e2; border-radius: 8px; display: flex; align-items: center; justify-content: center;
            transition: 0.2s;
        }
        .btn-add-mini:hover { background: #ef4444; color: white; }

        .info-box { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e5e7eb; position: sticky; top: 100px; }
        .info-header { font-size: 16px; font-weight: 700; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #e5e7eb; }
        .info-row { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #4b5563; margin-bottom: 12px; }
        .info-icon { color: #9ca3af; margin-top: 2px; }
        .promo-banner { 
            margin-top: 20px; background: linear-gradient(135deg, #ef4444, #b91c1c); 
            color: white; padding: 15px; border-radius: 12px; text-align: center;
        }
        .promo-code { 
            background: rgba(255,255,255,0.2); padding: 8px; border-radius: 6px; 
            border: 1px dashed rgba(255,255,255,0.5); font-weight: 800; letter-spacing: 1px; margin-top: 10px;
        }

        @media (max-width: 1024px) { 
            .col-left, .col-right { display: none; } 
            .res-grid { display: block; }
            .hero-info { flex-direction: column; align-items: flex-start; gap: 15px; }
        }
      `}</style>

      {/* HERO HEADER */}
      <div className="res-hero">
        <img src={restaurant.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop"} className="hero-bg" alt="Cover" />
        <div className="hero-overlay"></div>
        <div className="hero-info">
            <div>
                <h1 className="res-name">{restaurant.name}</h1>
                <div className="res-tags">
                    <div className="tag-item"><Star size={16} fill="#fbbf24" color="#fbbf24"/> 4.8 (500+ đánh giá)</div>
                    <div className="tag-item" style={{color:'#d1d5db'}}>•</div>
                    <div className="tag-item"><MapPin size={16}/> {restaurant.address}</div>
                    <div className="tag-item" style={{color:'#d1d5db'}}>•</div>
                    <div className="tag-item"><Clock size={16}/> 15-25 phút</div>
                </div>
            </div>
            <div className="hero-actions">
                {/* NÚT YÊU THÍCH HOẠT ĐỘNG */}
                <button 
                    className={`btn-hero ${isFavorite ? 'active' : ''}`} 
                    onClick={handleToggleFavorite}
                    disabled={favLoading}
                >
                    <Heart size={18} fill={isFavorite ? "#ef4444" : "none"}/> 
                    {isFavorite ? "Đã thích" : "Yêu thích"}
                </button>

                {/* NÚT CHIA SẺ HOẠT ĐỘNG */}
                <button className="btn-hero" onClick={handleShare}>
                    <Share2 size={18}/> Chia sẻ
                </button>
            </div>
        </div>
      </div>

      <div className="res-container">
        {/* TABS NAV */}
        <div className="page-tabs">
            <div className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>Thực Đơn</div>
            <div className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>Đánh Giá</div>
            <div className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Thông Tin</div>
        </div>

        <div className="res-grid">
            {/* LEFT: CATEGORIES */}
            {activeTab === 'menu' && (
                <aside className="col-left">
                    <div className="cat-menu">
                        {categories.map(c => (
                            <div key={c.id} className={`cat-item ${activeCategory === c.id ? 'active' : ''}`} onClick={() => setActiveCategory(c.id)}>
                                {c.name}
                            </div>
                        ))}
                    </div>
                </aside>
            )}

            {/* MAIN CONTENT */}
            <div className="col-main">
                {activeTab === 'menu' && (
                    <div ref={menuRef}>
                        <div className="menu-section-title">🔥 Món Ngon Phải Thử</div>
                        
                        <div style={{position:'relative', marginBottom: 20}}>
                            <Search size={18} style={{position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', color:'#9ca3af'}}/>
                            <input 
                                placeholder="Tìm món trong thực đơn..." 
                                style={{width:'100%', padding:'12px 12px 12px 45px', borderRadius:10, border:'1px solid #e5e7eb', outline:'none'}}
                            />
                        </div>

                        {/* FOOD LIST */}
                        {foods.map(food => (
                            <div key={food.id} className="food-card-row" onClick={() => handleOpenModal(food)}>
                                <img src={food.image || "https://via.placeholder.com/150"} className="food-img" alt={food.name} />
                                <div className="food-info">
                                    <div className="food-name">{food.name}</div>
                                    <div className="food-desc">{food.description || "Hương vị đậm đà, chuẩn vị nhà làm."}</div>
                                    <div className="food-sales">Đã bán 120+ | <ThumbsUp size={12} style={{display:'inline'}}/> 15</div>
                                </div>
                                <div className="food-price-box">
                                    <div className="f-price">{formatPrice(food.price)}</div>
                                    <div className="btn-add-mini">+</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB REVIEW */}
                {activeTab === 'review' && <ReviewSection foodId={foods[0]?.id} />}

                {/* TAB INFO */}
                {activeTab === 'info' && (
                    <div style={{background:'white', padding:30, borderRadius:16, border:'1px solid #e5e7eb'}}>
                        <h3 style={{fontSize:18, fontWeight:700, marginBottom:20}}>Giới thiệu nhà hàng</h3>
                        <p style={{color:'#4b5563', lineHeight:1.6}}>
                            {restaurant.description || "Nhà hàng chuyên các món ăn truyền thống với hương vị đậm đà bản sắc Việt. Không gian thoáng mát, phục vụ tận tình."}
                        </p>
                        <div style={{marginTop:30, height:300, background:'#f3f4f6', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af'}}>
                            [Bản đồ Google Map sẽ hiển thị ở đây]
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT: INFO & PROMO */}
            <aside className="col-right">
                <div className="info-box">
                    <div className="info-header">Thông tin giao hàng</div>
                    <div className="info-row"><Clock size={18} className="info-icon"/> <span>Mở cửa: 07:00 - 22:00</span></div>
                    <div className="info-row"><Truck size={18} className="info-icon"/> <span>Phí giao: 15.000₫ (0-3km)</span></div>
                    <div className="info-row"><ShieldCheck size={18} className="info-icon"/> <span>Đối tác FoodNest Verified</span></div>
                    
                    <div className="promo-banner">
                        <div style={{fontWeight:700, fontSize:14}}>GIẢM 20K CHO ĐƠN TỪ 100K</div>
                        <div className="promo-code">FOODNEST20</div>
                        <div style={{fontSize:11, marginTop:5, opacity:0.8}}>Hết hạn: 30/12/2025</div>
                    </div>
                </div>
            </aside>
        </div>
      </div>

      <Footer />

      {/* MODAL ORDER */}
      <FoodOptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        food={selectedFood} 
      />
    </div>
  );
};

export default RestaurantDetail;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../api/axios'; 
import FoodOptionModal from '../components/FoodOptionModal';
import Chatbot from "../components/ChatBot"; 

// --- COMPONENTS CON ---
import HeroBanner from '../components/banners/HeroBanner';
import FeatureBanners from '../components/banners/FeatureBanners';

import { 
  Star, Loader, Pizza, Coffee, Utensils, Sandwich, IceCream, Carrot, Beer, Croissant, 
  Ticket, Check, ArrowLeft, Clock, Flame, Calendar, MapPin, Store 
} from 'lucide-react';

// --- TỪ ĐIỂN ICON (Đưa ra ngoài để tối ưu hiệu năng) ---
const CATEGORY_ICONS = {
  "pizza": <Pizza size={28} />, "burger": <Sandwich size={28} />, "bánh mì": <Sandwich size={28} />,
  "cà phê": <Coffee size={28} />, "đồ uống": <Beer size={28} />, "tráng miệng": <IceCream size={28} />,
  "kem": <IceCream size={28} />, "healthy": <Carrot size={28} />, "chay": <Carrot size={28} />,
  "bánh ngọt": <Croissant size={28} />, "cơm": <Utensils size={28} />, "phở": <Utensils size={28} />,
  "bún": <Utensils size={28} />,
};

const getCategoryIcon = (name) => {
  if (!name) return <Utensils size={28} />;
  const key = name.toLowerCase();
  for (const k in CATEGORY_ICONS) { 
    if (key.includes(k)) return CATEGORY_ICONS[k]; 
  }
  return <Utensils size={28} />;
};

const Home = () => {
  const navigate = useNavigate();
  
  // --- STATE DỮ LIỆU ---
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]); 
  const [foods, setFoods] = useState([]); 
  const [vouchers, setVouchers] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // --- STATE UI ---
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeTab, setActiveTab] = useState('suggest'); 
  const [toast, setToast] = useState(null); 

  // --- HÀM XỬ LÝ ẢNH ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/300x200?text=No+Image"; 
    if (imagePath.startsWith('http')) return imagePath;
    // Sử dụng biến môi trường nếu có, hoặc fallback về localhost
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`; 
  };

  // --- HÀM MỞ MODAL ---
  const handleOpenModal = (food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Dùng Promise.all để gọi song song giúp tải nhanh hơn
        const [resCat, resRest, resFood] = await Promise.all([
            api.get('/api/categories'),
            api.get('/api/restaurants?size=8'),
            api.get('/api/food?size=12')
        ]);

        setCategories(resCat.data);
        setRestaurants(resRest.data.content || resRest.data || []);
        setFoods(resFood.data.content || resFood.data || []);

      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu trang chủ:", err);
      }

      // --- GỌI API VOUCHER (Nếu đã đăng nhập) ---
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const resVoucher = await api.get('/api/user-vouchers/available');
          setVouchers(resVoucher.data);
        } catch (err) {
          // Chỉ logout nếu lỗi 403 (Token hết hạn/không hợp lệ)
          if (err.response && (err.response.status === 403 || err.response.status === 401)) {
            console.warn("Phiên đăng nhập hết hạn.");
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // --- COPY VOUCHER ---
  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToast(`Đã lưu mã: ${code}`);
    setTimeout(() => { setCopiedCode(null); setToast(null); }, 2000); 
  };

  // --- ĐIỀU HƯỚNG CÓ BẢO VỆ ---
  const handleNavigateProtected = (path) => {
    const isLoggedIn = localStorage.getItem('token');
    if (!isLoggedIn) {
        if(window.confirm("Vui lòng đăng nhập để sử dụng tính năng này!")) navigate('/login');
    } else {
        navigate(path);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  return (
    <div className="home-layout">
      <style>{`
        .home-layout { min-height: 100vh; display: flex; flex-direction: column; background-color: #F9FAFB; font-family: 'Inter', sans-serif; }
        .home-main { flex: 1; }
        .home-section-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; width: 100%; box-sizing: border-box; }
        .home-title-wrapper { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
        .home-title-main { font-size: 26px; font-weight: 800; color: #1f2937; display: flex; align-items: center; gap: 8px; margin: 0; }
        .home-title-light { color: #9ca3af; font-weight: 300; }
        .home-subtitle { color: #6b7280; font-size: 14px; margin-top: 4px; }
        .home-see-all { color: #ef4444; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; }
        
        .home-tabs { display: flex; gap: 12px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
        .home-tabs::-webkit-scrollbar { display: none; }
        .home-tab-btn { padding: 8px 20px; border-radius: 24px; border: 1px solid #e5e7eb; background: white; font-weight: 600; color: #4b5563; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; transition: 0.2s; }
        .home-tab-btn:hover { background: #f3f4f6; }
        .home-tab-btn.active { background: #ef4444; color: white; border-color: #ef4444; }
        
        /* Category Styles */
        .home-category-grid { display: flex; gap: 20px; overflow-x: auto; padding: 10px 5px; scrollbar-width: none; }
        .home-category-grid::-webkit-scrollbar { display: none; }
        .home-category-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; min-width: 80px; flex-shrink: 0; }
        .home-icon-circle { width: 64px; height: 64px; border-radius: 20px; background: white; display: flex; align-items: center; justify-content: center; color: #ef4444; box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: 0.3s; }
        .home-category-item:hover .home-icon-circle { background: #ef4444; color: white; transform: translateY(-5px); box-shadow: 0 8px 15px rgba(239, 68, 68, 0.25); }
        
        /* Voucher Styles */
        .home-voucher-scroll { display: flex; gap: 16px; overflow-x: auto; padding: 10px 5px 20px; scrollbar-width: thin; }
        .home-voucher-ticket { min-width: 280px; background: white; border-radius: 12px; display: flex; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .v-left { width: 80px; background: linear-gradient(135deg, #f43f5e, #e11d48); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 2px dashed #fff; position: relative; }
        .v-left::before, .v-left::after { content: ''; position: absolute; right: -6px; width: 12px; height: 12px; background: white; border-radius: 50%; }
        .v-left::before { top: -6px; }
        .v-left::after { bottom: -6px; }
        .v-right { flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: center; }
        
        /* Restaurant Styles */
        .home-restaurant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
        .home-restaurant-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #f3f4f6; cursor: pointer; transition: 0.3s; display: flex; flex-direction: column; height: 100%; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .home-restaurant-card:hover { transform: translateY(-5px); box-shadow: 0 12px 20px rgba(0,0,0,0.08); border-color: #fecaca; }
        .res-img-wrapper { height: 160px; overflow: hidden; position: relative; }
        .res-img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .home-restaurant-card:hover .res-img { transform: scale(1.05); }
        .res-info { padding: 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .res-badge { position: absolute; top: 10px; left: 10px; background: rgba(255,255,255,0.95); color: #1f2937; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); backdrop-filter: blur(2px); }
        
        /* Food Styles */
        .home-food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
        .home-food-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #f3f4f6; cursor: pointer; transition: 0.3s; position: relative; display: flex; flex-direction: column; }
        .home-food-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
        .home-food-img-wrapper { height: 180px; position: relative; overflow: hidden; }
        .home-food-img { width: 100%; height: 100%; object-fit: cover; transition: 0.3s; }
        .home-food-card:hover .home-food-img { transform: scale(1.03); }
        .home-btn-add { margin-top: 12px; width: 100%; background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .home-btn-add:hover { background: #ea580c; color: white; border-color: #ea580c; }
        
        .toast-notify { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1f2937; color: white; padding: 12px 24px; border-radius: 30px; z-index: 9999; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-weight: 500; animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .home-restaurant-grid, .home-food-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .home-restaurant-card, .home-food-card { border-radius: 12px; }
            .res-img-wrapper, .home-food-img-wrapper { height: 140px; }
            .home-title-main { font-size: 20px; }
        }
        @media (max-width: 480px) {
            .home-restaurant-grid, .home-food-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Header />

      {toast && <div className="toast-notify"><Check size={18} color="#4ade80"/> {toast}</div>}

      <main className="home-main">
        {/* HERO BANNER */}
        <section className="home-section-container" style={{paddingBottom: 10}}>
            <HeroBanner />
        </section>

        {/* CATEGORIES */}
        <section className="home-section-container">
            <div className="home-category-grid">
                {categories.length === 0 && !loading ? <p className="text-center w-full text-gray-400">Đang cập nhật danh mục...</p> : 
                 categories.map((cat) => (
                    <div key={cat.id} className="home-category-item" onClick={() => navigate(`/search?cat=${cat.id}`)}>
                        <div className="home-icon-circle">{getCategoryIcon(cat.name)}</div>
                        <span className="home-category-name" style={{fontSize: 13, fontWeight: 600, color: '#374151', textAlign:'center'}}>{cat.name}</span>
                    </div>
                ))}
            </div>
        </section>

        {/* EVENT BANNER */}
        <section className="home-section-container" style={{paddingTop: 0, paddingBottom: 0}}>
            <div 
                style={{ background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: 16, padding: '24px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }} 
                onClick={() => navigate('/events')}
            >
                <div>
                    <h3 style={{margin: '0 0 6px', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10}}><Calendar size={24}/> SỰ KIỆN ẨM THỰC</h3>
                    <p style={{margin: 0, fontSize: 14, opacity: 0.9}}>Khám phá lễ hội & ưu đãi hot đang diễn ra</p>
                </div>
                <div style={{background: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: '50%'}}>
                    <ArrowLeft size={24} style={{transform: 'rotate(180deg)'}}/>
                </div>
            </div>
        </section>

        <section className="home-section-container"><FeatureBanners /></section>

        {/* --- SECTION VOUCHERS --- */}
        {vouchers.length > 0 && (
            <section className="home-section-container">
                <div className="home-title-wrapper">
                    <div>
                        <h2 className="home-title-main"><Ticket className="text-rose-500" size={24}/> ƯU ĐÃI <span className="home-title-light">ĐỘC QUYỀN</span></h2>
                        <p className="home-subtitle">Săn mã giảm giá ngay hôm nay</p>
                    </div>
                    <span className="home-see-all" onClick={() => handleNavigateProtected('/vouchers')}>Xem tất cả</span>
                </div>
                <div className="home-voucher-scroll">
                    {vouchers.map(v => (
                        <div key={v.id} className="home-voucher-ticket">
                            <div className="v-left">
                                <span style={{fontSize: 20, fontWeight: 800}}>{v.percent}%</span>
                                <span style={{fontSize: 10, opacity: 0.9}}>GIẢM</span>
                            </div>
                            <div className="v-right">
                                <div style={{fontWeight: 800, fontSize: 15, color: '#1f2937'}}>{v.code}</div>
                                <div style={{fontSize: 12, color: '#6b7280', marginBottom: 12}}>Tối đa {v.maxDiscount ? v.maxDiscount.toLocaleString() : 0}đ</div>
                                <button onClick={() => handleCopyVoucher(v.code)} style={{width: '100%', background: copiedCode === v.code ? '#dcfce7' : '#fff1f2', color: copiedCode === v.code ? '#166534' : '#be123c', border: 'none', padding: '8px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', transition: '0.2s', fontSize: 13}}>
                                    {copiedCode === v.code ? 'ĐÃ LƯU MÃ' : 'LƯU MÃ NGAY'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* --- SECTION RESTAURANTS --- */}
        <section className="home-section-container">
            <div className="home-title-wrapper">
                <div>
                    <h2 className="home-title-main"><Store className="text-yellow-500" size={24}/> NHÀ HÀNG <span className="home-title-light">NỔI BẬT</span></h2>
                    <p className="home-subtitle">Địa điểm được đánh giá cao nhất tuần qua</p>
                </div>
                <span className="home-see-all" onClick={() => navigate('/restaurants')}>Xem tất cả</span>
            </div>

            <div className="home-restaurant-grid">
                {!loading && restaurants.length === 0 && <p className="col-span-full text-center text-gray-400 py-10">Chưa có nhà hàng nào.</p>}
                
                {restaurants.map(res => (
                    <div key={res.id} className="home-restaurant-card" onClick={() => navigate(`/restaurant/${res.id}`)}>
                        <div className="res-img-wrapper">
                            <img src={getImageUrl(res.image)} className="res-img" alt={res.name} loading="lazy" />
                            <div className="res-badge">
                                <Star size={12} fill="#eab308" color="#eab308"/> 
                                <span>{res.rating ? res.rating.toFixed(1) : '4.8'}</span>
                            </div>
                        </div>
                        <div className="res-info">
                            <div>
                                <h4 style={{margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1f2937', lineHeight: '1.4'}}>{res.name}</h4>
                                <div style={{display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13}}>
                                    <MapPin size={14} className="flex-shrink-0"/>
                                    <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>
                                        {res.address || "TP. Hồ Chí Minh"}
                                    </span>
                                </div>
                            </div>
                            <div style={{marginTop: 12, fontSize: 11, fontWeight: 600, color: '#059669', background:'#d1fae5', padding: '4px 8px', borderRadius: 4, width: 'fit-content'}}>
                                ● Đang mở cửa
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* --- SECTION FOODS --- */}
        <section className="home-section-container">
            <div className="home-title-wrapper">
                <div>
                    <h2 className="home-title-main">GỢI Ý <span className="home-title-light">HÔM NAY</span></h2>
                    <p className="home-subtitle">Món ngon được tuyển chọn dành riêng cho bạn</p>
                </div>
            </div>
            <div className="home-tabs">
                <button className={`home-tab-btn ${activeTab === 'suggest' ? 'active' : ''}`} onClick={() => setActiveTab('suggest')}><Star size={16}/> Gợi ý</button>
                <button className={`home-tab-btn ${activeTab === 'bestseller' ? 'active' : ''}`} onClick={() => setActiveTab('bestseller')}><Flame size={16}/> Bán chạy</button>
                <button className={`home-tab-btn ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}><Clock size={16}/> Mới nhất</button>
            </div>

            {loading && <div className="text-center py-20"><Loader className="animate-spin mx-auto text-rose-500" size={32}/></div>}

            <div className="home-food-grid">
                {!loading && foods.length === 0 && (
                     <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#9ca3af', background: 'white', borderRadius: 16}}>
                        <Utensils size={48} className="mx-auto mb-4 opacity-20"/>
                        <p>Chưa có món ăn nào được cập nhật.</p>
                     </div>
                )}

                {foods.map(food => (
                    <div 
                        key={food.id} 
                        className="home-food-card" 
                        onClick={() => {
                            // Fix lỗi navigate: Nếu có restaurantId thì mới chuyển, không thì alert hoặc log
                            if (food.restaurantId) {
                                navigate(`/restaurant/${food.restaurantId}`);
                            } else {
                                console.warn("Missing restaurantId for food:", food.name);
                            }
                        }}
                    >
                        <div className="home-food-img-wrapper">
                            <img src={getImageUrl(food.image)} className="home-food-img" alt={food.name} loading="lazy" />
                            
                            {food.time && (
                                <div style={{position:'absolute', bottom:10, left:10, background:'rgba(255,255,255,0.9)', padding:'4px 8px', borderRadius:20, fontSize:11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                                    <Clock size={12}/> {food.time}p
                                </div>
                            )}
                            {food.distance && (
                                <div style={{position:'absolute', bottom:10, right:10, background:'rgba(255,255,255,0.9)', padding:'4px 8px', borderRadius:20, fontSize:11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                                    <MapPin size={12}/> {food.distance}km
                                </div>
                            )}
                        </div>
                        <div style={{padding: 16, flex: 1, display: 'flex', flexDirection: 'column'}}>
                            <h4 style={{fontWeight: 700, margin: '0 0 4px', fontSize: 15, lineHeight: '1.4', flex: 1}}>{food.name}</h4>
                            <div style={{fontSize: 12, color: '#6b7280', marginBottom: 12}}>{food.restaurantName || "Nhà hàng đối tác"}</div>
                            
                            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto'}}>
                                <div style={{color: '#ef4444', fontWeight: 800, fontSize: 16}}>{formatPrice(food.price)}</div>
                            </div>

                            <button 
                                className="home-btn-add" 
                                onClick={(e) => { e.stopPropagation(); handleOpenModal(food); }}
                            >
                                Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </main>

      <Chatbot />
      <Footer />
      <FoodOptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} food={selectedFood} />
    </div>
  );
};

export default Home;
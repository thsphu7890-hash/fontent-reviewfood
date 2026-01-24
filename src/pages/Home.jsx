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
  Ticket, Check, ArrowLeft, Clock, Flame, Calendar, MapPin, Store // <-- Thêm icon Store
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  
  // --- STATE DỮ LIỆU ---
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]); // <-- Mới: State nhà hàng
  const [foods, setFoods] = useState([]); 
  const [vouchers, setVouchers] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // --- STATE UI ---
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeTab, setActiveTab] = useState('suggest'); 
  const [toast, setToast] = useState(null); 

  // --- TỪ ĐIỂN ICON ---
  const categoryIcons = {
    "pizza": <Pizza size={28} />, "burger": <Sandwich size={28} />, "bánh mì": <Sandwich size={28} />,
    "cà phê": <Coffee size={28} />, "đồ uống": <Beer size={28} />, "tráng miệng": <IceCream size={28} />,
    "kem": <IceCream size={28} />, "healthy": <Carrot size={28} />, "chay": <Carrot size={28} />,
    "bánh ngọt": <Croissant size={28} />, "cơm": <Utensils size={28} />, "phở": <Utensils size={28} />,
    "bún": <Utensils size={28} />,
  };

  const getCategoryIcon = (name) => {
    const key = name?.toLowerCase();
    for (const k in categoryIcons) { if (key && key.includes(k)) return categoryIcons[k]; }
    return <Utensils size={28} />;
  };

  // Hàm xử lý ảnh chuẩn từ Backend
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/300x200?text=No+Image"; 
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8080${imagePath}`; 
  };

  // Hàm mở Modal
  const handleOpenModal = (food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // --- 1. GỌI API CATEGORIES ---
        const resCat = await api.get('/api/categories');
        setCategories(resCat.data);

        // --- 2. GỌI API RESTAURANTS (MỚI) ---
        // Lấy 8 nhà hàng nổi bật
        const resRest = await api.get('/api/restaurants?size=8');
        const restData = resRest.data.content || resRest.data || [];
        setRestaurants(restData);

        // --- 3. GỌI API FOODS ---
        const resFood = await api.get('/api/food?size=12');
        const foodData = resFood.data.content || resFood.data || [];
        setFoods(foodData);

      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
      }

      // --- 4. GỌI API VOUCHER (Nếu đã đăng nhập) ---
      const isLoggedIn = localStorage.getItem('token') || localStorage.getItem('user');
      if (isLoggedIn) {
        try {
          const resVoucher = await api.get('/api/user-vouchers/available');
          setVouchers(resVoucher.data);
        } catch (err) {
          if (err.response && err.response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToast(`Đã lưu mã: ${code}`);
    setTimeout(() => { setCopiedCode(null); setToast(null); }, 2000); 
  };

  const handleNavigateProtected = (path) => {
    if (!localStorage.getItem('token') && !localStorage.getItem('user')) {
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
        .home-section-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; width: 100%; box-sizing: border-box; }
        .home-title-wrapper { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
        .home-title-main { font-size: 26px; font-weight: 800; color: #1f2937; display: flex; align-items: center; gap: 8px; }
        .home-title-light { color: #9ca3af; font-weight: 300; }
        .home-subtitle { color: #6b7280; font-size: 14px; }
        .home-see-all { color: #ef4444; font-weight: 600; font-size: 14px; cursor: pointer; }
        
        .home-tabs { display: flex; gap: 12px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px; }
        .home-tab-btn { padding: 8px 20px; border-radius: 24px; border: 1px solid #e5e7eb; background: white; font-weight: 600; color: #4b5563; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .home-tab-btn.active { background: #ef4444; color: white; border-color: #ef4444; }
        
        /* Category Styles */
        .home-category-grid { display: flex; gap: 20px; overflow-x: auto; padding: 10px 5px; }
        .home-category-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; min-width: 80px; }
        .home-icon-circle { width: 64px; height: 64px; border-radius: 20px; background: white; display: flex; align-items: center; justify-content: center; color: #ef4444; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: 0.3s; }
        .home-category-item:hover .home-icon-circle { background: #ef4444; color: white; transform: translateY(-5px); }
        
        /* Voucher Styles */
        .home-voucher-scroll { display: flex; gap: 16px; overflow-x: auto; padding: 10px 5px 20px; }
        .home-voucher-ticket { min-width: 280px; background: white; border-radius: 12px; display: flex; border: 1px solid #e5e7eb; overflow: hidden; }
        .v-left { width: 80px; background: linear-gradient(135deg, #f43f5e, #e11d48); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 2px dashed #fff; }
        .v-right { flex: 1; padding: 12px; }
        
        /* Restaurant Styles (MỚI) */
        .home-restaurant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .home-restaurant-card { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; cursor: pointer; transition: 0.3s; display: flex; flex-direction: column; height: 100%; }
        .home-restaurant-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); border-color: #ef4444; }
        .res-img-wrapper { height: 160px; overflow: hidden; position: relative; }
        .res-img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .home-restaurant-card:hover .res-img { transform: scale(1.05); }
        .res-info { padding: 12px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .res-badge { position: absolute; top: 10px; left: 10px; background: rgba(255,255,255,0.9); color: #1f2937; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        
        /* Food Styles */
        .home-food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
        .home-food-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #f3f4f6; cursor: pointer; transition: 0.3s; }
        .home-food-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .home-food-img-wrapper { height: 170px; position: relative; }
        .home-food-img { width: 100%; height: 100%; object-fit: cover; }
        .home-btn-add { margin-top: 12px; width: 100%; background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        
        .toast-notify { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1f2937; color: white; padding: 12px 24px; border-radius: 30px; z-index: 1000; display: flex; align-items: center; gap: 8px; }
      `}</style>

      <Header />

      {toast && <div className="toast-notify"><Check size={16} color="#4ade80"/> {toast}</div>}

      <main className="home-main">
        <section className="home-section-container" style={{paddingBottom: 0}}><HeroBanner /></section>

        <section className="home-section-container">
            <div className="home-category-grid">
                {categories.length === 0 && !loading ? <p className="text-center w-full">Đang tải danh mục...</p> : 
                 categories.map((cat) => (
                    <div key={cat.id} className="home-category-item" onClick={() => navigate(`/search?cat=${cat.id}`)}>
                        <div className="home-icon-circle">{getCategoryIcon(cat.name)}</div>
                        <span className="home-category-name" style={{fontSize: 13, fontWeight: 600}}>{cat.name}</span>
                    </div>
                ))}
            </div>
        </section>

        <section className="home-section-container" style={{paddingTop: 0, paddingBottom: 0}}>
            <div style={{ background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: 20, padding: '20px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/events')}>
                <div>
                    <h3 style={{margin: '0 0 5px', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8}}><Calendar size={20}/> SỰ KIỆN ẨM THỰC</h3>
                    <p style={{margin: 0, fontSize: 13, opacity: 0.9}}>Khám phá lễ hội & workshop đang diễn ra</p>
                </div>
                <ArrowLeft size={24} style={{transform: 'rotate(180deg)'}}/>
            </div>
        </section>

        <section className="home-section-container"><FeatureBanners /></section>

        {/* --- SECTION VOUCHERS --- */}
        {vouchers.length > 0 && (
            <section className="home-section-container" style={{background: '#fff', borderRadius: 20}}>
                <div className="home-title-wrapper">
                    <div>
                        <h2 className="home-title-main"><Ticket color="#f43f5e" size={24}/> ƯU ĐÃI <span className="home-title-light">ĐỘC QUYỀN</span></h2>
                        <p className="home-subtitle">Săn mã giảm giá ngay hôm nay</p>
                    </div>
                    <span className="home-see-all" onClick={() => handleNavigateProtected('/vouchers')}>Xem tất cả</span>
                </div>
                <div className="home-voucher-scroll">
                    {vouchers.map(v => (
                        <div key={v.id} className="home-voucher-ticket">
                            <div className="v-left">
                                <span style={{fontSize: 18, fontWeight: 800}}>{v.percent}%</span>
                                <span style={{fontSize: 10}}>OFF</span>
                            </div>
                            <div className="v-right">
                                <div style={{fontWeight: 800}}>{v.code}</div>
                                <div style={{fontSize: 12, color: '#6b7280', marginBottom: 8}}>Giảm tối đa {v.maxDiscount/1000}k</div>
                                <button onClick={() => handleCopyVoucher(v.code)} style={{width: '100%', background: copiedCode === v.code ? '#dcfce7' : '#fff1f2', color: copiedCode === v.code ? '#166534' : '#be123c', border: 'none', padding: '6px', borderRadius: 6, fontWeight: 700, cursor: 'pointer'}}>
                                    {copiedCode === v.code ? 'ĐÃ LƯU' : 'LƯU MÃ'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* --- SECTION RESTAURANTS (MỚI THÊM) --- */}
        <section className="home-section-container">
            <div className="home-title-wrapper">
                <div>
                    <h2 className="home-title-main"><Store color="#eab308" size={24}/> NHÀ HÀNG <span className="home-title-light">NỔI BẬT</span></h2>
                    <p className="home-subtitle">Những địa điểm được đánh giá cao nhất</p>
                </div>
                <span className="home-see-all" onClick={() => navigate('/restaurants')}>Xem tất cả</span>
            </div>

            <div className="home-restaurant-grid">
                {!loading && restaurants.length === 0 && <p style={{color:'#9ca3af'}}>Chưa có nhà hàng nào.</p>}
                
                {restaurants.map(res => (
                    <div key={res.id} className="home-restaurant-card" onClick={() => navigate(`/restaurant/${res.id}`)}>
                        <div className="res-img-wrapper">
                            <img src={getImageUrl(res.image)} className="res-img" alt={res.name} />
                            {/* Badge đánh giá */}
                            <div className="res-badge">
                                <Star size={12} fill="#eab308" color="#eab308"/> 
                                <span>{res.rating || 4.8}</span>
                            </div>
                        </div>
                        <div className="res-info">
                            <div>
                                <h4 style={{margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1f2937'}}>{res.name}</h4>
                                <div style={{display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13}}>
                                    <MapPin size={14}/>
                                    <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>
                                        {res.address || "TP. Hồ Chí Minh"}
                                    </span>
                                </div>
                            </div>
                            <div style={{marginTop: 10, fontSize: 12, color: '#10b981', background:'#ecfdf5', padding: '4px 8px', borderRadius: 4, width: 'fit-content'}}>
                                Đang mở cửa
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* --- SECTION FOODS --- */}
        <section className="home-section-container">
            <div className="home-title-wrapper">
                <h2 className="home-title-main">GỢI Ý <span className="home-title-light">HÔM NAY</span></h2>
            </div>
            <div className="home-tabs">
                <button className={`home-tab-btn ${activeTab === 'suggest' ? 'active' : ''}`} onClick={() => setActiveTab('suggest')}><Star size={16}/> Gợi ý</button>
                <button className={`home-tab-btn ${activeTab === 'bestseller' ? 'active' : ''}`} onClick={() => setActiveTab('bestseller')}><Flame size={16}/> Bán chạy</button>
            </div>

            {loading && <div className="text-center p-10"><Loader className="animate-spin mx-auto"/></div>}

            <div className="home-food-grid">
                {!loading && foods.length === 0 && (
                     <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#6b7280'}}>
                        <p>Không có món ăn nào.</p>
                     </div>
                )}

                {foods.map(food => (
                    <div key={food.id} className="home-food-card" onClick={() => navigate(`/restaurant/${food.restaurantId || 1}`)}>
                        <div className="home-food-img-wrapper">
                            <img src={getImageUrl(food.image)} className="home-food-img" alt={food.name} />
                            
                            {food.time && (
                                <div style={{position:'absolute', bottom:10, left:10, background:'white', padding:'2px 8px', borderRadius:10, fontSize:11}}>
                                    <Clock size={10}/> {food.time}p
                                </div>
                            )}
                            {food.distance && (
                                <div style={{position:'absolute', bottom:10, right:10, background:'white', padding:'2px 8px', borderRadius:10, fontSize:11}}>
                                    <MapPin size={10}/> {food.distance}km
                                </div>
                            )}
                        </div>
                        <div style={{padding: 16}}>
                            <h4 style={{fontWeight: 700, margin: 0}}>{food.name}</h4>
                            <div style={{fontSize: 12, color: '#6b7280', margin: '4px 0'}}>{food.restaurantName || "Nhà hàng"}</div>
                            <div style={{color: '#ef4444', fontWeight: 800}}>{formatPrice(food.price)}</div>
                            
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
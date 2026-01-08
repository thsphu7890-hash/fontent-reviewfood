import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RestaurantList from './RestaurantList';
import api from '../api/axios';
import FoodOptionModal from '../components/FoodOptionModal';
import Chatbot from "../components/ChatBot"; 

// --- COMPONENTS CON ---
import HeroBanner from '../components/banners/HeroBanner';
import FeatureBanners from '../components/banners/FeatureBanners';

import { 
  Star, Loader, Pizza, Coffee, Utensils, Sandwich, IceCream, Carrot, Beer, Croissant, 
  Plus, Ticket, Copy, Check, ArrowLeft, MapPin, Clock, Filter, MessageSquare, Flame, 
  Calendar // <--- 1. MỚI: Import icon Calendar
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  
  // --- STATE DỮ LIỆU ---
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]); 
  const [vouchers, setVouchers] = useState([]); 
  const [reviews, setReviews] = useState([]); 
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resCat, resFood, resVoucher] = await Promise.all([
            api.get('/categories'),
            api.get('/foods?size=12'),
            api.get('/user-vouchers/available')
        ]);

        const cats = resCat.data || [];
        setCategories([...cats].sort(() => 0.5 - Math.random()).slice(0, 10));

        const foodData = resFood.data.content || resFood.data || [];
        const enhancedFoods = foodData.map(f => ({
            ...f,
            distance: (Math.random() * 5 + 0.5).toFixed(1),
            time: Math.floor(Math.random() * 30 + 15)
        }));
        setFoods(enhancedFoods);

        const allVouchers = resVoucher.data || [];
        const hotVouchers = allVouchers.filter(v => v.type === 'PUBLIC' || v.type === 'EVENT' || v.type === 'REWARD_ORDER').slice(0, 5);
        setVouchers(hotVouchers);

        setReviews([
            { id: 1, user: "Minh Anh", avatar: "", content: "Pizza ở đây đế mỏng giòn rụm, giao hàng siêu nhanh!", rating: 5, foodName: "Pizza Hải Sản" },
            { id: 2, user: "Tuấn Hưng", avatar: "", content: "Nước dùng phở đậm đà, thịt bò mềm. Sẽ quay lại.", rating: 4, foodName: "Phở Bò Tái" },
            { id: 3, user: "Lan Ngọc", avatar: "", content: "Trà sữa hơi ngọt so với mình, nhưng trân châu ngon.", rating: 4, foodName: "Trà Sữa Full Topping" },
        ]);

      } catch (error) {
        console.error("Lỗi tải trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleOpenModal = (food) => { setSelectedFood(food); setIsModalOpen(true); };
  
  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000); 
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleNavigateProtected = (path) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        if(window.confirm("Bạn cần đăng nhập để xem ưu đãi dành riêng cho bạn!")) navigate('/login');
    } else {
        navigate(path);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/300x200?text=Món+Ngon";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8080${imagePath}`;
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  return (
    <div className="home-layout">
      <style>{`
        .home-layout { min-height: 100vh; display: flex; flex-direction: column; background-color: #F9FAFB; font-family: 'Inter', sans-serif; position: relative; }
        .home-main { flex-grow: 1; }
        .home-section-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; width: 100%; box-sizing: border-box; }
        .home-title-wrapper { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
        .home-title-main { font-size: 26px; font-weight: 800; color: #1f2937; margin: 0; display: flex; align-items: center; gap: 8px; }
        .home-title-light { color: #9ca3af; font-weight: 300; }
        .home-subtitle { color: #6b7280; font-size: 14px; margin-top: 4px; }
        .home-see-all { color: #ef4444; font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.2s; }
        .home-see-all:hover { color: #dc2626; text-decoration: underline; }
        .home-tabs { display: flex; gap: 12px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
        .home-tab-btn { padding: 8px 20px; border-radius: 24px; border: 1px solid #e5e7eb; background: white; font-weight: 600; color: #4b5563; cursor: pointer; transition: 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
        .home-tab-btn.active { background: #ef4444; color: white; border-color: #ef4444; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); }
        .home-category-grid { display: flex; gap: 20px; overflow-x: auto; padding: 10px 5px; scrollbar-width: none; }
        .home-category-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; min-width: 80px; transition: 0.2s; }
        .home-icon-circle { width: 64px; height: 64px; border-radius: 20px; background: white; display: flex; align-items: center; justify-content: center; color: #ef4444; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: 0.3s; }
        .home-category-item:hover .home-icon-circle { background: #ef4444; color: white; transform: translateY(-5px); box-shadow: 0 8px 15px rgba(239, 68, 68, 0.25); }
        .home-category-name { font-size: 13px; font-weight: 600; color: #374151; }
        .home-voucher-scroll { display: flex; gap: 16px; overflow-x: auto; padding: 10px 5px 20px; scrollbar-width: thin; }
        .home-voucher-ticket { min-width: 290px; background: white; border-radius: 12px; display: flex; box-shadow: 0 2px 6px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; overflow: hidden; position: relative; transition: 0.3s; }
        .home-voucher-ticket:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }
        .v-left { width: 80px; background: linear-gradient(135deg, #f43f5e, #e11d48); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 2px dashed #fff; position: relative; }
        .v-left::before, .v-left::after { content: ''; position: absolute; right: -6px; width: 12px; height: 12px; background: #F9FAFB; border-radius: 50%; }
        .v-left::before { top: -6px; } .v-left::after { bottom: -6px; }
        .v-right { flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: center; }
        .v-code { font-weight: 800; color: #1f2937; font-size: 15px; letter-spacing: 0.5px; }
        .v-desc { font-size: 12px; color: #6b7280; margin: 4px 0 8px; line-height: 1.3; }
        .home-food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
        .home-food-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #f3f4f6; transition: 0.3s; display: flex; flex-direction: column; cursor: pointer; position: relative; }
        .home-food-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.1); border-color: #fdba74; }
        .home-food-img-wrapper { position: relative; width: 100%; height: 170px; }
        .home-food-img { width: 100%; height: 100%; object-fit: cover; }
        .food-badge { position: absolute; bottom: 10px; left: 10px; background: rgba(255,255,255,0.95); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .home-food-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .food-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #6b7280; margin-top: 6px; }
        .food-meta-item { display: flex; align-items: center; gap: 4px; }
        .home-btn-add { margin-top: 12px; width: 100%; background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.2s; }
        .home-btn-add:hover { background: #ea580c; color: white; border-color: #ea580c; }
        .review-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
        .review-card { min-width: 280px; max-width: 300px; background: white; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .review-avatar { width: 36px; height: 36px; background: #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #6b7280; }
        .review-content { font-size: 13px; color: #4b5563; line-height: 1.4; font-style: italic; background: #f9fafb; padding: 10px; border-radius: 8px; }
        .toast-notify { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1f2937; color: white; padding: 12px 24px; border-radius: 30px; z-index: 1000; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @media (max-width: 768px) { .home-section-container { padding: 24px 16px; } .home-title-main { font-size: 20px; } }
      `}</style>

      {/* --- HEADER --- */}
      <Header />

      {/* --- TOAST NOTIFICATION --- */}
      {toast && (
        <div className="toast-notify">
            <Check size={16} color="#4ade80"/> {toast}
        </div>
      )}

      <main className="home-main">
        {/* 1. HERO BANNER */}
        <section className="home-section-container" style={{paddingBottom: 0}}>
            <HeroBanner />
        </section>

        {/* 2. CATEGORIES */}
        <section className="home-section-container">
            <div className="home-category-grid">
                {loading ? <div style={{width:'100%', textAlign:'center'}}>Đang tải danh mục...</div> : 
                 categories.map((cat) => (
                    <div key={cat.id} className="home-category-item" onClick={() => navigate(`/search?cat=${cat.id}`)}>
                        <div className="home-icon-circle">{getCategoryIcon(cat.name)}</div>
                        <span className="home-category-name">{cat.name}</span>
                    </div>
                ))}
            </div>
        </section>

        {/* 3. EVENT BANNER (MỚI THÊM) */}
        <section className="home-section-container" style={{paddingTop: 0, paddingBottom: 0}}>
            <div style={{
                background: 'linear-gradient(90deg, #10b981, #059669)',
                borderRadius: 20, padding: '20px 30px', color: 'white',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }} onClick={() => navigate('/events')}>
                <div>
                    <h3 style={{margin: '0 0 5px', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8}}>
                        <Calendar size={20}/> SỰ KIỆN ẨM THỰC
                    </h3>
                    <p style={{margin: 0, fontSize: 13, opacity: 0.9}}>Khám phá lễ hội & workshop đang diễn ra</p>
                </div>
                <div style={{background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: '50%'}}>
                    <ArrowLeft size={24} style={{transform: 'rotate(180deg)', display:'block'}}/>
                </div>
            </div>
        </section>

        {/* 4. FEATURE BANNERS */}
        <section className="home-section-container">
            <FeatureBanners />
        </section>

        {/* 5. VOUCHERS */}
        {vouchers.length > 0 && (
            <section className="home-section-container" style={{background: '#fff', padding: '30px 20px', margin: '20px auto', borderRadius: 20}}>
                <div className="home-title-wrapper">
                    <div>
                        <h2 className="home-title-main" style={{fontSize: 22}}>
                            <Ticket color="#f43f5e" fill="#f43f5e" size={24}/> ƯU ĐÃI <span className="home-title-light">ĐỘC QUYỀN</span>
                        </h2>
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
                                <div className="v-code">{v.code}</div>
                                <div className="v-desc">
                                    {v.type === 'REWARD_ORDER' ? `Đơn tối thiểu ${v.conditionValue/1000}k` : `Giảm tối đa ${v.maxDiscount/1000}k`}
                                </div>
                                <button 
                                    onClick={() => handleCopyVoucher(v.code)}
                                    style={{background: copiedCode === v.code ? '#dcfce7' : '#fff1f2', color: copiedCode === v.code ? '#166534' : '#be123c', border: 'none', padding: '6px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap: 4}}
                                >
                                    {copiedCode === v.code ? <><Check size={12}/> ĐÃ LƯU</> : <><Copy size={12}/> LƯU MÃ</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* 6. DANH SÁCH MÓN ĂN */}
        <section className="home-section-container">
            <div className="home-title-wrapper">
                <div>
                   <h2 className="home-title-main">GỢI Ý <span className="home-title-light">HÔM NAY</span></h2>
                   <p className="home-subtitle">Khám phá các món ăn ngon xung quanh bạn</p>
                </div>
            </div>

            <div className="home-tabs">
                <button className={`home-tab-btn ${activeTab === 'suggest' ? 'active' : ''}`} onClick={() => setActiveTab('suggest')}><Star size={16}/> Gợi ý</button>
                <button className={`home-tab-btn ${activeTab === 'bestseller' ? 'active' : ''}`} onClick={() => setActiveTab('bestseller')}><Flame size={16}/> Bán chạy</button>
                <button className={`home-tab-btn ${activeTab === 'near_me' ? 'active' : ''}`} onClick={() => setActiveTab('near_me')}><MapPin size={16}/> Gần tôi</button>
                <button className="home-tab-btn" onClick={() => navigate('/search')}><Filter size={16}/> Bộ lọc khác</button>
            </div>

            {loading ? <div style={{textAlign:'center', padding: 40}}><Loader className="animate-spin" /></div> : (
              <>
                <div className="home-food-grid">
                    {foods.map(food => (
                        <div key={food.id} className="home-food-card" onClick={() => navigate(`/restaurant/1`)}>
                            <div className="home-food-img-wrapper">
                                <img src={getImageUrl(food.image)} onError={(e)=>{e.target.onerror=null; e.target.src="https://placehold.co/300x200?text=Món+Ngon"}} className="home-food-img" alt={food.name} />
                                <div className="food-badge"><Clock size={12} color="#f59e0b"/> {food.time}p</div>
                            </div>
                            <div className="home-food-body">
                                <h4 style={{fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#1f2937'}}>{food.name}</h4>
                                <span style={{fontSize: 13, color: '#6b7280'}}>{food.restaurantName || "Nhà hàng đối tác"}</span>
                                <div className="food-meta">
                                    <span className="food-meta-item"><Star size={12} fill="#fbbf24" color="#fbbf24"/> 4.8</span>
                                    <span style={{color:'#d1d5db'}}>•</span>
                                    <span className="food-meta-item"><MapPin size={12}/> {food.distance}km</span>
                                </div>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:'auto'}}>
                                    <span style={{fontSize: 16, fontWeight: 800, color: '#ef4444'}}>{formatPrice(food.price)}</span>
                                </div>
                                <button className="home-btn-add" onClick={(e) => { e.stopPropagation(); handleOpenModal(food); }}>
                                    <Plus size={18}/> Thêm vào giỏ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
              </>
            )}
        </section>

        {/* 7. REVIEW CỘNG ĐỒNG */}
        <section className="home-section-container" style={{background: '#F0F9FF', borderRadius: 24, padding: '40px 24px'}}>
            <div className="home-title-wrapper">
                <h2 className="home-title-main" style={{color: '#0369a1'}}><MessageSquare size={24}/> REVIEW <span className="home-title-light" style={{color: '#7dd3fc'}}>CỘNG ĐỒNG</span></h2>
            </div>
            <div className="review-scroll">
                {reviews.map(review => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <div className="review-avatar">{review.user.charAt(0)}</div>
                            <div>
                                <div style={{fontWeight: 700, fontSize: 14}}>{review.user}</div>
                                <div style={{display:'flex', gap:2}}>{[...Array(5)].map((_,i) => <Star key={i} size={10} fill={i < review.rating ? "#fbbf24" : "#e5e7eb"} color={i < review.rating ? "#fbbf24" : "#e5e7eb"}/>)}</div>
                            </div>
                        </div>
                        <div style={{fontSize: 12, fontWeight: 600, color: '#0369a1', marginBottom: 6}}>Món: {review.foodName}</div>
                        <div className="review-content">"{review.content}"</div>
                    </div>
                ))}
            </div>
        </section>

        {/* 8. NHÀ HÀNG TIÊU BIỂU */}
        <section className="home-section-container">
            <div className="home-title-wrapper">
               <h2 className="home-title-main">NHÀ HÀNG <span className="home-title-light">NỔI BẬT</span></h2>
            </div>
            <RestaurantList />
        </section>
      </main>

      {/* --- CHATBOT FLOATING --- */}
      <Chatbot />

      {/* --- FOOTER --- */}
      <Footer />

      {/* MODAL */}
      <FoodOptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        food={selectedFood} 
      />
    </div>
  );
};

export default Home;
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
  Calendar 
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

  // 👇 HÀM LẤY ẢNH ĐÃ FIX TRỎ VỀ RENDER
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/300x200?text=Món+Ngon";
    if (imagePath.startsWith('http')) return imagePath;
    // Thay link này bằng link Render thật của bạn
    return `https://backend-foodreview.onrender.com${imagePath}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song các API công khai
        const [resCat, resFood, resVoucher] = await Promise.all([
            api.get('/categories').catch(() => ({ data: [] })),
            api.get('/foods?size=12').catch(() => ({ data: { content: [] } })),
            api.get('/user-vouchers/available').catch(() => ({ data: [] }))
        ]);

        setCategories(resCat.data.slice(0, 10));

        const foodData = resFood.data.content || resFood.data || [];
        setFoods(foodData.map(f => ({
            ...f,
            distance: (Math.random() * 5 + 0.5).toFixed(1),
            time: Math.floor(Math.random() * 30 + 15)
        })));

        setVouchers(resVoucher.data.slice(0, 5));

        // Mock reviews (Có thể thay bằng API thật nếu đã xong ReviewController)
        setReviews([
            { id: 1, user: "Minh Anh", content: "Đồ ăn rất ngon!", rating: 5, foodName: "Pizza" },
            { id: 2, user: "Tuấn Hưng", content: "Giao hàng nhanh.", rating: 4, foodName: "Phở" },
        ]);

      } catch (error) {
        console.error("Lỗi tải trang chủ:", error);
        // Nếu lỗi 403, xóa token cũ vì có thể dữ liệu MySQL đã đổi
        if (error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
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
    if (!localStorage.getItem('token')) {
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
        .home-category-grid { display: flex; gap: 20px; overflow-x: auto; padding: 10px 5px; }
        .home-category-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; min-width: 80px; }
        .home-icon-circle { width: 64px; height: 64px; border-radius: 20px; background: white; display: flex; align-items: center; justify-content: center; color: #ef4444; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: 0.3s; }
        .home-category-item:hover .home-icon-circle { background: #ef4444; color: white; transform: translateY(-5px); }
        .home-voucher-scroll { display: flex; gap: 16px; overflow-x: auto; padding: 10px 5px 20px; }
        .home-voucher-ticket { min-width: 280px; background: white; border-radius: 12px; display: flex; border: 1px solid #e5e7eb; overflow: hidden; }
        .v-left { width: 80px; background: linear-gradient(135deg, #f43f5e, #e11d48); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 2px dashed #fff; }
        .v-right { flex: 1; padding: 12px; }
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
                {loading ? <Loader className="animate-spin mx-auto" /> : 
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

        <section className="home-section-container">
            <div className="home-title-wrapper">
                <h2 className="home-title-main">GỢI Ý <span className="home-title-light">HÔM NAY</span></h2>
            </div>
            <div className="home-tabs">
                <button className={`home-tab-btn ${activeTab === 'suggest' ? 'active' : ''}`} onClick={() => setActiveTab('suggest')}><Star size={16}/> Gợi ý</button>
                <button className={`home-tab-btn ${activeTab === 'bestseller' ? 'active' : ''}`} onClick={() => setActiveTab('bestseller')}><Flame size={16}/> Bán chạy</button>
            </div>

            <div className="home-food-grid">
                {foods.map(food => (
                    <div key={food.id} className="home-food-card" onClick={() => navigate(`/restaurant/${food.restaurantId || 1}`)}>
                        <div className="home-food-img-wrapper">
                            <img src={getImageUrl(food.image)} className="home-food-img" alt={food.name} />
                            <div style={{position:'absolute', bottom:10, left:10, background:'white', padding:'2px 8px', borderRadius:10, fontSize:11}}><Clock size={10}/> {food.time}p</div>
                        </div>
                        <div style={{padding: 16}}>
                            <h4 style={{fontWeight: 700, margin: 0}}>{food.name}</h4>
                            <div style={{fontSize: 12, color: '#6b7280', margin: '4px 0'}}>{food.restaurantName || "Nhà hàng"}</div>
                            <div style={{color: '#ef4444', fontWeight: 800}}>{formatPrice(food.price)}</div>
                            <button className="home-btn-add" onClick={(e) => { e.stopPropagation(); handleOpenModal(food); }}>Thêm vào giỏ</button>
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
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RestaurantList from './RestaurantList';
import api from '../api/axios';
import FoodOptionModal from '../components/FoodOptionModal';

// --- 1. IMPORT CÁC BANNER MỚI ---
import HeroBanner from '../components/banners/HeroBanner';
import FeatureBanners from '../components/banners/FeatureBanners';

import { 
  Star, Loader, Pizza, Coffee, Utensils, Sandwich, IceCream, Carrot, Beer, Croissant, Plus, Ticket, Copy, Check, ArrowLeft
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  
  // --- STATE DỮ LIỆU ---
  const [categories, setCategories] = useState([]);
  const [randomFoods, setRandomFoods] = useState([]); 
  const [vouchers, setVouchers] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- STATE MODAL & UI ---
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null); 

  // --- TỪ ĐIỂN ICON ---
  const categoryIcons = {
    "pizza": <Pizza size={32} />, "burger": <Sandwich size={32} />, "bánh mì": <Sandwich size={32} />,
    "cà phê": <Coffee size={32} />, "đồ uống": <Beer size={32} />, "tráng miệng": <IceCream size={32} />,
    "kem": <IceCream size={32} />, "healthy": <Carrot size={32} />, "chay": <Carrot size={32} />,
    "bánh ngọt": <Croissant size={32} />, "cơm": <Utensils size={32} />, "phở": <Utensils size={32} />,
    "bún": <Utensils size={32} />,
  };

  const getCategoryIcon = (name) => {
    const key = name?.toLowerCase();
    for (const k in categoryIcons) { if (key && key.includes(k)) return categoryIcons[k]; }
    return <Utensils size={32} />;
  };

  // --- API CALLS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resCat, resFood, resVoucher] = await Promise.all([
            api.get('/categories'),
            api.get('/foods?size=8'),
            api.get('/user-vouchers/available')
        ]);

        const cats = resCat.data || [];
        setCategories([...cats].sort(() => 0.5 - Math.random()).slice(0, 8));

        const foods = resFood.data.content || resFood.data || [];
        setRandomFoods([...foods].sort(() => 0.5 - Math.random()));

        const allVouchers = resVoucher.data || [];
        // Lọc voucher công khai để hiển thị ở carousel dưới cùng
        const hotVouchers = allVouchers.filter(v => v.type === 'PUBLIC' || v.type === 'EVENT' || v.type === 'REWARD_ORDER').slice(0, 5);
        setVouchers(hotVouchers);

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
    setTimeout(() => setCopiedCode(null), 2000); 
  };

  // Hàm chuyển hướng có kiểm tra đăng nhập (Dùng cho nút Xem tất cả voucher dưới list)
  const handleNavigateProtected = (path) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        if(window.confirm("Bạn cần đăng nhập để sử dụng tính năng này! Đi đến trang đăng nhập?")) {
            navigate('/login');
        }
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

  const styles = {
    layout: "home-layout", main: "home-main", sectionContainer: "home-section-container",
    sectionTitleWrapper: "home-title-wrapper",
    badge: "home-badge", titleMain: "home-title-main", titleLight: "home-title-light",
    categoryGrid: "home-category-grid", categoryItem: "home-category-item", iconCircle: "home-icon-circle",
    foodGrid: "home-food-grid", foodCard: "home-food-card", foodImg: "home-food-img", foodBody: "home-food-body",
    foodName: "home-food-name", foodPrice: "home-food-price", btnAdd: "home-btn-add",
    voucherScroll: "home-voucher-scroll", voucherTicket: "home-voucher-ticket", 
    vLeft: "home-v-left", vRight: "home-v-right", vDashed: "home-v-dashed", vBtnCopy: "v-btn-copy"
  };

  return (
    <div className={styles.layout}>
      <style>{`
        .home-layout { min-height: 100vh; display: flex; flex-direction: column; background-color: #F9FAFB; font-family: 'Inter', sans-serif; position: relative; }
        .home-main { flex-grow: 1; }
        .home-section-container { max-width: 1200px; margin: 0 auto; padding: 50px 20px; width: 100%; box-sizing: border-box; }
        .home-title-wrapper { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
        .home-badge { display: inline-flex; align-items: center; gap: 6px; color: #ef4444; font-weight: bold; font-size: 13px; text-transform: uppercase; background: #fee2e2; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px; }
        .home-title-main { font-size: 28px; font-weight: 900; color: #111827; margin: 0; line-height: 1.2; }
        .home-title-light { color: #9ca3af; font-weight: 300; }
        
        /* CSS CHO NÚT BACK */
        .home-btn-back {
            position: fixed; top: 100px; left: 20px; z-index: 100;
            width: 40px; height: 40px; background: white; border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center;
            cursor: pointer; border: 1px solid #e5e7eb; transition: 0.2s;
        }
        .home-btn-back:hover { background: #f3f4f6; transform: scale(1.1); }

        /* Categories */
        .home-category-grid { display: flex; gap: 24px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
        .home-category-item { display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; min-width: 90px; }
        .home-icon-circle { width: 70px; height: 70px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; color: #ef4444; border: 1px solid #e5e7eb; transition: 0.3s; }
        .home-category-item:hover .home-icon-circle { background: #ef4444; color: white; transform: translateY(-5px); border-color: #ef4444; }
        
        /* Voucher Carousel Styles */
        .home-voucher-scroll { display: flex; gap: 20px; overflow-x: auto; padding: 10px 5px 20px; scrollbar-width: thin; }
        .home-voucher-ticket { min-width: 280px; height: 100px; background: white; border-radius: 12px; display: flex; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; position: relative; transition: 0.3s; overflow: hidden; }
        .home-voucher-ticket:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #fca5a5; }
        .home-v-left { width: 90px; background: #f43f5e; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; border-right: 2px dashed white; }
        .home-v-right { flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: center; }
        .v-btn-copy { margin-top: auto; align-self: flex-start; background: #fff1f2; color: #f43f5e; border: none; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; alignItems: center; gap: 4px; }
        .v-btn-copy:hover { background: #ffe4e6; }

        /* Food Grid Styles */
        .home-food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px; }
        .home-food-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #f3f4f6; transition: 0.3s; display: flex; flex-direction: column; cursor: pointer; }
        .home-food-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border-color: #fed7aa; }
        .home-food-img { width: 100%; height: 170px; object-fit: cover; }
        .home-food-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .home-btn-add { margin-top: auto; width: 100%; background: #f3f4f6; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.2s; color: #374151; }
        .home-btn-add:hover { background: #ea580c; color: white; }

        @media (max-width: 768px) {
            .home-title-main { font-size: 22px; }
            .home-section-container { padding: 30px 16px; }
            .home-btn-back { top: 80px; left: 10px; }
        }
      `}</style>

      {/* --- NÚT BACK --- */}
      <button className="home-btn-back" onClick={() => navigate(-1)} title="Quay lại">
        <ArrowLeft size={20} color="#4b5563"/>
      </button>

      <Header />

      <main className={styles.main}>
        {/* --- 1. HERO BANNER MỚI (Thay thế Slider cũ) --- */}
        <section className={styles.sectionContainer} style={{paddingBottom: 0}}>
            <HeroBanner />
        </section>

        {/* --- 2. FEATURE BANNERS MỚI (Thay thế các hộp Promo cũ) --- */}
        <section className={styles.sectionContainer}>
            <FeatureBanners />
        </section>

        {/* 3. CATEGORIES */}
        <section className={styles.sectionContainer} style={{paddingTop: 0}}>
            <div className={styles.sectionTitleWrapper}>
                <div>
                   <h2 className={styles.titleMain}>THỰC ĐƠN <span className={styles.titleLight}>HÔM NAY</span></h2>
                </div>
            </div>
            {loading ? <div style={{textAlign:'center', color:'#9ca3af'}}>Đang tải...</div> : (
               <div className={styles.categoryGrid}>
                  {categories.map((cat) => (
                      <div key={cat.id} className={styles.categoryItem} onClick={() => navigate(`/search?cat=${cat.id}`)}>
                          <div className={styles.iconCircle}>{getCategoryIcon(cat.name)}</div>
                          <span>{cat.name}</span>
                      </div>
                  ))}
               </div>
            )}
        </section>

        {/* 4. VOUCHER CAROUSEL (Hiển thị list voucher công khai) */}
        {vouchers.length > 0 && (
            <section className={styles.sectionContainer} style={{paddingTop: 0}}>
                <div className={styles.sectionTitleWrapper} style={{marginBottom: 10}}>
                    <div>
                        <div className={styles.badge} style={{background:'#fff1f2', color:'#be123c'}}>
                           <Ticket size={14}/> Ưu đãi
                        </div>
                        <h2 className={styles.titleMain} style={{fontSize: 24}}>MÃ GIẢM GIÁ <span className={styles.titleLight}>HOT</span></h2>
                    </div>
                    <span onClick={() => handleNavigateProtected('/vouchers')} style={{fontSize: 14, color:'#f43f5e', cursor:'pointer', fontWeight: 600}}>Xem tất cả &rarr;</span>
                </div>
                
                <div className={styles.voucherScroll}>
                    {vouchers.map(v => (
                        <div key={v.id} className={styles.voucherTicket}>
                            <div className={styles.vLeft}>
                                <span>{v.percent}%</span>
                                <span style={{fontSize: 10, fontWeight: 400}}>GIẢM</span>
                            </div>
                            <div className={styles.vRight}>
                                <div style={{fontWeight: 800, color: '#374151', fontSize: 14}}>{v.code}</div>
                                <div style={{fontSize: 11, color: '#6b7280', margin: '2px 0 6px'}}>
                                    {v.type === 'REWARD_ORDER' ? `Đơn từ ${v.conditionValue/1000}k` : `Giảm tối đa ${v.maxDiscount}k`}
                                </div>
                                <button className={styles.vBtnCopy} onClick={() => handleCopyVoucher(v.code)}>
                                    {copiedCode === v.code ? <><Check size={12}/> Đã lưu</> : <><Copy size={12}/> Lưu mã</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* 5. RANDOM FOODS */}
        <section className={styles.sectionContainer}>
            <div className={styles.sectionTitleWrapper}>
                <div>
                   <h2 className={styles.titleMain}>MÓN NGON <span className={styles.titleLight}>ĐỀ XUẤT</span></h2>
                   <p style={{color:'#6b7280', margin:'5px 0 0'}}>Dựa trên sở thích của bạn</p>
                </div>
            </div>

            {loading ? <div style={{textAlign:'center'}}><Loader className="animate-spin" /></div> : (
              <div className={styles.foodGrid}>
                  {randomFoods.map(food => (
                      <div key={food.id} className={styles.foodCard} onClick={() => navigate(`/restaurant/1`)}>
                          <img 
                             src={getImageUrl(food.image)} 
                             onError={(e)=>{e.target.onerror=null; e.target.src="https://placehold.co/300x200?text=Món+Ngon"}}
                             className={styles.foodImg} alt={food.name} 
                          />
                          <div className={styles.foodBody}>
                              <div style={{marginBottom: 10}}>
                                  <h4 className={styles.foodName}>{food.name}</h4>
                                  <span style={{fontSize: 13, color: '#6b7280'}}>{food.restaurantName || "Nhà hàng đối tác"}</span>
                              </div>
                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'auto', marginBottom: 12}}>
                                  <span className={styles.foodPrice}>{formatPrice(food.price)}</span>
                                  <div style={{display:'flex', gap: 2}}>
                                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#fbbf24" color="#fbbf24"/>)}
                                  </div>
                              </div>
                              <button className={styles.btnAdd} onClick={(e) => { e.stopPropagation(); handleOpenModal(food); }}>
                                  <Plus size={18}/> Thêm
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
            )}
        </section>

        {/* 6. RESTAURANT LIST */}
        <section className={styles.sectionContainer} style={{background: '#fff', borderRadius: 30, padding: '40px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'}}>
            <div className={styles.sectionTitleWrapper}>
               <h2 className={styles.titleMain}>NHÀ HÀNG <span className={styles.titleLight}>TIÊU BIỂU</span></h2>
            </div>
            <RestaurantList />
        </section>
      </main>

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
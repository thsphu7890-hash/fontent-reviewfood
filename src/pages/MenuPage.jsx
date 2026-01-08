import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FoodOptionModal from '../components/FoodOptionModal';
import Chatbot from "../components/ChatBot"; 

import {
  Search, Grid, List as ListIcon,
  Star, ChevronLeft, ChevronRight, 
  Plus, UtensilsCrossed, Filter, MapPin, Clock, ArrowLeft,
  Pizza, Sandwich, Coffee, Beer, IceCream, Carrot, Croissant, Utensils, Flame
} from 'lucide-react';

const MenuPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE DỮ LIỆU ---
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // --- STATE UI ---
  const activeCat = searchParams.get('cat') || 'all';
  const [viewMode, setViewMode] = useState('grid'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('newest'); 

  // --- ICON HELPER (Giống Home) ---
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

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Lấy Categories
      const resCat = await api.get('/categories');
      setCategories(resCat.data || []);

      // 2. Lấy Foods (Có phân trang & search)
      const params = { 
        page: currentPage, 
        size: pageSize, 
        search: searchQuery || undefined,
        categoryId: activeCat !== 'all' ? activeCat : undefined
      };

      const resFood = await api.get('/foods', { params });
      
      let content = [];
      let total = 0;

      if (resFood.data) {
         if (Array.isArray(resFood.data.content)) {
             content = resFood.data.content;
             total = resFood.data.totalPages;
         } else if (Array.isArray(resFood.data)) {
             content = resFood.data;
             total = 1;
         }
      }

      // Giả lập dữ liệu khoảng cách/thời gian giống trang Home
      const enhancedFoods = content.map(f => ({
            ...f,
            distance: (Math.random() * 5 + 0.5).toFixed(1),
            time: Math.floor(Math.random() * 30 + 15)
      }));

      setFoods(enhancedFoods);
      setTotalPages(total);

    } catch (e) {
      console.error("Lỗi:", e);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeCat, searchQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- HANDLERS ---
  const handleOpenModal = (food) => { setSelectedFood(food); setIsModalOpen(true); };

  const handleCategoryChange = (catId) => {
    setCurrentPage(0);
    setSearchParams({ cat: catId });
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {/* DÙNG LẠI Y NGUYÊN CSS CỦA HOME.JS 
          ĐỂ ĐẢM BẢO KHÔNG BỊ LỖI GIAO DIỆN ĐEN 
      */}
      <style>{`
        .home-layout { min-height: 100vh; display: flex; flex-direction: column; background-color: #F9FAFB; font-family: 'Inter', sans-serif; position: relative; }
        .home-main { flex-grow: 1; }
        .home-section-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; width: 100%; box-sizing: border-box; }
        
        /* Typography */
        .home-title-wrapper { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
        .home-title-main { font-size: 26px; font-weight: 800; color: #1f2937; margin: 0; display: flex; align-items: center; gap: 8px; }
        .home-title-light { color: #9ca3af; font-weight: 300; }
        .home-subtitle { color: #6b7280; font-size: 14px; margin-top: 4px; }
        
        /* Buttons */
        .home-btn-back { position: fixed; top: 100px; left: 20px; z-index: 90; width: 40px; height: 40px; background: white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #e5e7eb; transition: 0.2s; }
        .home-btn-back:hover { transform: scale(1.1); background: #f3f4f6; }
        
        /* Tabs */
        .home-tabs { display: flex; gap: 12px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
        .home-tab-btn { padding: 8px 20px; border-radius: 24px; border: 1px solid #e5e7eb; background: white; font-weight: 600; color: #4b5563; cursor: pointer; transition: 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
        .home-tab-btn.active { background: #ef4444; color: white; border-color: #ef4444; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); }
        
        /* Categories */
        .home-category-grid { display: flex; gap: 20px; overflow-x: auto; padding: 10px 5px; scrollbar-width: none; }
        .home-category-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; min-width: 80px; transition: 0.2s; }
        .home-icon-circle { width: 64px; height: 64px; border-radius: 20px; background: white; display: flex; align-items: center; justify-content: center; color: #ef4444; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: 0.3s; }
        .home-category-item:hover .home-icon-circle,
        .home-category-item.active .home-icon-circle { background: #ef4444; color: white; transform: translateY(-5px); box-shadow: 0 8px 15px rgba(239, 68, 68, 0.25); }
        .home-category-name { font-size: 13px; font-weight: 600; color: #374151; }
        .home-category-item.active .home-category-name { color: #ef4444; }

        /* Food Card */
        .home-food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
        .list-view-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }

        .home-food-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #f3f4f6; transition: 0.3s; display: flex; flex-direction: column; cursor: pointer; position: relative; }
        .home-food-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.1); border-color: #fdba74; }
        
        .home-food-card.list-mode { flex-direction: row; height: 160px; }
        .home-food-card.list-mode .home-food-img-wrapper { width: 180px; height: 100%; }
        .home-food-card.list-mode .home-food-body { padding: 16px 24px; }

        .home-food-img-wrapper { position: relative; width: 100%; height: 170px; }
        .home-food-img { width: 100%; height: 100%; object-fit: cover; }
        .food-badge { position: absolute; bottom: 10px; left: 10px; background: rgba(255,255,255,0.95); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        
        .home-food-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .food-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #6b7280; margin-top: 6px; }
        .food-meta-item { display: flex; align-items: center; gap: 4px; }
        
        .home-btn-add { margin-top: 12px; width: 100%; background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.2s; }
        .home-btn-add:hover { background: #ea580c; color: white; border-color: #ea580c; }

        /* Search Bar riêng cho MenuPage */
        .menu-search-wrapper { background: white; padding: 8px 16px; border-radius: 50px; border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 10px; width: 100%; max-width: 500px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: 0.3s; }
        .menu-search-wrapper:focus-within { border-color: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15); }
        .menu-search-input { border: none; outline: none; flex: 1; font-size: 15px; color: #374151; }

        /* Pagination */
        .mn-pagination { display: flex; justify-content: center; gap: 8px; margin-top: 50px; }
        .mn-page-btn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e5e7eb; background: white; color: #64748b; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .mn-page-btn:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; }
        .mn-page-btn.active { background: #1f2937; color: white; border-color: #1f2937; }
        .mn-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
            .home-food-card.list-mode { flex-direction: column; height: auto; }
            .home-food-card.list-mode .home-food-img-wrapper { width: 100%; height: 170px; }
            .menu-search-wrapper { max-width: 100%; margin-top: 10px; }
        }
      `}</style>

      {/* Floating Back Button */}
      <button className="home-btn-back" onClick={() => navigate(-1)} title="Quay lại">
        <ArrowLeft size={20} color="#4b5563"/>
      </button>

      <Header />

      <main className="home-main">
        <div className="home-section-container">
            
            {/* 1. TITLE & SEARCH */}
            <div className="home-title-wrapper" style={{flexWrap: 'wrap', gap: 20}}>
                <div>
                   <h2 className="home-title-main">THỰC ĐƠN <span className="home-title-light">HÔM NAY</span></h2>
                   <p className="home-subtitle">Tìm kiếm và khám phá hơn {foods.length}+ món ăn</p>
                </div>
                
                {/* Search Bar */}
                <div className="menu-search-wrapper">
                   <Search size={18} color="#9ca3af" />
                   <input 
                      type="text" 
                      className="menu-search-input" 
                      placeholder="Tìm tên món ăn, nhà hàng..." 
                      value={searchQuery}
                      onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(0);}}
                   />
                </div>
            </div>

            {/* 2. CATEGORIES (Dùng Style của Home) */}
            <div className="home-category-grid" style={{marginBottom: 30}}>
               <div className={`home-category-item ${activeCat === 'all' ? 'active' : ''}`} onClick={() => handleCategoryChange('all')}>
                   <div className="home-icon-circle"><UtensilsCrossed size={24}/></div>
                   <span className="home-category-name">Tất cả</span>
               </div>
               {categories.map((cat) => (
                  <div key={cat.id} className={`home-category-item ${activeCat === cat.id.toString() ? 'active' : ''}`} onClick={() => handleCategoryChange(cat.id.toString())}>
                      <div className="home-icon-circle">{getCategoryIcon(cat.name)}</div>
                      <span className="home-category-name">{cat.name}</span>
                  </div>
               ))}
            </div>

            {/* 3. TABS / VIEW MODE */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20, flexWrap:'wrap', gap:10}}>
                <div className="home-tabs" style={{margin:0}}>
                    <button className={`home-tab-btn ${activeTab === 'newest' ? 'active' : ''}`} onClick={() => setActiveTab('newest')}><Filter size={16}/> Mới nhất</button>
                    <button className={`home-tab-btn ${activeTab === 'popular' ? 'active' : ''}`} onClick={() => setActiveTab('popular')}><Flame size={16}/> Bán chạy</button>
                    <button className={`home-tab-btn ${activeTab === 'fast' ? 'active' : ''}`} onClick={() => setActiveTab('fast')}><Clock size={16}/> Giao nhanh</button>
                </div>
                <div className="home-tabs" style={{margin:0}}>
                    <button className={`home-tab-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid size={16}/></button>
                    <button className={`home-tab-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><ListIcon size={16}/></button>
                </div>
            </div>

            {/* 4. FOOD LIST (Dùng Style Card của Home) */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>Đang tải thực đơn...</div>
            ) : foods.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>
                    <UtensilsCrossed size={50} style={{marginBottom:10}}/>
                    <p>Không tìm thấy món ăn nào phù hợp.</p>
                </div>
            ) : (
                <>
                  <div className={viewMode === 'grid' ? 'home-food-grid' : 'list-view-grid'}>
                    {foods.map(food => (
                        <div key={food.id} className={`home-food-card ${viewMode === 'list' ? 'list-mode' : ''}`} onClick={() => navigate(`/restaurant/1`)}>
                            <div className="home-food-img-wrapper">
                                <img 
                                  src={getImageUrl(food.image)} 
                                  onError={(e)=>{e.target.onerror=null; e.target.src="https://placehold.co/300x200?text=Món+Ngon"}} 
                                  className="home-food-img" 
                                  alt={food.name} 
                                />
                                <div className="food-badge"><Clock size={12} color="#f59e0b"/> {food.time}p</div>
                            </div>
                            <div className="home-food-body">
                                <h4 style={{fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#1f2937'}}>{food.name}</h4>
                                <span style={{fontSize: 13, color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                  {food.description || "Món ngon trứ danh, hương vị đậm đà khó quên."}
                                </span>
                                
                                <div className="food-meta">
                                    <span className="food-meta-item"><Star size={12} fill="#fbbf24" color="#fbbf24"/> 4.8</span>
                                    <span style={{color:'#d1d5db'}}>•</span>
                                    <span className="food-meta-item"><MapPin size={12}/> {food.distance}km</span>
                                </div>

                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:'auto'}}>
                                    <span style={{fontSize: 18, fontWeight: 800, color: '#ef4444', marginTop: 10}}>{formatPrice(food.price)}</span>
                                </div>
                                
                                <button className="home-btn-add" onClick={(e) => { e.stopPropagation(); handleOpenModal(food); }}>
                                    <Plus size={18}/> {viewMode === 'list' ? 'Thêm vào giỏ hàng' : 'Thêm'}
                                </button>
                            </div>
                        </div>
                    ))}
                  </div>

                  {/* 5. PAGINATION */}
                  {totalPages > 0 && (
                    <div className="mn-pagination">
                      <button className="mn-page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                        <ChevronLeft size={20}/>
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i} className={`mn-page-btn ${currentPage === i ? 'active' : ''}`} onClick={() => handlePageChange(i)}>
                          {i + 1}
                        </button>
                      ))}

                      <button className="mn-page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                        <ChevronRight size={20}/>
                      </button>
                    </div>
                  )}
                </>
            )}
        </div>
      </main>

      <Chatbot />
      <Footer />
      <FoodOptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} food={selectedFood} />
    </div>
  );
};

export default MenuPage;
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Search, Filter, Star, Clock, MapPin, 
  Utensils, X, ShoppingCart, Store, ChevronDown, Heart, ChevronLeft, ChevronRight, Home, Flame
} from 'lucide-react';
import FoodOptionModal from '../components/FoodOptionModal';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [searchType, setSearchType] = useState('food');
  const [keyword, setKeyword] = useState(query.get('keyword') || '');
  const [categoryId, setCategoryId] = useState(query.get('cat') || 'ALL');
  
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  // Filters
  const [sortBy, setSortBy] = useState('newest'); 
  const [priceRange, setPriceRange] = useState('ALL');

  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Popular Tags
  const popularTags = ["Cơm tấm", "Trà sữa", "Bún đậu", "Pizza", "Gà rán", "Healthy"];

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [keyword, categoryId, sortBy, priceRange, searchType]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = searchType === 'food' ? '/foods' : '/restaurants';
        const res = await api.get(endpoint, { params: { size: 1000 } });
        let allData = res.data.content || res.data;

        // FILTER CLIENT-SIDE
        if (keyword) {
            const k = keyword.toLowerCase();
            allData = allData.filter(item => item.name.toLowerCase().includes(k));
        }
        if (categoryId !== 'ALL' && searchType === 'food') {
            allData = allData.filter(item => item.categoryId == categoryId);
        }
        if (searchType === 'food') {
            if (priceRange === 'LOW') allData = allData.filter(f => f.price < 30000);
            else if (priceRange === 'MID') allData = allData.filter(f => f.price >= 30000 && f.price <= 70000);
            else if (priceRange === 'HIGH') allData = allData.filter(f => f.price > 70000);
            
            if (sortBy === 'price_asc') allData.sort((a, b) => a.price - b.price);
            else if (sortBy === 'price_desc') allData.sort((a, b) => b.price - a.price);
        }

        setTotalPages(Math.ceil(allData.length / pageSize));
        const paginatedData = allData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        setResults(paginatedData);

      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    const timeout = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(timeout);
  }, [keyword, categoryId, sortBy, priceRange, searchType, currentPage]);

  const updateUrl = (key, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== 'ALL') params.set(key, value);
    else params.delete(key);
    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleOpenModal = (food) => { setSelectedFood(food); setIsModalOpen(true); };
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
  const getImg = (img) => img?.startsWith('http') ? img : `http://localhost:8080${img}`;

  // Skeleton
  const SkeletonCard = () => (
    <div className="card-item skeleton-card">
        <div className="skeleton-img"></div>
        <div className="card-body">
            <div className="skeleton-line w-80"></div>
            <div className="skeleton-line w-60"></div>
            <div className="food-footer" style={{border:0}}>
                <div className="skeleton-line w-40"></div>
                <div className="skeleton-circle"></div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="search-layout">
      <style>{`
        .search-layout { background: #f3f4f6; min-height: 100vh; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }

        /* BREADCRUMB */
        .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6b7280; margin-bottom: 20px; }
        .breadcrumb a { color: #6b7280; text-decoration: none; display: flex; align-items: center; gap: 4px; transition: 0.2s; }
        .breadcrumb a:hover { color: #ef4444; } /* Red hover */
        .breadcrumb span { color: #9ca3af; }

        /* HEADER SEARCH */
        .search-header { 
            background: white; padding: 24px; border-radius: 16px; 
            box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05); margin-bottom: 30px; 
            position: sticky; top: 80px; z-index: 40; border-top: 4px solid #ef4444; /* Red Border Top */
        }
        
        .search-box-wrapper { position: relative; margin-bottom: 12px; }
        .search-input { 
            width: 100%; padding: 14px 50px; border: 1px solid #e5e7eb; border-radius: 12px; 
            font-size: 16px; outline: none; transition: 0.2s; background: #f9fafb; box-sizing: border-box; 
        }
        .search-input:focus { background: white; border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); } /* Red Focus */
        .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .clear-icon { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); color: #9ca3af; cursor: pointer; }

        /* POPULAR TAGS */
        .popular-tags { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .tag-item { 
            font-size: 12px; background: #fff1f2; /* Light Red */
            padding: 4px 12px; border-radius: 20px; color: #ef4444; /* Red Text */
            cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 4px; font-weight: 500;
        }
        .tag-item:hover { background: #fee2e2; transform: translateY(-2px); }

        /* TABS */
        .type-tabs { display: flex; gap: 6px; margin-bottom: 20px; background: #f3f4f6; padding: 4px; border-radius: 12px; width: fit-content; }
        .type-tab { 
            padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; 
            transition: all 0.2s; display: flex; align-items: center; gap: 8px; border: none; background: transparent; color: #6b7280; 
        }
        .type-tab.active { background: white; color: #ef4444; box-shadow: 0 2px 4px rgba(0,0,0,0.05); } /* Red Active */

        /* FILTERS */
        .filters-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .filter-chip { 
            padding: 8px 16px; border-radius: 10px; border: 1px solid #e5e7eb; background: white; 
            font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.2s; 
            display: flex; align-items: center; gap: 6px; color: #374151; position: relative;
        }
        .filter-chip:hover { border-color: #fca5a5; background: #fff1f2; }
        .filter-chip.active { border-color: #ef4444; background: #ef4444; color: white; font-weight: 600; } /* Red Active */
        .select-hidden { position: absolute; opacity: 0; width: 100%; height: 100%; left: 0; top: 0; cursor: pointer; }

        /* BANNER */
        .mini-banner {
            background: linear-gradient(135deg, #111827, #374151); /* Black Gradient */
            border-radius: 16px; padding: 20px 30px; margin-bottom: 30px;
            color: white; display: flex; justify-content: space-between; align-items: center;
            box-shadow: 0 8px 20px -5px rgba(0,0,0,0.3); border: 1px solid #374151;
        }
        .mini-banner h3 { margin: 0 0 4px 0; font-size: 18px; color: #fca5a5; /* Light Red Text */ }
        .mini-btn { background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 30px; font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; }
        .mini-btn:hover { background: #dc2626; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); }

        /* GRID SYSTEM */
        .result-info { margin: 0 0 20px; font-size: 15px; color: #374151; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .grid-layout { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
            gap: 24px; 
        }

        /* CARD STYLE */
        .card-item { 
            background: white; border-radius: 16px; overflow: hidden; 
            border: 1px solid transparent; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;
            display: flex; flex-direction: column; height: 100%; position: relative;
        }
        .card-item:hover { transform: translateY(-6px); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.1); border-color: #fca5a5; }
        
        .card-img-box { position: relative; padding-top: 65%; overflow: hidden; background: #f3f4f6; }
        .card-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .card-item:hover .card-img { transform: scale(1.08); }
        
        .card-badge { 
            position: absolute; top: 10px; left: 10px; 
            background: rgba(239, 68, 68, 0.9); color: white; /* Red Badge */
            padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 4px; z-index: 2;
        }

        .card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .card-title { font-weight: 700; color: #111827; font-size: 16px; margin-bottom: 6px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .res-meta { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #6b7280; margin-top: auto; }
        .res-rating { display: flex; align-items: center; gap: 4px; color: #f59e0b; font-weight: 700; }
        
        .food-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px dashed #f3f4f6; }
        .food-price { font-weight: 700; color: #ef4444; font-size: 17px; /* Red Price */ }
        .food-btn { width: 36px; height: 36px; border-radius: 10px; background: #111827; color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .food-btn:hover { background: #ef4444; }

        /* PAGINATION */
        .pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 50px; }
        .page-btn { 
            width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e5e7eb; background: white; 
            display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; color: #4b5563; font-weight: 600; font-size: 14px;
        }
        .page-btn:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; }
        .page-btn.active { background: #ef4444; color: white; border-color: #ef4444; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3); }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #f3f4f6; }

        /* SKELETON */
        .skeleton-card .skeleton-img { width: 100%; padding-top: 65%; background: #e5e7eb; animation: pulse 1.5s infinite; }
        .skeleton-line { height: 16px; background: #e5e7eb; border-radius: 4px; margin-bottom: 8px; animation: pulse 1.5s infinite; }
        .skeleton-circle { width: 36px; height: 36px; border-radius: 10px; background: #e5e7eb; animation: pulse 1.5s infinite; }
        .w-80 { width: 80%; } .w-60 { width: 60%; } .w-40 { width: 40%; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

        /* EMPTY STATE */
        .empty-state { grid-column: 1/-1; text-align: center; padding: 80px 0; color: #9ca3af; }
        .empty-icon { width: 100px; height: 100px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px; }

        @media (max-width: 768px) {
            .search-header { padding: 15px; top: 60px; }
            .grid-layout { grid-template-columns: 1fr; }
            .mini-banner { flex-direction: column; text-align: center; gap: 10px; }
        }
      `}</style>

      <div className="container">
        
        {/* --- BREADCRUMB --- */}
        <div className="breadcrumb">
            <Link to="/"><Home size={14}/> Trang chủ</Link>
            <span>/</span>
            <span style={{color:'#111827', fontWeight:600}}>Tìm kiếm</span>
        </div>

        {/* --- HEADER --- */}
        <div className="search-header">
            <div className="search-box-wrapper">
                <Search size={22} className="search-icon"/>
                <input 
                    className="search-input"
                    placeholder={searchType === 'food' ? "Tìm món gì hôm nay?" : "Tìm tên nhà hàng, quán ăn..."}
                    value={keyword}
                    onChange={(e) => { setKeyword(e.target.value); updateUrl('keyword', e.target.value); }}
                />
                {keyword && <X size={18} className="clear-icon" onClick={()=>{setKeyword(''); updateUrl('keyword', null)}}/>}
            </div>

            {/* Popular Tags */}
            <div className="popular-tags">
                <span style={{fontSize:12, fontWeight:600, color:'#374151'}}>Gợi ý:</span>
                {popularTags.map(tag => (
                    <div key={tag} className="tag-item" onClick={() => {setKeyword(tag); updateUrl('keyword', tag)}}>
                        <Flame size={12} color="#ef4444"/> {tag}
                    </div>
                ))}
            </div>

            <div className="type-tabs">
                <button className={`type-tab ${searchType === 'food' ? 'active' : ''}`} onClick={() => { setSearchType('food'); }}>
                    <Utensils size={16}/> Món ăn
                </button>
                <button className={`type-tab ${searchType === 'restaurant' ? 'active' : ''}`} onClick={() => { setSearchType('restaurant'); }}>
                    <Store size={16}/> Nhà hàng
                </button>
            </div>

            <div className="filters-row">
                <div style={{color:'#4b5563', marginRight:8, display:'flex', alignItems:'center', gap:4}}><Filter size={16}/> Bộ lọc:</div>
                
                {searchType === 'food' && (
                    <>
                        <div className={`filter-chip ${categoryId === 'ALL' ? 'active' : ''}`} onClick={() => {setCategoryId('ALL'); updateUrl('cat', null)}}>
                            Tất cả
                        </div>
                        {categories.map(c => (
                            <div key={c.id} className={`filter-chip ${categoryId == c.id ? 'active' : ''}`} onClick={() => {setCategoryId(c.id); updateUrl('cat', c.id)}}>
                                {c.name}
                            </div>
                        ))}
                        <div style={{width:1, height:24, background:'#e5e7eb', margin:'0 8px'}}></div>
                        
                        <div className={`filter-chip ${priceRange !== 'ALL' ? 'active' : ''}`}>
                            {priceRange === 'ALL' ? 'Mức giá' : 'Đã chọn giá'} <ChevronDown size={14}/>
                            <select className="select-hidden" value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                                <option value="ALL">Tất cả mức giá</option>
                                <option value="LOW">Dưới 30k</option>
                                <option value="MID">30k - 70k</option>
                                <option value="HIGH">Trên 70k</option>
                            </select>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* --- BANNER QUẢNG CÁO --- */}
        {!loading && results.length > 0 && (
            <div className="mini-banner">
                <div style={{display:'flex', alignItems:'center', gap:15}}>
                    <div style={{background:'rgba(255,255,255,0.1)', padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.2)'}}>
                        <Utensils size={24} color="#fca5a5"/>
                    </div>
                    <div>
                        <h3>Freeship Xtra cho đơn từ 50k</h3>
                        <p>Nhập mã <b>FREESHIP50</b> khi thanh toán nhé!</p>
                    </div>
                </div>
                <button className="mini-btn">Lưu mã ngay</button>
            </div>
        )}

        {/* --- KẾT QUẢ --- */}
        <div className="result-info">
            {loading ? 'Đang tải dữ liệu...' : `Hiển thị trang ${currentPage + 1}/${totalPages || 1} • ${results.length} kết quả`}
        </div>

        <div className="grid-layout">
            {/* LOADING SKELETON */}
            {loading && [...Array(8)].map((_,i) => <SkeletonCard key={i}/>)}

            {/* VIEW MÓN ĂN */}
            {!loading && searchType === 'food' && results.map(food => (
                <div key={food.id} className="card-item" onClick={() => handleOpenModal(food)}>
                    <div className="card-img-box">
                        <img 
                            src={getImg(food.image)} 
                            className="card-img"
                            onError={(e)=>{e.target.onerror=null; e.target.src="https://placehold.co/400x300?text=FoodHub"}}
                            alt={food.name}
                        />
                    </div>
                    <div className="card-body">
                        <div className="card-title">{food.name}</div>
                        <div style={{fontSize:13, color:'#6b7280', marginBottom:12, display:'flex', alignItems:'center', gap:4}}>
                            <Store size={12}/> {food.restaurantName || "Nhà hàng đối tác"}
                        </div>
                        <div className="food-footer">
                            <div className="food-price">{formatPrice(food.price)}</div>
                            <button className="food-btn" onClick={(e) => {e.stopPropagation(); handleOpenModal(food)}}>
                                <ShoppingCart size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* VIEW NHÀ HÀNG */}
            {!loading && searchType === 'restaurant' && results.map(res => (
                <div key={res.id} className="card-item" onClick={() => navigate(`/restaurant/${res.id}`)}>
                    <div className="card-img-box">
                        <img 
                            src={getImg(res.image)} 
                            className="card-img"
                            onError={(e)=>{e.target.onerror=null; e.target.src="https://placehold.co/400x300?text=Nhà+Hàng"}}
                            alt={res.name}
                        />
                        <div className="card-badge"><Heart size={10} fill="white"/> Yêu thích</div>
                    </div>
                    <div className="card-body">
                        <div className="card-title" style={{fontSize:17}}>{res.name}</div>
                        <div style={{fontSize:13, color:'#6b7280', marginBottom:10, display:'flex', alignItems:'center', gap:4}}>
                            <MapPin size={13}/> {res.address || "Chưa cập nhật địa chỉ"}
                        </div>
                        <div className="res-meta">
                            <div className="res-rating"><Star size={14} fill="#f59e0b" color="#f59e0b"/> 4.8</div>
                            <span>•</span>
                            <div style={{display:'flex', alignItems:'center', gap:4}}><Clock size={14}/> 15-25 min</div>
                        </div>
                    </div>
                </div>
            ))}

            {/* EMPTY STATE */}
            {!loading && results.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🍳</div>
                    <h3 style={{color:'#111827', marginTop:0}}>Không tìm thấy kết quả nào</h3>
                    <p>Hãy thử tìm từ khóa khác hoặc xóa bộ lọc xem sao nhé.</p>
                    <button 
                        onClick={()=>{setKeyword(''); setCategoryId('ALL');}}
                        style={{marginTop:15, padding:'10px 24px', background:'white', border:'1px solid #d1d5db', borderRadius:30, cursor:'pointer', fontWeight:600, color:'#4b5563'}}
                    >
                        Xóa bộ lọc tìm kiếm
                    </button>
                </div>
            )}
        </div>

        {/* --- PHÂN TRANG (PAGINATION) --- */}
        {!loading && totalPages > 1 && (
            <div className="pagination">
                <button 
                    className="page-btn" 
                    disabled={currentPage === 0}
                    onClick={() => {setCurrentPage(prev => prev - 1); window.scrollTo({top:0, behavior:'smooth'})}}
                >
                    <ChevronLeft size={20}/>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                    <button 
                        key={i} 
                        className={`page-btn ${currentPage === i ? 'active' : ''}`}
                        onClick={() => {setCurrentPage(i); window.scrollTo({top:0, behavior:'smooth'})}}
                    >
                        {i + 1}
                    </button>
                ))}

                <button 
                    className="page-btn" 
                    disabled={currentPage === totalPages - 1}
                    onClick={() => {setCurrentPage(prev => prev + 1); window.scrollTo({top:0, behavior:'smooth'})}}
                >
                    <ChevronRight size={20}/>
                </button>
            </div>
        )}

      </div>

      <FoodOptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        food={selectedFood} 
      />
    </div>
  );
};

export default SearchPage;
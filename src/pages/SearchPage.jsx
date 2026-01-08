import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FoodOptionModal from '../components/FoodOptionModal';
import { 
  Search, Filter, Star, Clock, MapPin, 
  Utensils, X, Store, ChevronLeft, ChevronRight, Plus, Sparkles
} from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  const [sortBy, setSortBy] = useState('newest'); 
  const [priceRange, setPriceRange] = useState('ALL');
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lấy danh mục để hiển thị bên Sidebar
  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  // Reset trang về 0 khi bộ lọc thay đổi
  useEffect(() => {
    setCurrentPage(0);
  }, [keyword, categoryId, sortBy, priceRange, searchType]);

  // --- LOGIC TÌM KIẾM & LỌC (ĐÃ FIX TOÀN DIỆN) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = searchType === 'food' ? '/foods' : '/restaurants';
        
        // Gọi API lấy tất cả
        const res = await api.get(endpoint, { params: { size: 1000 } });
        
        // Chuẩn hóa dữ liệu đầu vào (đảm bảo luôn là mảng)
        let allData = Array.isArray(res.data) ? res.data : (res.data.content || []);

        // --- 1. Lọc theo Tên (Keyword) ---
        if (keyword) {
            const k = keyword.toLowerCase().trim();
            allData = allData.filter(item => 
                item.name && item.name.toLowerCase().includes(k)
            );
        }
        
        // --- 2. Lọc theo Danh mục (FIX MẠNH MẼ) ---
        if (categoryId !== 'ALL' && searchType === 'food') {
            const targetId = parseInt(categoryId);
            
            allData = allData.filter(item => {
                // Case A: API trả về mảng ID (VD: categoryIds: [1, 2])
                if (item.categoryIds && Array.isArray(item.categoryIds)) {
                    return item.categoryIds.includes(targetId);
                }
                
                // Case B: API trả về mảng Object (VD: categories: [{id: 1, name: 'A'}])
                if (item.categories && Array.isArray(item.categories)) {
                    return item.categories.some(c => c.id === targetId);
                }

                // Case C: API trả về Object đơn (VD: category: {id: 1})
                if (item.category && item.category.id) {
                    return item.category.id === targetId;
                }

                // Case D: API trả về ID đơn (VD: categoryId: 1)
                return item.categoryId == targetId;
            });
        }

        // --- 3. Lọc theo Giá (FIX: Ép kiểu số) ---
        if (searchType === 'food' && priceRange !== 'ALL') {
            allData = allData.filter(f => {
                const price = parseInt(f.price) || 0; 
                if (priceRange === 'LOW') return price < 30000;
                if (priceRange === 'MID') return price >= 30000 && price <= 70000;
                if (priceRange === 'HIGH') return price > 70000;
                return true;
            });
        }

        // --- 4. Sắp xếp (Sort) ---
        if (searchType === 'food') {
            if (sortBy === 'price_asc') {
                allData.sort((a, b) => (parseInt(a.price) || 0) - (parseInt(b.price) || 0));
            } else if (sortBy === 'price_desc') {
                allData.sort((a, b) => (parseInt(b.price) || 0) - (parseInt(a.price) || 0));
            } else {
                // Mặc định: Mới nhất (ID giảm dần)
                allData.sort((a, b) => b.id - a.id);
            }
        }

        // --- 5. Phân trang (Pagination Client-side) ---
        setTotalPages(Math.ceil(allData.length / pageSize));
        const paginatedData = allData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        
        // --- 6. Thêm dữ liệu giả lập (Khoảng cách, Thời gian) ---
        const enhancedData = paginatedData.map(item => ({
            ...item,
            distance: item.distance || (Math.random() * 5 + 0.5).toFixed(1),
            time: item.time || Math.floor(Math.random() * 30 + 15)
        }));

        setResults(enhancedData);

      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setResults([]);
      } finally {
        setTimeout(() => setLoading(false), 300); // Delay nhẹ cho mượt
      }
    };

    const timeout = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timeout);
  }, [keyword, categoryId, sortBy, priceRange, searchType, currentPage]);

  // --- HÀM HELPER ---
  const updateUrl = (key, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== 'ALL') params.set(key, value);
    else params.delete(key);
    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleOpenModal = (food) => { setSelectedFood(food); setIsModalOpen(true); };
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';
  const getImg = (img) => img?.startsWith('http') ? img : `http://localhost:8080${img}`;

  const clearFilters = () => {
    setCategoryId('ALL');
    setPriceRange('ALL');
    setKeyword('');
    updateUrl('cat', null);
    updateUrl('keyword', null);
  };

  return (
    <div className="search-layout">
      <Header />
      
      <style>{`
        .search-layout { background: #F9FAFB; min-height: 100vh; font-family: 'Inter', sans-serif; color: #374151; display: flex; flex-direction: column; }
        .search-container { max-width: 1280px; margin: 0 auto; padding: 30px 20px; width: 100%; flex: 1; display: flex; gap: 30px; }

        /* SIDEBAR FILTERS (Desktop) */
        .filter-sidebar { width: 260px; flex-shrink: 0; display: none; } 
        @media(min-width: 1024px) { .filter-sidebar { display: block; } }

        .filter-box { background: white; border-radius: 16px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .filter-title { font-weight: 700; font-size: 15px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between; color: #111827; }
        
        .filter-option { display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; color: #4b5563; font-size: 14px; transition: 0.2s; }
        .filter-option:hover { color: #ef4444; }
        .filter-radio { accent-color: #ef4444; width: 16px; height: 16px; cursor: pointer; }
        
        /* MAIN CONTENT AREA */
        .main-content { flex: 1; min-width: 0; }

        /* SEARCH BAR TOP */
        .top-search-bar { display: flex; gap: 15px; margin-bottom: 25px; }
        .search-input-wrapper { 
            flex: 1; position: relative; background: white; border: 1px solid #e5e7eb; 
            border-radius: 12px; display: flex; align-items: center; padding: 0 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);
            transition: 0.2s;
        }
        .search-input-wrapper:focus-within { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
        .search-input { width: 100%; border: none; padding: 14px 0 14px 10px; outline: none; font-size: 15px; color: #374151; }
        
        /* TABS TYPE */
        .type-toggle { display: flex; background: #f3f4f6; padding: 4px; border-radius: 12px; height: 48px; }
        .type-btn { 
            padding: 0 20px; border-radius: 8px; border: none; background: transparent; 
            color: #6b7280; font-weight: 600; cursor: pointer; font-size: 14px; transition: 0.2s;
            display: flex; align-items: center; gap: 6px;
        }
        .type-btn.active { background: white; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

        /* ACTIVE TAGS */
        .active-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .tag-chip { background: #fee2e2; color: #ef4444; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .tag-remove { cursor: pointer; }
        .btn-clear-all { font-size: 13px; color: #6b7280; text-decoration: underline; cursor: pointer; border: none; background: none; margin-left: 5px; }

        /* SORT BAR */
        .sort-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb; }
        .result-count { font-size: 14px; color: #6b7280; }
        .sort-select { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; color: #374151; outline: none; cursor: pointer; background: white; }

        /* GRID */
        .result-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }

        /* CARD */
        .res-card { background: white; border-radius: 16px; border: 1px solid #f3f4f6; overflow: hidden; transition: 0.3s; cursor: pointer; display: flex; flex-direction: column; position: relative; }
        .res-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border-color: #fed7aa; }
        
        .res-img-wrap { height: 160px; overflow: hidden; position: relative; }
        .res-img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .res-card:hover .res-img { transform: scale(1.05); }
        .res-badge { position: absolute; bottom: 8px; left: 8px; background: rgba(255,255,255,0.95); padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); color: #374151; }

        .res-content { padding: 15px; flex: 1; display: flex; flex-direction: column; }
        .res-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .res-sub { font-size: 12px; color: #9ca3af; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        
        .res-info { display: flex; align-items: center; gap: 10px; font-size: 11px; color: #6b7280; margin-bottom: 12px; }
        
        .res-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
        .res-price { font-size: 15px; font-weight: 700; color: #ef4444; }
        .btn-quick-add { width: 32px; height: 32px; border-radius: 8px; background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .btn-quick-add:hover { background: #ef4444; color: white; border-color: #ef4444; }

        /* PAGINATION */
        .pg-wrap { display: flex; justify-content: center; gap: 8px; margin-top: 40px; }
        .pg-item { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; color: #6b7280; font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .pg-item:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; }
        .pg-item.active { background: #111827; color: white; border-color: #111827; }
        .pg-item:disabled { opacity: 0.5; cursor: not-allowed; }

        /* SKELETON & EMPTY */
        .skeleton { background: #f3f4f6; height: 280px; border-radius: 16px; animation: pulse 1.5s infinite; }
        .empty-state { text-align: center; padding: 60px 0; color: #9ca3af; }
      `}</style>

      <div className="search-container">
        
        {/* --- LEFT SIDEBAR: BỘ LỌC --- */}
        <aside className="filter-sidebar">
            <div className="filter-box">
                <div className="filter-title"><Filter size={16}/> Bộ Lọc Tìm Kiếm</div>
                
                {searchType === 'food' && (
                    <>
                        <div className="filter-title" style={{marginTop:15, fontSize:13, color:'#9ca3af', textTransform:'uppercase'}}>Danh mục</div>
                        <div className="filter-option" onClick={() => {setCategoryId('ALL'); updateUrl('cat', null)}}>
                            <input type="radio" checked={categoryId === 'ALL'} readOnly className="filter-radio" />
                            <span>Tất cả món</span>
                        </div>
                        {categories.map(c => (
                            <div key={c.id} className="filter-option" onClick={() => {setCategoryId(c.id); updateUrl('cat', c.id)}}>
                                <input type="radio" checked={categoryId == c.id} readOnly className="filter-radio" />
                                <span>{c.name}</span>
                            </div>
                        ))}

                        <div className="filter-title" style={{marginTop:20, fontSize:13, color:'#9ca3af', textTransform:'uppercase'}}>Mức giá</div>
                        <div className="filter-option" onClick={() => setPriceRange('ALL')}>
                            <input type="radio" checked={priceRange === 'ALL'} readOnly className="filter-radio" />
                            <span>Tất cả</span>
                        </div>
                        <div className="filter-option" onClick={() => setPriceRange('LOW')}>
                            <input type="radio" checked={priceRange === 'LOW'} readOnly className="filter-radio" />
                            <span>Dưới 30.000đ</span>
                        </div>
                        <div className="filter-option" onClick={() => setPriceRange('MID')}>
                            <input type="radio" checked={priceRange === 'MID'} readOnly className="filter-radio" />
                            <span>30.000đ - 70.000đ</span>
                        </div>
                        <div className="filter-option" onClick={() => setPriceRange('HIGH')}>
                            <input type="radio" checked={priceRange === 'HIGH'} readOnly className="filter-radio" />
                            <span>Trên 70.000đ</span>
                        </div>
                    </>
                )}
                
                {searchType === 'restaurant' && (
                    <div style={{fontSize:13, color:'#9ca3af', padding:'10px 0'}}>Chưa có bộ lọc cho nhà hàng</div>
                )}
            </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="main-content">
            {/* TOP BAR */}
            <div className="top-search-bar">
                <div className="search-input-wrapper">
                    <Search size={18} color="#9ca3af"/>
                    <input 
                        className="search-input" 
                        placeholder={searchType === 'food' ? "Tìm kiếm món ăn ngon..." : "Tìm kiếm nhà hàng, quán ăn..."}
                        value={keyword}
                        onChange={(e) => { setKeyword(e.target.value); updateUrl('keyword', e.target.value); }}
                    />
                    {keyword && <X size={16} color="#9ca3af" style={{cursor:'pointer'}} onClick={() => {setKeyword(''); updateUrl('keyword', null)}}/>}
                </div>
                
                <div className="type-toggle">
                    <button className={`type-btn ${searchType === 'food' ? 'active' : ''}`} onClick={() => setSearchType('food')}>
                        <Utensils size={14}/> Món ăn
                    </button>
                    <button className={`type-btn ${searchType === 'restaurant' ? 'active' : ''}`} onClick={() => setSearchType('restaurant')}>
                        <Store size={14}/> Nhà hàng
                    </button>
                </div>
            </div>

            {/* TAGS ĐANG CHỌN */}
            {(categoryId !== 'ALL' || priceRange !== 'ALL' || keyword) && (
                <div className="active-tags">
                    {keyword && <div className="tag-chip">"{keyword}" <X size={12} className="tag-remove" onClick={()=>setKeyword('')}/></div>}
                    {categoryId !== 'ALL' && <div className="tag-chip">Danh mục: {categories.find(c=>c.id==categoryId)?.name} <X size={12} className="tag-remove" onClick={()=>setCategoryId('ALL')}/></div>}
                    {priceRange !== 'ALL' && <div className="tag-chip">Giá: {priceRange} <X size={12} className="tag-remove" onClick={()=>setPriceRange('ALL')}/></div>}
                    <button className="btn-clear-all" onClick={clearFilters}>Xóa tất cả</button>
                </div>
            )}

            {/* SORT BAR */}
            <div className="sort-bar">
                <div className="result-count">
                    Tìm thấy <strong style={{color:'#111827'}}>{results.length}</strong> kết quả phù hợp
                </div>
                
                {searchType === 'food' && (
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <span style={{fontSize:13, color:'#6b7280'}}>Sắp xếp:</span>
                        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Mới nhất</option>
                            <option value="price_asc">Giá tăng dần</option>
                            <option value="price_desc">Giá giảm dần</option>
                        </select>
                    </div>
                )}
            </div>

            {/* LƯỚI KẾT QUẢ */}
            <div className="result-grid">
                {loading ? (
                    [...Array(8)].map((_,i) => <div key={i} className="skeleton"/>)
                ) : results.length > 0 ? (
                    <>
                        {searchType === 'food' && results.map(food => (
                            <div key={food.id} className="res-card" onClick={() => handleOpenModal(food)}>
                                <div className="res-img-wrap">
                                    <img src={getImg(food.image)} className="res-img" alt={food.name} 
                                            onError={(e)=>{e.target.onerror=null; e.target.src="https://placehold.co/300x200?text=Food"}}/>
                                    <div className="res-badge"><Clock size={10}/> {food.time}p</div>
                                </div>
                                <div className="res-content">
                                    <div className="res-name">{food.name}</div>
                                    <div className="res-sub">{food.restaurantName || "Nhà hàng FoodNest"}</div>
                                    <div className="res-info">
                                        <span style={{display:'flex',alignItems:'center',gap:3}}><Star size={12} fill="#fbbf24" color="#fbbf24"/> 4.8</span>
                                        <span style={{color:'#e5e7eb'}}>|</span>
                                        <span style={{display:'flex',alignItems:'center',gap:3}}><MapPin size={12}/> {food.distance}km</span>
                                    </div>
                                    <div className="res-footer">
                                        <div className="res-price">{formatPrice(food.price)}</div>
                                        <button className="btn-quick-add" onClick={(e) => {e.stopPropagation(); handleOpenModal(food)}}>
                                            <Plus size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {searchType === 'restaurant' && results.map(res => (
                            <div key={res.id} className="res-card" onClick={() => navigate(`/restaurant/${res.id}`)}>
                                <div className="res-img-wrap">
                                    <img src={getImg(res.image)} className="res-img" alt={res.name} 
                                            onError={(e)=>{e.target.onerror=null; e.target.src="https://placehold.co/300x200?text=Restaurant"}}/>
                                    <div className="res-badge" style={{color:'#0ea5e9'}}><Star size={10} fill="#0ea5e9" color="#0ea5e9"/> Yêu thích</div>
                                </div>
                                <div className="res-content">
                                    <div className="res-name" style={{fontSize:16}}>{res.name}</div>
                                    <div className="res-sub"><MapPin size={12} style={{display:'inline'}}/> {res.address || "Hồ Chí Minh"}</div>
                                    <div className="res-info">
                                        <span style={{color:'#10b981', fontWeight:600}}>Mở cửa</span>
                                        <span>• 08:00 - 22:00</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="empty-state" style={{gridColumn:'1/-1'}}>
                        <Sparkles size={40} style={{marginBottom:15, opacity:0.3}}/>
                        <p>Không tìm thấy kết quả nào phù hợp.</p>
                        <button className="btn-clear-all" onClick={clearFilters}>Xóa bộ lọc</button>
                    </div>
                )}
            </div>

            {/* PHÂN TRANG */}
            {!loading && totalPages > 1 && (
                <div className="pg-wrap">
                    <button className="pg-item" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}>
                        <ChevronLeft size={18}/>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i} className={`pg-item ${currentPage === i ? 'active' : ''}`} onClick={() => setCurrentPage(i)}>{i + 1}</button>
                    ))}
                    <button className="pg-item" disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)}>
                        <ChevronRight size={18}/>
                    </button>
                </div>
            )}
        </main>
      </div>

      <FoodOptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} food={selectedFood} />
      <Footer />
    </div>
  );
};

export default SearchPage;
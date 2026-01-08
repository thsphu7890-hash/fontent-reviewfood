import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { 
  Star, MapPin, ArrowRight, Clock, ShieldCheck, 
  Heart, Filter, TrendingUp, SearchX 
} from 'lucide-react';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  // Lấy từ khóa từ URL (Đồng bộ với Header)
  const keyword = searchParams.get('keyword') || '';

  // State cho bộ lọc cục bộ
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recommended'); // recommended, rating, time

  // Danh sách danh mục giả lập (hoặc lấy từ API)
  const categories = ['All', 'Cơm', 'Phở & Bún', 'Đồ uống', 'Ăn vặt', 'Healthy'];

  useEffect(() => {
    setLoading(true);
    api.get('/restaurants')
      .then(res => {
        setRestaurants(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setTimeout(() => setLoading(false), 500));
  }, []);

  // --- LOGIC LỌC & SẮP XẾP ---
  const processedRestaurants = useMemo(() => {
    let data = [...restaurants];

    // 1. Lọc theo từ khóa (Header)
    if (keyword) {
      data = data.filter(r => 
        r.name.toLowerCase().includes(keyword.toLowerCase()) || 
        r.address.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // 2. Lọc theo danh mục (Filter Bar)
    if (activeCategory !== 'All') {
      // Giả sử API có trả về categoryName, nếu không thì so sánh tương đối
      data = data.filter(r => r.categoryName?.includes(activeCategory) || true); // Demo: true để hiện all nếu chưa có field
    }

    // 3. Sắp xếp
    if (sortBy === 'rating') {
      data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'time') {
      // Giả lập sắp xếp thời gian
      data.sort((a, b) => a.name.length - b.name.length);
    }

    return data;
  }, [restaurants, keyword, activeCategory, sortBy]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="res-container">
        <div className="res-loading-grid">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="res-container">
      <style>{`
        .res-container { max-width: 1240px; margin: 0 auto; padding: 20px; font-family: 'Inter', sans-serif; }
        
        /* FILTER BAR */
        .filter-bar { 
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 30px; flex-wrap: wrap; gap: 15px; 
        }
        .cat-list { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
        .cat-btn { 
          padding: 8px 16px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
          color: #94a3b8; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.3s; white-space: nowrap;
        }
        .cat-btn:hover, .cat-btn.active { background: #ff4757; color: white; border-color: #ff4757; box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3); }

        .sort-select { 
          background: #1e293b; color: #fff; border: 1px solid rgba(255,255,255,0.1); 
          padding: 8px 12px; border-radius: 12px; outline: none; font-size: 13px; cursor: pointer; 
        }

        /* GRID SYSTEM */
        .res-grid { 
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; 
        }

        /* CARD DESIGN */
        .res-card { 
          background: #1e293b; border-radius: 24px; overflow: hidden; position: relative;
          border: 1px solid rgba(255, 255, 255, 0.05); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; flex-direction: column;
        }
        .res-card:hover { transform: translateY(-8px); border-color: rgba(255, 71, 87, 0.4); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); }

        /* Image Wrapper */
        .res-img-wrapper { position: relative; height: 180px; overflow: hidden; }
        .res-img { width: 100%; height: 100%; object-fit: cover; transition: 0.6s; }
        .res-card:hover .res-img { transform: scale(1.1); }
        
        .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.9), transparent); opacity: 0.6; }

        /* Badges on Image */
        .badge-rating { position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); padding: 4px 8px; border-radius: 8px; color: #fbbf24; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 4px; }
        .badge-time { position: absolute; bottom: 12px; left: 12px; display: flex; align-items: center; gap: 4px; color: #e2e8f0; font-size: 11px; font-weight: 600; z-index: 2; }
        
        .btn-fav { 
          position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; 
          background: rgba(255,255,255,0.1); backdrop-filter: blur(4px); border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; color: white;
        }
        .btn-fav:hover { background: #ff4757; transform: scale(1.1); }

        /* Content */
        .res-content { padding: 16px 20px 20px; flex: 1; display: flex; flex-direction: column; position: relative; z-index: 2; }
        
        .res-tags { display: flex; gap: 8px; margin-bottom: 8px; }
        .tag-pill { font-size: 10px; color: #94a3b8; background: #334155; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .tag-pill.highlight { color: #ff4757; background: rgba(255, 71, 87, 0.1); }

        .res-name { font-size: 18px; font-weight: 800; color: #fff; margin: 0 0 6px; line-height: 1.3; display: block; text-decoration: none; transition: 0.2s; }
        .res-name:hover { color: #ff4757; }

        .res-addr { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 5px; margin-bottom: 15px; }

        .res-footer { margin-top: auto; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
        .status-open { color: #10b981; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
        .btn-arrow { width: 36px; height: 36px; border-radius: 10px; background: #334155; color: #fff; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .res-card:hover .btn-arrow { background: #ff4757; transform: rotate(-45deg); }

        /* EMPTY STATE */
        .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 0; color: #64748b; }
        .empty-icon { width: 64px; height: 64px; margin-bottom: 15px; opacity: 0.5; }

        /* LOADING */
        .res-loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
        .skeleton-card { height: 320px; background: #1e293b; border-radius: 24px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
      `}</style>

      {/* --- PHẦN 1: BỘ LỌC & SẮP XẾP --- */}
      <div className="filter-bar">
        <div className="cat-list">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div style={{display:'flex', alignItems:'center', gap: 10}}>
          <span style={{color:'#64748b', fontSize:12, fontWeight:600}}><Filter size={14} style={{verticalAlign:'middle'}}/> Sort by:</span>
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recommended">Đề xuất</option>
            <option value="rating">Đánh giá cao</option>
            <option value="time">Giao nhanh</option>
          </select>
        </div>
      </div>

      {/* --- PHẦN 2: DANH SÁCH NHÀ HÀNG --- */}
      {processedRestaurants.length === 0 ? (
        <div className="empty-state">
          <SearchX className="empty-icon" />
          <h3>Không tìm thấy nhà hàng nào</h3>
          <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.</p>
        </div>
      ) : (
        <div className="res-grid">
          {processedRestaurants.map(res => (
            <div key={res.id} className="res-card">
              <div className="res-img-wrapper">
                <img src={res.image || "https://placehold.co/600x400?text=FoodNest"} className="res-img" alt={res.name} />
                <div className="overlay"></div>
                
                {/* Rating & Time Badge */}
                <div className="badge-rating">
                  <Star size={12} fill="#fbbf24" stroke="none" /> {res.rating || 4.5}
                </div>
                <div className="badge-time">
                  <Clock size={12} /> 15-25 min
                </div>

                {/* Favorite Button */}
                <div className="btn-fav" onClick={(e) => { e.preventDefault(); /* Logic Add Favorite */ }}>
                  <Heart size={16} />
                </div>
              </div>

              <div className="res-content">
                <div className="res-tags">
                  <span className="tag-pill highlight"><ShieldCheck size={10} style={{verticalAlign:'middle'}}/> PRO</span>
                  <span className="tag-pill">{res.categoryName || 'Món Việt'}</span>
                </div>

                <Link to={`/restaurant/${res.id}`} className="res-name">{res.name}</Link>
                
                <div className="res-addr">
                  <MapPin size={14} /> {res.address}
                </div>

                <div className="res-footer">
                  <div className="status-open">
                    <div style={{width:6, height:6, background:'#10b981', borderRadius:'50%'}}></div> 
                    Mở cửa
                  </div>
                  <Link to={`/restaurant/${res.id}`} className="btn-arrow">
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
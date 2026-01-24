import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Calendar, Clock, Tag, ChevronRight, 
  Gift, Percent, MapPin, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // 👇 Import axios instance đã cấu hình

const EventPage = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // --- 1. GỌI API LẤY SỰ KIỆN TỪ BACKEND ---
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Gọi API: GET /api/events
        // (Nếu API của bạn là /public/events thì sửa lại đường dẫn nhé)
        const res = await api.get('api/events'); 
        
        // Kiểm tra dữ liệu trả về để tránh lỗi
        const eventList = Array.isArray(res.data) ? res.data : (res.data.content || []);
        
        setEvents(eventList);
      } catch (error) {
        console.error("Lỗi tải sự kiện:", error);
        // Không toast lỗi nếu chỉ là danh sách trống
        if (error.response?.status !== 404) {
            toast.error("Không thể tải danh sách sự kiện");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // --- 2. LOGIC LỌC (FILTER) ---
  const filteredEvents = events.filter(event => {
    // Backend cần trả về field 'type' là: PROMOTION, EVENT, hoặc NEWS
    const matchTab = activeTab === 'ALL' || event.type === activeTab;
    const matchSearch = (event.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const getBadgeInfo = (type) => {
    switch (type) {
      case 'PROMOTION': return { color: '#ef4444', bg: '#fee2e2', text: 'Khuyến mãi', icon: <Percent size={14}/> };
      case 'EVENT': return { color: '#8b5cf6', bg: '#f3e8ff', text: 'Sự kiện', icon: <Calendar size={14}/> };
      case 'NEWS': return { color: '#10b981', bg: '#d1fae5', text: 'Tin tức', icon: <Tag size={14}/> };
      default: return { color: '#64748b', bg: '#f1f5f9', text: 'Thông báo', icon: <Tag size={14}/> };
    }
  };

  // Hàm xử lý ảnh an toàn
  const getImg = (img) => {
      if (!img) return "https://placehold.co/600x400?text=No+Image";
      return img.startsWith('http') ? img : `http://localhost:8080${img}`;
  };

  return (
    <div style={{background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif'}}>
      <Header />
      
      <style>{`
        .event-hero {
          background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
          color: white; padding: 60px 20px; text-align: center; margin-bottom: 40px;
          border-radius: 0 0 40px 40px;
          position: relative; overflow: hidden;
        }
        .hero-pattern {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          opacity: 0.1;
          background-image: radial-gradient(#fff 2px, transparent 2px);
          background-size: 30px 30px;
        }
        .filter-bar {
          display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;
        }
        .filter-btn {
          padding: 8px 16px; border-radius: 20px; border: 1px solid #e2e8f0;
          background: white; color: #64748b; font-weight: 600; cursor: pointer;
          transition: 0.2s; white-space: nowrap;
        }
        .filter-btn.active {
          background: #1e293b; color: white; border-color: #1e293b;
        }
        .event-card {
          background: white; border-radius: 16px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: 0.3s;
          display: flex; flex-direction: column; height: 100%;
          border: 1px solid #f1f5f9;
        }
        .event-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        
        .card-img-wrapper { position: relative; height: 180px; overflow: hidden; }
        .card-img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .event-card:hover .card-img { transform: scale(1.05); }
        
        .discount-tag {
          position: absolute; top: 10px; right: 10px;
          background: #ef4444; color: white; padding: 4px 10px;
          border-radius: 8px; font-weight: 700; font-size: 13px;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }
      `}</style>

      {/* 1. HERO BANNER */}
      <div className="event-hero">
        <div className="hero-pattern"></div>
        <div style={{position: 'relative', zIndex: 2}}>
            <h1 style={{fontSize: 36, fontWeight: 800, margin: '0 0 10px'}}>Sự Kiện & Ưu Đãi</h1>
            <p style={{fontSize: 16, opacity: 0.9, maxWidth: 600, margin: '0 auto'}}>
                Cập nhật những chương trình khuyến mãi và tin tức nóng hổi nhất.
            </p>
        </div>
      </div>

      <div className="event-container" style={{maxWidth: 1100, margin: '-60px auto 40px', padding: '0 20px', position: 'relative', zIndex: 3}}>
        
        {/* 2. SEARCH & FILTER */}
        <div style={{background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: 30}}>
            <div style={{display: 'flex', gap: 15, marginBottom: 20, flexWrap: 'wrap'}}>
                <div style={{flex: 1, position: 'relative', minWidth: 200}}>
                    <Search size={18} style={{position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}}/>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm sự kiện..." 
                        style={{width: '100%', padding: '12px 12px 12px 40px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none'}}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="filter-bar">
                {[
                    {id: 'ALL', label: 'Tất cả'},
                    {id: 'PROMOTION', label: 'Khuyến mãi'},
                    {id: 'EVENT', label: 'Sự kiện'},
                    {id: 'NEWS', label: 'Tin tức'}
                ].map(tab => (
                    <button 
                        key={tab.id}
                        className={`filter-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* 3. EVENT LIST */}
        {loading ? (
            <div style={{textAlign: 'center', padding: 50, color: '#64748b'}}>
                <div style={{display:'inline-block', width:30, height:30, border:'3px solid #cbd5e1', borderTopColor:'#ef4444', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div>
                <div style={{marginTop:10}}>Đang tải dữ liệu...</div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 25}}>
                {filteredEvents.map((item) => {
                    const badge = getBadgeInfo(item.type);
                    return (
                        <div key={item.id} className="event-card">
                            <div className="card-img-wrapper">
                                <img src={getImg(item.image)} className="card-img" alt={item.title}/>
                                
                                {item.discount && (
                                    <div className="discount-tag">
                                        -{item.discount}%
                                    </div>
                                )}
                                
                                <div style={{position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: badge.color, display: 'flex', alignItems: 'center', gap: 4, boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}>
                                    {badge.icon} {badge.text}
                                </div>
                            </div>
                            
                            <div style={{padding: 20, display: 'flex', flexDirection: 'column', flex: 1}}>
                                <h3 style={{margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: '#1e293b', lineHeight: 1.4, minHeight: 48, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                    {item.title}
                                </h3>
                                
                                <div style={{marginBottom: 15, display: 'flex', flexDirection: 'column', gap: 8}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b'}}>
                                        <Calendar size={14} color="#94a3b8"/> 
                                        {item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'Sắp diễn ra'} 
                                        {item.endDate ? ` - ${new Date(item.endDate).toLocaleDateString('vi-VN')}` : ''}
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b'}}>
                                        <MapPin size={14} color="#94a3b8"/> {item.location || "Toàn hệ thống"}
                                    </div>
                                </div>

                                <p style={{margin: '0 0 20px', fontSize: 14, color: '#475569', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                    {item.description}
                                </p>
                                
                                <button 
                                    onClick={() => navigate(`/event/${item.id}`)}
                                    style={{width: '100%', padding: '10px', background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: '0.2s', fontSize: 14}}
                                    onMouseOver={(e) => {e.target.style.background = '#1e293b'; e.target.style.color = 'white'}}
                                    onMouseOut={(e) => {e.target.style.background = 'white'; e.target.style.color = '#1e293b'}}
                                >
                                    Xem chi tiết <ChevronRight size={14}/>
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
        
        {!loading && filteredEvents.length === 0 && (
            <div style={{textAlign: 'center', padding: 60, color: '#94a3b8'}}>
                <Gift size={48} style={{opacity: 0.2, marginBottom: 15}}/>
                <p>Không tìm thấy sự kiện nào phù hợp.</p>
            </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default EventPage;
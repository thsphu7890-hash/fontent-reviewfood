import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Calendar, Clock, Tag, ChevronRight, 
  Gift, Percent, MapPin, Search, ArrowRight, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const EventPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/events'); 
        const eventList = Array.isArray(res.data) ? res.data : (res.data.content || []);
        setEvents(eventList);
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error("Không thể tải danh sách sự kiện");
        }
      } finally {
        // Giả lập delay 1s để thấy hiệu ứng Skeleton xịn sò
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchTab = activeTab === 'ALL' || event.type === activeTab;
    const matchSearch = (event.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const getBadgeInfo = (type) => {
    switch (type) {
      case 'PROMOTION': return { color: '#f43f5e', bg: '#fff1f2', text: 'Ưu đãi đặc biệt', icon: <Percent size={14}/> };
      case 'EVENT': return { color: '#8b5cf6', bg: '#f5f3ff', text: 'Sự kiện độc quyền', icon: <Calendar size={14}/> };
      case 'NEWS': return { color: '#10b981', bg: '#ecfdf5', text: 'Tin tức ẩm thực', icon: <Tag size={14}/> };
      default: return { color: '#6366f1', bg: '#eef2ff', text: 'Thông báo', icon: <Sparkles size={14}/> };
    }
  };

  const getImg = (img) => {
    if (!img) return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000";
    return img.startsWith('http') ? img : `http://localhost:8080${img}`;
  };

  return (
    <div style={{background: '#fcfcfd', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
      <Header />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        
        .hero-section {
          background: #111827;
          background-image: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1600');
          background-size: cover; background-position: center;
          padding: 120px 20px 160px; text-align: center; color: white;
          border-radius: 0 0 60px 60px; position: relative;
        }

        .filter-container {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px; padding: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          margin-top: -80px;
        }

        .filter-pill {
          padding: 10px 24px; border-radius: 14px; border: none;
          background: transparent; color: #64748b; font-weight: 700;
          cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 14px;
        }

        .filter-pill.active {
          background: #f43f5e; color: white;
          box-shadow: 0 8px 16px rgba(244, 63, 94, 0.3);
        }

        .event-card {
          background: white; border-radius: 24px; overflow: hidden;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #f1f5f9; display: flex; flex-direction: column;
        }

        .event-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.12);
          border-color: #f43f5e;
        }

        .card-image-box {
          position: relative; height: 220px; overflow: hidden;
        }

        .image-zoom {
          width: 100%; height: 100%; object-fit: cover;
          transition: 0.8s ease;
        }

        .event-card:hover .image-zoom { transform: scale(1.1); }

        .skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 12px;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .action-button {
          background: #111827; color: white; padding: 12px 24px;
          border-radius: 12px; border: none; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          gap: 8px; cursor: pointer; transition: 0.3s;
        }

        .action-button:hover { background: #f43f5e; gap: 15px; }
      `}</style>

      {/* 1. HERO SECTION */}
      <div className="hero-section">
        <div style={{maxWidth: 800, margin: '0 auto'}}>
          <h4 style={{textTransform: 'uppercase', letterSpacing: 4, fontSize: 14, fontWeight: 700, color: '#f43f5e', marginBottom: 16}}>Khám phá ngay</h4>
          <h1 style={{fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, marginBottom: 20, lineHeight: 1.1}}>
            Đặc Quyền Ẩm Thực <br/> & Sự Kiện Kết Nối
          </h1>
          <p style={{fontSize: 18, opacity: 0.9, fontWeight: 400}}>
            Nơi hội tụ những hương vị đỉnh cao và những phút giây giải trí bất tận.
          </p>
        </div>
      </div>

      <div style={{maxWidth: 1200, margin: '0 auto', padding: '0 20px 100px'}}>
        
        {/* 2. FILTER CONTAINER */}
        <div className="filter-container">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20}}>
            <div style={{display: 'flex', gap: 8}} className="filter-bar">
              {['ALL', 'PROMOTION', 'EVENT', 'NEWS'].map(tab => (
                <button 
                  key={tab} 
                  className={`filter-pill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'ALL' ? 'Tất cả' : tab === 'PROMOTION' ? 'Khuyến mãi' : tab === 'EVENT' ? 'Sự kiện' : 'Tin tức'}
                </button>
              ))}
            </div>
            
            <div style={{position: 'relative', minWidth: 280}}>
              <Search size={20} style={{position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}}/>
              <input 
                type="text" 
                placeholder="Tìm cảm hứng ẩm thực..." 
                style={{width: '100%', padding: '14px 14px 14px 50px', borderRadius: 16, border: '1px solid #e2e8f0', outline: 'none', fontSize: 15, background: '#f8fafc'}}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 3. CONTENT AREA */}
        <div style={{marginTop: 60}}>
          {loading ? (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 30}}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{height: 450}} className="skeleton"></div>
              ))}
            </div>
          ) : (
            <>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 30}}>
                {filteredEvents.map((item) => {
                  const badge = getBadgeInfo(item.type);
                  return (
                    <div key={item.id} className="event-card">
                      <div className="card-image-box">
                        <img src={getImg(item.image)} className="image-zoom" alt={item.title}/>
                        
                        {item.discount && (
                          <div style={{position: 'absolute', top: 20, right: 20, background: '#f43f5e', color: 'white', padding: '8px 14px', borderRadius: 12, fontWeight: 800, fontSize: 16, boxShadow: '0 10px 20px rgba(244, 63, 94, 0.4)'}}>
                            -{item.discount}%
                          </div>
                        )}
                        
                        <div style={{position: 'absolute', bottom: 20, left: 20, background: 'white', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: badge.color, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                          {badge.icon} {badge.text}
                        </div>
                      </div>
                      
                      <div style={{padding: '28px', flex: 1, display: 'flex', flexDirection: 'column'}}>
                        <h3 style={{fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 12, lineHeight: 1.4}}>
                          {item.title}
                        </h3>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#64748b'}}>
                            <Calendar size={16} /> 
                            <span>{new Date(item.startDate).toLocaleDateString('vi-VN')} - {new Date(item.endDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#64748b'}}>
                            <MapPin size={16} /> 
                            <span>{item.location || "Chi nhánh toàn quốc"}</span>
                          </div>
                        </div>

                        <p style={{fontSize: 15, color: '#4b5563', lineHeight: 1.6, marginBottom: 24, flex: 1}}>
                          {item.description}
                        </p>
                        
                        <button className="action-button" onClick={() => navigate(`/event/${item.id}`)}>
                          Khám phá chi tiết <ArrowRight size={18}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredEvents.length === 0 && (
                <div style={{textAlign: 'center', padding: '100px 0'}}>
                  <div style={{background: '#f1f5f9', width: 100, height: 100, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'}}>
                    <Gift size={40} color="#94a3b8"/>
                  </div>
                  <h3 style={{fontSize: 20, fontWeight: 700, color: '#1e293b'}}>Không tìm thấy kết quả</h3>
                  <p style={{color: '#64748b'}}>Hãy thử tìm kiếm với từ khóa khác nhé!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventPage;
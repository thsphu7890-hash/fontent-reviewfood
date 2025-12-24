import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-banner-container">
      <style>{`
        .hero-banner-container {
          /* Ảnh nền món ăn hấp dẫn (dùng ảnh thật của bạn thay link này) */
          background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          height: 400px; /* Chiều cao banner */
          border-radius: 24px;
          display: flex;
          align-items: center;
          padding: 0 60px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        
        /* Hiệu ứng lấp lánh */
        .hero-sparkle { position: absolute; top: 20px; right: 30px; opacity: 0.2; animation: pulse 3s infinite; }

        .hero-content { max-width: 500px; color: white; position: relative; z-index: 2; }
        
        .hero-badge {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(245, 158, 11, 0.2); color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.4);
            padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 13px;
            margin-bottom: 16px; backdrop-filter: blur(5px);
        }

        .hero-title {
            font-size: 42px; font-weight: 900; line-height: 1.1; margin: 0 0 16px 0;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .hero-title span { color: #3b82f6; /* Màu xanh thương hiệu */ }

        .hero-desc { font-size: 16px; opacity: 0.9; margin-bottom: 24px; line-height: 1.5; }

        .hero-btn {
            padding: 12px 32px; background: #3b82f6; color: white; border: none;
            border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer;
            display: flex; align-items: center; gap: 8px; transition: 0.3s;
        }
        .hero-btn:hover { background: #2563eb; transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.5); }

        @media (max-width: 768px) {
            .hero-banner-container { height: 350px; padding: 0 30px; }
            .hero-title { font-size: 32px; }
        }
      `}</style>

      <div className="hero-sparkle"><Sparkles size={100} color="#fff"/></div>

      <div className="hero-content">
        <div className="hero-badge">
            <Sparkles size={14}/> FOODHUB - GIAO NHANH 30P
        </div>
        <h1 className="hero-title">
            Thèm gì đặt nấy,<br/><span>FoodHub</span> giao ngay!
        </h1>
        <p className="hero-desc">Khám phá hàng ngàn món ngon từ những nhà hàng hàng đầu, giao tận tay bạn chỉ trong vài cú chạm.</p>
        <button className="hero-btn" onClick={() => navigate('/search')}>
            Đặt Món Ngay <ArrowRight size={20}/>
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;
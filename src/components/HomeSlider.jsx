import React from 'react';
import { ChevronRight, Play } from 'lucide-react';

const HomeSlider = () => {
  // 1. Định nghĩa các class name để gọi trong JSX
  const styles = {
    wrapper: "hs-wrapper",
    image: "hs-bg-img",
    overlay: "hs-overlay",
    contentWrapper: "hs-content-container",
    badge: "hs-promo-badge",
    dotWrapper: "hs-dot-ping",
    title: "hs-hero-title",
    titleHighlight: "hs-text-red",
    description: "hs-hero-desc",
    buttonGroup: "hs-btn-group",
    primaryBtn: "hs-btn hs-btn-primary",
    secondaryBtn: "hs-btn hs-btn-secondary"
  };

  return (
    <section className={styles.wrapper}>
      {/* 2. Nhúng CSS trực tiếp */}
      <style>{`
        .hs-wrapper { position: relative; width: 100%; height: 500px; overflow: hidden; background-color: #000; font-family: sans-serif; }
        .hs-bg-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; transition: transform 0.7s; }
        .hs-wrapper:hover .hs-bg-img { transform: scale(1.05); }

        .hs-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.4), transparent); display: flex; align-items: center; }
        .hs-content-container { max-width: 1200px; margin: 0 auto; padding: 0 48px; width: 100%; }

        .hs-promo-badge { display: inline-flex; align-items: center; gap: 8px; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; }
        
        .hs-dot-ping { position: relative; display: flex; height: 8px; width: 8px; }
        .hs-dot-ping .ping { position: absolute; height: 100%; width: 100%; border-radius: 50%; background-color: #f87171; opacity: 0.75; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .hs-dot-ping .dot { position: relative; border-radius: 50%; height: 8px; width: 8px; background-color: #ef4444; }

        @keyframes ping { 75%, 100% { transform: scale(2.5); opacity: 0; } }

        .hs-hero-title { color: #fff; font-size: 48px; font-weight: 900; line-height: 1.1; margin: 0 0 24px 0; }
        @media (min-width: 768px) { .hs-hero-title { font-size: 72px; } }
        .hs-text-red { color: #dc2626; }

        .hs-hero-desc { color: #d1d5db; font-size: 18px; max-width: 560px; margin-bottom: 40px; line-height: 1.6; font-weight: 300; }

        .hs-btn-group { display: flex; flex-wrap: wrap; gap: 16px; }
        .hs-btn { display: flex; align-items: center; gap: 12px; padding: 16px 32px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.3s; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; border: none; }
        
        .hs-btn-primary { background-color: #dc2626; color: #fff; }
        .hs-btn-primary:hover { background-color: #b91c1c; }
        .hs-btn-primary:hover .hs-arrow { transform: translateX(5px); }
        .hs-arrow { transition: 0.3s; }

        .hs-btn-secondary { background-color: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff; }
        .hs-btn-secondary:hover { border-color: #fff; background-color: rgba(255,255,255,0.05); }
      `}</style>

      {/* 1. Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1500&q=80" 
        className={styles.image}
        alt="Premium Food Experience"
      />

      {/* 2. Overlay & Content */}
      <div className={styles.overlay}>
        <div className={styles.contentWrapper}>
          
          {/* Nhãn nhỏ phía trên */}
          <div className={styles.badge}>
            <span className={styles.dotWrapper}>
              <span className="ping"></span>
              <span className="dot"></span>
            </span>
            Đang có 120+ ưu đãi mới
          </div>

          {/* Tiêu đề chính */}
          <h1 className={styles.title}>
            Hương vị <br /> 
            <span className={styles.titleHighlight}>Thượng hạng</span>
          </h1>

          {/* Mô tả ngắn */}
          <p className={styles.description}>
            Trải nghiệm hành trình ẩm thực tinh tế với những đánh giá khách quan nhất từ cộng đồng chuyên gia.
          </p>

          {/* Nhóm nút bấm */}
          <div className={styles.buttonGroup}>
            <button className={styles.primaryBtn}>
              Khám phá ngay
              <ChevronRight size={18} className="hs-arrow" />
            </button>
            <button className={styles.secondaryBtn}>
              <Play size={16} fill="white" />
              Xem Review
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeSlider;
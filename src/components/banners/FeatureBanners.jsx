import React from 'react';
import { Truck, Clock, ShieldCheck } from 'lucide-react';

const FeatureBanners = () => {
  const features = [
    {
      id: 1,
      icon: <Truck size={28} />,
      title: "Freeship Xtra",
      desc: "Miễn phí vận chuyển cho đơn từ 50k",
      color: "#3b82f6",
      bg: "#eff6ff"
    },
    {
      id: 2,
      icon: <Clock size={28} />,
      title: "Giao Siêu Tốc",
      desc: "Giao hàng trong 30 phút",
      color: "#f59e0b",
      bg: "#fffbeb"
    },
    {
      id: 3,
      icon: <ShieldCheck size={28} />,
      title: "Đảm Bảo Chất Lượng",
      desc: "Hoàn tiền nếu món không ngon",
      color: "#10b981",
      bg: "#ecfdf5"
    }
  ];

  return (
    <div className="feature-grid">
      <style>{`
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .feature-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          border: 1px solid #f3f4f6;
          transition: 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          border-color: transparent;
        }
        .feature-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-info h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 4px 0;
        }
        .feature-info p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
      `}</style>

      {features.map((item) => (
        <div key={item.id} className="feature-card">
          <div className="feature-icon" style={{ backgroundColor: item.bg, color: item.color }}>
            {item.icon}
          </div>
          <div className="feature-info">
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureBanners;
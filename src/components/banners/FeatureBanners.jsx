import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Gift, ArrowRight } from 'lucide-react';

const FeatureBanners = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Hàm kiểm tra login khi bấm vào banner
  const handleProtectedClick = (path) => {
    if (!user) {
        if(window.confirm("Bạn cần đăng nhập để xem mục này. Đi đến trang đăng nhập?")) navigate('/login');
    } else {
        navigate(path);
    }
  };

  return (
    <div className="feature-banners-grid">
      <style>{`
        .feature-banners-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 30px;
        }
        .fb-card {
            border-radius: 20px; padding: 30px; position: relative; overflow: hidden;
            cursor: pointer; transition: transform 0.3s, box-shadow 0.3s;
            display: flex; flex-direction: column; justify-content: space-between; min-height: 180px;
        }
        .fb-card:hover { transform: translateY(-5px); }
        
        /* Banner Voucher (Màu cam đỏ) */
        .fb-voucher {
            background: linear-gradient(135deg, #f97316, #ea580c); color: white;
            box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.3);
        }
        .fb-voucher:hover { box-shadow: 0 15px 35px -5px rgba(234, 88, 12, 0.4); }
        
        /* Banner Nhiệm Vụ (Màu xanh dương) */
        .fb-mission {
            background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;
            box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.3);
        }
        .fb-mission:hover { box-shadow: 0 15px 35px -5px rgba(37, 99, 235, 0.4); }

        /* Icon nền mờ */
        .fb-bg-icon { position: absolute; bottom: -20px; right: -20px; opacity: 0.15; transform: rotate(-15deg); }
        
        .fb-content h3 { font-size: 22px; font-weight: 800; margin: 0 0 8px 0; }
        .fb-content p { margin: 0; opacity: 0.9; font-size: 15px; }

        .fb-btn {
            margin-top: 20px; align-self: flex-start;
            padding: 10px 20px; background: rgba(255,255,255,0.2); color: white;
            border: 1px solid rgba(255,255,255,0.3); border-radius: 30px;
            font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 6px;
            backdrop-filter: blur(5px); transition: 0.2s;
        }
        .fb-card:hover .fb-btn { background: white; color: #111827; }

        @media (max-width: 768px) {
            .feature-banners-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* BANNER 1: KHO VOUCHER */}
      <div className="fb-card fb-voucher" onClick={() => handleProtectedClick('/vouchers')}>
        <Ticket size={120} className="fb-bg-icon" />
        <div className="fb-content">
            <h3>Kho Voucher Đổi Điểm</h3>
            <p>Dùng điểm tích lũy đổi lấy hàng ngàn mã giảm giá độc quyền.</p>
        </div>
        <button className="fb-btn">Săn ngay <ArrowRight size={16}/></button>
      </div>

      {/* BANNER 2: NHIỆM VỤ (Thay cho cái banner mission cũ) */}
      <div className="fb-card fb-mission" onClick={() => handleProtectedClick('/user/dashboard')}>
        <Gift size={120} className="fb-bg-icon" style={{right: -10, bottom: -30, transform: 'rotate(15deg)'}} />
        <div className="fb-content">
            <h3>Nhiệm Vụ Hàng Ngày</h3>
            <p>Hoàn thành thử thách ăn uống để nhận quà tặng mỗi ngày.</p>
        </div>
        <button className="fb-btn">Tham gia <ArrowRight size={16}/></button>
      </div>
    </div>
  );
};

export default FeatureBanners;
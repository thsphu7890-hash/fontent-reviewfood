import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Truck, Tag, Info, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'order',
    title: 'Đặt hàng thành công!',
    message: 'Đơn hàng #DH2024 của bạn đã được nhà hàng tiếp nhận.',
    time: '2 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'promo',
    title: 'Giảm 50% hôm nay',
    message: 'Nhập mã BANMOI để được giảm giá cho đơn đầu tiên.',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: 3,
    type: 'system',
    title: 'Cập nhật bảo mật',
    message: 'Vui lòng xác thực số điện thoại để bảo vệ tài khoản.',
    time: '1 ngày trước',
    read: true,
  },
  {
    id: 4,
    type: 'driver',
    title: 'Tài xế đang đến',
    message: 'Tài xế Nguyễn Văn A đang trên đường giao đơn #DH1998.',
    time: '2 ngày trước',
    read: true,
  }
];

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  // Tính số lượng tin chưa đọc
  const unreadCount = notifications.filter(n => !n.read).length;

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  // Hàm render icon tùy theo loại thông báo
  const renderIcon = (type) => {
    switch (type) {
      case 'order': return <CheckCircle size={18} color="#10b981" />;
      case 'driver': return <Truck size={18} color="#3b82f6" />;
      case 'promo': return <Tag size={18} color="#f59e0b" />;
      default: return <Info size={18} color="#9ca3af" />;
    }
  };

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <style>{`
        .notif-wrapper { position: relative; }
        
        /* Icon chuông trên Header */
        .notif-btn {
            width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
            border-radius: 12px; background: rgba(255,255,255,0.03); color: #d1d5db;
            border: none; cursor: pointer; transition: 0.2s; position: relative;
        }
        .notif-btn:hover { background: rgba(255, 255, 255, 0.1); color: #ff4757; }
        .notif-btn.active { background: rgba(255, 71, 87, 0.1); color: #ff4757; }
        
        .notif-badge {
            position: absolute; top: 8px; right: 8px;
            width: 8px; height: 8px; background: #ff4757;
            border-radius: 50%; border: 2px solid #111827;
        }

        /* Dropdown chính */
        .notif-dropdown {
            position: absolute; top: calc(100% + 15px); right: -80px;
            width: 320px; background: #1f2937;
            border: 1px solid rgba(255,255,255,0.1); border-radius: 18px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5); z-index: 1002;
            overflow: hidden; animation: fadeIn 0.2s ease-out;
            transform-origin: top right;
        }
        @media (max-width: 768px) { .notif-dropdown { right: -50px; width: 300px; } }

        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        /* Header của Dropdown */
        .notif-header {
            padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex; justify-content: space-between; align-items: center;
        }
        .notif-title { color: #fff; font-weight: 700; font-size: 15px; margin: 0; }
        .notif-read-all {
            background: none; border: none; color: #ff4757; font-size: 12px;
            font-weight: 600; cursor: pointer;
        }
        .notif-read-all:hover { text-decoration: underline; }

        /* Danh sách thông báo */
        .notif-list { max-height: 350px; overflow-y: auto; }
        .notif-list::-webkit-scrollbar { width: 4px; }
        .notif-list::-webkit-scrollbar-track { background: #1f2937; }
        .notif-list::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }

        .notif-item {
            display: flex; gap: 12px; padding: 15px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.03);
            cursor: pointer; transition: 0.2s; position: relative;
        }
        .notif-item:hover { background: rgba(255,255,255,0.02); }
        .notif-item.unread { background: rgba(255, 71, 87, 0.05); }
        
        /* Chấm xanh đánh dấu chưa đọc */
        .notif-dot {
            position: absolute; right: 15px; top: 20px;
            width: 6px; height: 6px; background: #ff4757; border-radius: 50%;
        }

        .notif-icon-box {
            min-width: 36px; height: 36px; border-radius: 50%;
            background: rgba(255,255,255,0.05); display: flex;
            align-items: center; justify-content: center;
        }
        
        .notif-content h4 { color: #e5e7eb; font-size: 13px; font-weight: 600; margin: 0 0 4px 0; }
        .notif-content p { color: #9ca3af; font-size: 12px; margin: 0 0 6px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .notif-time { display: flex; align-items: center; gap: 4px; color: #6b7280; font-size: 10px; }

        .notif-empty { padding: 30px; text-align: center; color: #6b7280; font-size: 13px; }
      `}</style>

      {/* Nút Trigger */}
      <button 
        className={`notif-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-badge"></span>}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3 className="notif-title">Thông báo {unreadCount > 0 && `(${unreadCount})`}</h3>
            {unreadCount > 0 && (
                <button className="notif-read-all" onClick={handleMarkAllRead}>
                    Đánh dấu đã đọc
                </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length > 0 ? (
                notifications.map((item) => (
                    <div key={item.id} className={`notif-item ${!item.read ? 'unread' : ''}`} onClick={() => navigate('/history')}>
                        <div className="notif-icon-box">
                            {renderIcon(item.type)}
                        </div>
                        <div className="notif-content">
                            <h4>{item.title}</h4>
                            <p>{item.message}</p>
                            <div className="notif-time">
                                <Clock size={10} /> {item.time}
                            </div>
                        </div>
                        {!item.read && <div className="notif-dot"></div>}
                    </div>
                ))
            ) : (
                <div className="notif-empty">
                    <Bell size={24} style={{marginBottom: 8, opacity: 0.5}} />
                    <p>Bạn chưa có thông báo nào</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
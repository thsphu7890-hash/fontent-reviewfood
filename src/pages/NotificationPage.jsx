import React, { useState } from 'react';
import { Bell, Package, Gift, Info, Check, Trash2, Filter } from 'lucide-react';

const NotificationPage = () => {
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD
  
  // Mock Data (Sau này thay bằng API)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'ORDER', title: 'Đơn hàng đang giao', desc: 'Shipper Nguyễn Văn A đang giao đơn #123 đến bạn. Vui lòng chú ý điện thoại.', time: '5 phút trước', isRead: false },
    { id: 2, type: 'PROMO', title: 'Giảm 50% hôm nay', desc: 'Nhập mã FOOD50 để được giảm giá cho đơn từ 100k. Hạn chót 23:59 hôm nay.', time: '1 giờ trước', isRead: false },
    { id: 3, type: 'SYSTEM', title: 'Cập nhật hệ thống', desc: 'Hệ thống sẽ bảo trì vào lúc 00:00 tối nay để nâng cấp tính năng mới.', time: '1 ngày trước', isRead: true },
    { id: 4, type: 'ORDER', title: 'Giao hàng thành công', desc: 'Bạn vừa nhận đơn hàng #111. Hãy đánh giá 5 sao cho tài xế nhé!', time: '2 ngày trước', isRead: true },
    { id: 5, type: 'PROMO', title: 'Bạn có voucher chưa dùng', desc: 'Voucher giảm 20k sắp hết hạn vào ngày mai.', time: '3 ngày trước', isRead: true },
  ]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'ORDER': return <Package size={20} color="#3b82f6" />;
      case 'PROMO': return <Gift size={20} color="#eab308" />;
      case 'SYSTEM': return <Info size={20} color="#ef4444" />;
      default: return <Bell size={20} color="#9ca3af" />;
    }
  };

  const filteredData = filter === 'ALL' ? notifications : notifications.filter(n => !n.isRead);

  return (
    <div className="noti-page">
      <style>{`
        .noti-page { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .page-title h1 { font-size: 28px; font-weight: 800; color: #111827; margin: 0; display: flex; align-items: center; gap: 10px; }
        .mark-read-btn { background: white; border: 1px solid #e5e7eb; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; color: #3b82f6; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
        .mark-read-btn:hover { background: #eff6ff; border-color: #bfdbfe; }

        .filter-tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .tab-btn { background: none; border: none; padding: 8px 16px; font-weight: 600; color: #6b7280; cursor: pointer; border-radius: 20px; transition: 0.2s; }
        .tab-btn.active { background: #111827; color: white; }
        .tab-btn:hover:not(.active) { background: #f3f4f6; }

        .noti-list { display: flex; flex-direction: column; gap: 15px; }
        .noti-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; display: flex; gap: 15px; transition: 0.2s; position: relative; }
        .noti-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-color: #d1d5db; }
        .noti-card.unread { background: #eff6ff; border-color: #bfdbfe; }
        .noti-card.unread::after { content: ""; position: absolute; top: 20px; right: 20px; width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; }

        .icon-box { width: 50px; height: 50px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #f3f4f6; flex-shrink: 0; }
        
        .content-box { flex: 1; }
        .noti-title { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 6px; }
        .noti-desc { font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 8px; }
        .noti-meta { font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 10px; }

        .btn-delete { position: absolute; bottom: 20px; right: 20px; background: none; border: none; color: #9ca3af; cursor: pointer; opacity: 0; transition: 0.2s; }
        .noti-card:hover .btn-delete { opacity: 1; }
        .btn-delete:hover { color: #ef4444; }

        .empty-state { text-align: center; padding: 60px; color: #9ca3af; background: #f9fafb; border-radius: 20px; border: 2px dashed #e5e7eb; }
      `}</style>

      <div className="page-header">
        <div className="page-title">
          <h1><Bell size={28} /> Thông báo</h1>
        </div>
        <button className="mark-read-btn" onClick={handleMarkAllRead}>
          <Check size={16} /> Đánh dấu đã đọc
        </button>
      </div>

      <div className="filter-tabs">
        <button className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>Tất cả</button>
        <button className={`tab-btn ${filter === 'UNREAD' ? 'active' : ''}`} onClick={() => setFilter('UNREAD')}>Chưa đọc</button>
      </div>

      <div className="noti-list">
        {filteredData.length > 0 ? filteredData.map(item => (
          <div key={item.id} className={`noti-card ${!item.isRead ? 'unread' : ''}`}>
            <div className="icon-box">
              {getIcon(item.type)}
            </div>
            <div className="content-box">
              <div className="noti-title">{item.title}</div>
              <div className="noti-desc">{item.desc}</div>
              <div className="noti-meta">
                <span>{item.time}</span>
                <span>•</span>
                <span>{item.type === 'ORDER' ? 'Đơn hàng' : item.type === 'PROMO' ? 'Khuyến mãi' : 'Hệ thống'}</span>
              </div>
            </div>
            <button className="btn-delete" onClick={() => handleDelete(item.id)} title="Xóa thông báo">
              <Trash2 size={16} />
            </button>
          </div>
        )) : (
          <div className="empty-state">
            <Bell size={48} style={{opacity: 0.2, margin: '0 auto 10px'}} />
            <p>Không có thông báo nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
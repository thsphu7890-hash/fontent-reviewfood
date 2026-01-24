import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const ReviewList = ({ foodId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State lưu thống kê điểm số
  const [stats, setStats] = useState({ 
    avg: 0, 
    total: 0, 
    counts: { taste: 0, hygiene: 0, service: 0, price: 0 } 
  });

  useEffect(() => {
    const fetchReviews = async () => {
      if (!foodId) return;
      setLoading(true);
      try {
        // Gọi API Public (Ai cũng xem được)
        const res = await api.get(api`/reviews/food/${foodId}`);
        const data = res.data;
        
        setReviews(data);
        calculateStats(data);
      } catch (err) {
        console.error("Lỗi tải review:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [foodId]);

  // Hàm tính toán điểm trung bình
  const calculateStats = (data) => {
    if (!data || data.length === 0) return;
    
    const total = data.length;
    const sumRating = data.reduce((acc, r) => acc + r.rating, 0);
    
    // Tính trung bình các tiêu chí thành phần
    const sumTaste = data.reduce((acc, r) => acc + (r.tasteRating || r.rating), 0);
    const sumHygiene = data.reduce((acc, r) => acc + (r.hygieneRating || r.rating), 0);
    const sumService = data.reduce((acc, r) => acc + (r.serviceRating || r.rating), 0);
    const sumPrice = data.reduce((acc, r) => acc + (r.priceRating || r.rating), 0);

    setStats({
      total,
      avg: (sumRating / total).toFixed(1),
      counts: {
        taste: (sumTaste / total).toFixed(1),
        hygiene: (sumHygiene / total).toFixed(1),
        service: (sumService / total).toFixed(1),
        price: (sumPrice / total).toFixed(1),
      }
    });
  };

  // Helper render ngôi sao
  const renderStars = (rating, size = 14) => (
    <div style={{display:'flex', gap: 1}}>
        {[...Array(5)].map((_, i) => (
           <Star 
             key={i} 
             size={size} 
             fill={i < Math.round(rating) ? "#eab308" : "#e5e7eb"} 
             color={i < Math.round(rating) ? "#eab308" : "#e5e7eb"}
           />
        ))}
    </div>
  );

  // Helper format ngày
  const formatDate = (dateString) => {
      if(!dateString) return '';
      return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) return <div style={{padding: 20, textAlign: 'center', color: '#6b7280'}}>Đang tải đánh giá...</div>;

  return (
    <div className="review-container">
      {/* 1. BẢNG THỐNG KÊ (Chỉ hiện khi có review) */}
      {reviews.length > 0 ? (
          <div className="stats-board">
            {/* Cột trái: Điểm tổng */}
            <div className="stats-left">
                <div className="big-score">{stats.avg}<span>/5</span></div>
                <div className="stars-row">{renderStars(Number(stats.avg), 18)}</div>
                <div className="total-count">{stats.total} đánh giá</div>
            </div>
            
            {/* Cột phải: Điểm thành phần */}
            <div className="stats-right">
                <div className="progress-row">
                    <span className="p-label">Hương vị</span>
                    <div className="progress-bar"><div style={{width: `${(stats.counts.taste/5)*100}%`}}></div></div>
                    <span className="p-val">{stats.counts.taste}</span>
                </div>
                <div className="progress-row">
                    <span className="p-label">Vệ sinh</span>
                    <div className="progress-bar"><div style={{width: `${(stats.counts.hygiene/5)*100}%`}}></div></div>
                    <span className="p-val">{stats.counts.hygiene}</span>
                </div>
                <div className="progress-row">
                    <span className="p-label">Phục vụ</span>
                    <div className="progress-bar"><div style={{width: `${(stats.counts.service/5)*100}%`}}></div></div>
                    <span className="p-val">{stats.counts.service}</span>
                </div>
                <div className="progress-row">
                    <span className="p-label">Giá cả</span>
                    <div className="progress-bar"><div style={{width: `${(stats.counts.price/5)*100}%`}}></div></div>
                    <span className="p-val">{stats.counts.price}</span>
                </div>
            </div>
          </div>
      ) : (
          <div className="empty-reviews">
              <MessageCircle size={40} strokeWidth={1.5} />
              <p>Món này chưa có đánh giá nào.</p>
              <span>Hãy là người đầu tiên thưởng thức và để lại cảm nhận nhé!</span>
          </div>
      )}

      {/* 2. DANH SÁCH REVIEW CHI TIẾT */}
      <div className="comment-list">
        {reviews.map(r => (
            <div key={r.id} className="review-item">
                {/* Header: Avatar + Tên + Badge */}
                <div className="rv-header">
                    <img 
                        src={r.userAvatar || "https://ui-avatars.com/api/?background=random&name=" + r.username} 
                        alt="avatar" 
                        className="rv-avatar"
                        onError={(e)=>{e.target.onerror=null; e.target.src="https://placehold.co/50x50"}}
                    />
                    <div className="rv-user-meta">
                        <div className="rv-name">{r.username}</div>
                        <div className="rv-date">{formatDate(r.createdAt)}</div>
                    </div>
                    {/* Badge đã mua hàng */}
                    <div className="verified-badge">
                        <CheckCircle size={12} strokeWidth={3} /> Đã mua hàng
                    </div>
                </div>
                
                {/* Số sao & Nội dung */}
                <div className="rv-body">
                    <div className="rv-rating">{renderStars(r.rating)}</div>
                    <div className="rv-text">{r.comment}</div>
                    
                    {/* Ảnh review (Nếu có) */}
                    {r.images && r.images.length > 0 && (
                        <div className="rv-images">
                            {r.images.map((img, idx) => (
                                <img key={idx} src={img} alt="review detail" onClick={() => window.open(img, '_blank')} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Phản hồi của Shop (Nếu có) */}
                {r.reply && (
                    <div className="shop-reply">
                        <div className="shop-reply-title">Phản hồi của Người bán</div>
                        <p>{r.reply}</p>
                        <div className="shop-reply-date">{formatDate(r.replyAt)}</div>
                    </div>
                )}
            </div>
        ))}
      </div>

      <style>{`
        .review-container { padding: 10px 0; }
        
        /* Bảng thống kê */
        .stats-board { display: flex; gap: 30px; padding: 20px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; margin-bottom: 30px; }
        .stats-left { text-align: center; min-width: 120px; border-right: 1px solid #fde68a; padding-right: 30px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .big-score { font-size: 42px; font-weight: 800; color: #eab308; line-height: 1; }
        .big-score span { font-size: 18px; color: #9ca3af; font-weight: 500; }
        .stars-row { margin: 8px 0; }
        .total-count { font-size: 13px; color: #6b7280; }
        
        .stats-right { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px; }
        .progress-row { display: flex; align-items: center; gap: 15px; font-size: 13px; color: #4b5563; }
        .p-label { width: 70px; font-weight: 500; }
        .p-val { width: 30px; text-align: right; font-weight: 600; color: #1f2937; }
        .progress-bar { flex: 1; height: 6px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
        .progress-bar div { height: 100%; background: #eab308; border-radius: 10px; }

        /* Empty State */
        .empty-reviews { text-align: center; padding: 40px 0; color: #9ca3af; display: flex; flex-direction: column; align-items: center; gap: 10px; border: 1px dashed #e5e7eb; border-radius: 12px; }
        .empty-reviews span { font-size: 13px; color: #6b7280; }

        /* Review List */
        .review-item { padding: 20px 0; border-bottom: 1px solid #f3f4f6; }
        .review-item:last-child { border-bottom: none; }
        
        .rv-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .rv-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #f3f4f6; }
        .rv-user-meta { flex: 1; }
        .rv-name { font-weight: 700; font-size: 14px; color: #1f2937; }
        .rv-date { font-size: 12px; color: #9ca3af; }
        
        .verified-badge { 
            display: flex; align-items: center; gap: 4px; 
            font-size: 11px; font-weight: 600; color: #10b981; 
            background: #d1fae5; padding: 4px 8px; border-radius: 20px; 
        }

        .rv-body { padding-left: 52px; }
        .rv-rating { margin-bottom: 8px; }
        .rv-text { color: #374151; font-size: 14px; line-height: 1.5; margin-bottom: 12px; }
        
        .rv-images { display: flex; gap: 8px; flex-wrap: wrap; }
        .rv-images img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; cursor: pointer; border: 1px solid #e5e7eb; transition: 0.2s; }
        .rv-images img:hover { transform: scale(1.05); border-color: #d1d5db; }

        /* Shop Reply */
        .shop-reply { margin-top: 15px; margin-left: 52px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; position: relative; }
        .shop-reply::before { content: ""; position: absolute; top: -8px; left: 20px; border-width: 0 8px 8px; border-style: solid; border-color: transparent transparent #e2e8f0; }
        .shop-reply::after { content: ""; position: absolute; top: -6px; left: 21px; border-width: 0 7px 7px; border-style: solid; border-color: transparent transparent #f8fafc; }
        
        .shop-reply-title { font-size: 13px; font-weight: 700; color: #4b5563; margin-bottom: 4px; }
        .shop-reply p { font-size: 14px; color: #374151; margin: 0; }
        .shop-reply-date { font-size: 11px; color: #9ca3af; margin-top: 6px; text-align: right; }
      `}</style>
    </div>
  );
};
export default ReviewList;
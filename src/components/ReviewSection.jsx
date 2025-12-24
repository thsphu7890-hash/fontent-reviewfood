import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Star, User, Send, MessageSquare } from 'lucide-react';

const ReviewSection = ({ foodId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // Lấy thông tin user hiện tại
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. Fetch Review từ API
  const fetchReviews = async () => {
    try {
      // Backend API: GET /api/reviews/food/{foodId}
      const res = await api.get(`/reviews/food/${foodId}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Lỗi tải review:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (foodId) fetchReviews();
  }, [foodId]);

  // 2. Xử lý Gửi Review
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Vui lòng đăng nhập để đánh giá!");
    if (!newReview.comment.trim()) return alert("Vui lòng nhập nội dung đánh giá!");

    setSubmitting(true);
    try {
      const payload = {
        userId: user.id,
        foodId: foodId,
        rating: newReview.rating,
        comment: newReview.comment
      };
      
      // Backend API: POST /api/reviews
      await api.post('/reviews', payload);
      
      // Reset form và load lại danh sách
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
      alert("Cảm ơn bạn đã đánh giá!");
    } catch (error) {
      alert("Lỗi gửi đánh giá: " + (error.response?.data || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Helper tính điểm trung bình
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  // Helper render sao
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < rating ? "#fbbf24" : "none"} 
        color={i < rating ? "#fbbf24" : "#d1d5db"} 
      />
    ));
  };

  return (
    <div className="review-container">
      <style>{`
        .review-container { margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px; }
        .review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .avg-rating { font-size: 32px; font-weight: 900; color: #111; }
        .total-count { font-size: 14px; color: #6b7280; }
        
        .review-list { max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; padding-right: 5px; }
        .review-item { display: flex; gap: 12px; padding-bottom: 16px; border-bottom: 1px dashed #e5e7eb; }
        .reviewer-avatar { width: 36px; height: 36px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; font-weight: bold; }
        .reviewer-name { font-weight: 700; font-size: 13px; color: #111; margin-bottom: 2px; }
        .review-date { font-size: 11px; color: #9ca3af; margin-left: 8px; font-weight: 400; }
        .review-text { font-size: 13px; color: #4b5563; line-height: 1.4; margin-top: 4px; }

        .write-review-box { background: #f9fafb; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; }
        .rating-select { display: flex; gap: 4px; margin-bottom: 10px; cursor: pointer; }
        .comment-input { width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; font-size: 13px; outline: none; resize: none; box-sizing: border-box; }
        .comment-input:focus { border-color: #ef4444; background: white; }
        .btn-submit { margin-top: 10px; background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .btn-submit:hover { background: #dc2626; }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      {/* 1. HEADER: TỔNG QUAN ĐIỂM */}
      <div className="review-header">
        <div className="avg-rating">{averageRating}</div>
        <div>
           <div style={{display:'flex', gap: 2}}>{renderStars(Math.round(averageRating))}</div>
           <div className="total-count">{reviews.length} đánh giá</div>
        </div>
      </div>

      {/* 2. DANH SÁCH REVIEW */}
      <div className="review-list">
        {loading ? <p style={{fontSize:13, color:'#999'}}>Đang tải đánh giá...</p> : (
            reviews.length > 0 ? reviews.map((r) => (
                <div key={r.id} className="review-item">
                    <div className="reviewer-avatar">
                        {r.username ? r.username.charAt(0).toUpperCase() : <User size={16}/>}
                    </div>
                    <div style={{flex: 1}}>
                        <div style={{display:'flex', alignItems:'center'}}>
                            <span className="reviewer-name">{r.username || "Người dùng ẩn danh"}</span>
                            <span className="review-date">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div style={{display:'flex', marginBottom: 4}}>{renderStars(r.rating)}</div>
                        <p className="review-text">{r.comment}</p>
                    </div>
                </div>
            )) : (
                <div style={{textAlign:'center', padding: 20, color:'#9ca3af'}}>
                    <MessageSquare size={32} style={{opacity:0.3, marginBottom: 8}}/>
                    <p style={{fontSize:13}}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                </div>
            )
        )}
      </div>

      {/* 3. FORM VIẾT REVIEW (Chỉ hiện khi đã đăng nhập) */}
      {user ? (
        <form className="write-review-box" onSubmit={handleSubmit}>
            <h4 style={{fontSize: 14, fontWeight: 700, margin:'0 0 10px'}}>Viết đánh giá của bạn</h4>
            
            {/* Chọn sao */}
            <div className="rating-select">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        size={20} 
                        fill={star <= newReview.rating ? "#fbbf24" : "none"}
                        color={star <= newReview.rating ? "#fbbf24" : "#d1d5db"}
                        onClick={() => setNewReview({...newReview, rating: star})}
                    />
                ))}
            </div>

            <textarea 
                rows="3"
                className="comment-input"
                placeholder="Chia sẻ cảm nhận về món ăn..."
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
            />

            <div style={{display:'flex', justifyContent:'flex-end'}}>
                <button type="submit" className="btn-submit" disabled={submitting}>
                    <Send size={14} /> {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
            </div>
        </form>
      ) : (
        <div style={{textAlign:'center', padding: 15, background:'#f3f4f6', borderRadius: 8, fontSize: 13, color:'#666'}}>
            Vui lòng <a href="/login" style={{color:'#ef4444', fontWeight:'bold', textDecoration:'none'}}>đăng nhập</a> để viết đánh giá.
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Star, User, Send, MessageSquare, ThumbsUp, Camera, Image as ImageIcon, Filter, ChevronDown, Reply } from 'lucide-react';

const ReviewSection = ({ foodId }) => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', images: [] });
  const [submitting, setSubmitting] = useState(false);
  const [filterStar, setFilterStar] = useState('ALL'); // 'ALL', 5, 4, 3, 2, 1, 'IMAGE'
  const [previewImages, setPreviewImages] = useState([]);

  // Lấy thông tin user hiện tại
  const user = JSON.parse(localStorage.getItem('user'));

  // --- 1. FETCH DATA ---
  const fetchReviews = async () => {
    try {
      const res = await api.get(`api/reviews/food/${foodId}`);
      // Giả lập dữ liệu reply và like nếu backend chưa có
      const enhancedData = res.data.map(r => ({
          ...r,
          likes: Math.floor(Math.random() * 10),
          isLiked: false,
          reply: Math.random() > 0.7 ? { storeName: "FoodNest Official", content: "Cảm ơn bạn đã ủng hộ quán ạ! 🥰", date: "2024-03-20" } : null,
          images: Math.random() > 0.8 ? ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c"] : [] // Giả lập ảnh
      }));
      setReviews(enhancedData);
      setFilteredReviews(enhancedData);
    } catch (error) {
      console.error("Lỗi tải review:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (foodId) fetchReviews();
  }, [foodId]);

  // --- 2. FILTER LOGIC ---
  useEffect(() => {
    if (filterStar === 'ALL') {
        setFilteredReviews(reviews);
    } else if (filterStar === 'IMAGE') {
        setFilteredReviews(reviews.filter(r => r.images && r.images.length > 0));
    } else {
        setFilteredReviews(reviews.filter(r => r.rating === filterStar));
    }
  }, [filterStar, reviews]);

  // --- 3. HANDLERS ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewImages.length > 3) return alert("Tối đa 3 ảnh thôi bạn nhé!");
    
    // Tạo preview URL
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
    setNewReview({...newReview, images: [...newReview.images, ...files]});
  };

  const handleLikeReview = (reviewId) => {
      // Gọi API like ở đây (nếu có)
      const updated = reviews.map(r => {
          if (r.id === reviewId) {
              return { ...r, likes: r.isLiked ? r.likes - 1 : r.likes + 1, isLiked: !r.isLiked };
          }
          return r;
      });
      setReviews(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Vui lòng đăng nhập!");
    if (!newReview.comment.trim()) return alert("Nhập nội dung đi bạn ơi!");

    setSubmitting(true);
    try {
      // Upload ảnh trước (Giả lập) -> Lấy URL -> Gửi cùng comment
      // const imageUrls = await uploadFiles(newReview.images); 
      
      const payload = {
        userId: user.id,
        foodId: foodId,
        rating: newReview.rating,
        comment: newReview.comment,
        // images: imageUrls 
      };
      
      await api.post('/reviews', payload);
      
      setNewReview({ rating: 5, comment: '', images: [] });
      setPreviewImages([]);
      fetchReviews();
      alert("Đánh giá thành công!");
    } catch (error) {
      alert("Lỗi: " + (error.response?.data || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // --- STATS CALCULATION ---
  const avgRating = reviews.length ? (reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1) : 0;
  const countStar = (star) => reviews.filter(r => r.rating === star).length;

  return (
    <div className="review-wrapper">
      <style>{`
        .review-wrapper { margin-top: 40px; padding: 30px; background: #fff; border-radius: 16px; border: 1px solid #f3f4f6; }
        
        /* HEADER STATS */
        .stats-box { display: flex; gap: 40px; margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #f3f4f6; }
        .stats-left { text-align: center; min-width: 120px; }
        .big-score { font-size: 48px; font-weight: 800; color: #1f2937; line-height: 1; }
        .stats-stars { display: flex; justify-content: center; gap: 2px; margin: 8px 0; }
        .stats-total { font-size: 13px; color: #6b7280; }
        
        .stats-bars { flex: 1; display: flex; flex-direction: column; gap: 6px; justify-content: center; }
        .bar-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #4b5563; }
        .progress-bg { flex: 1; height: 6px; background: #f3f4f6; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: #fbbf24; border-radius: 10px; }

        /* FILTERS */
        .filter-tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 25px; }
        .filter-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.2s; color: #4b5563; }
        .filter-btn.active { border-color: #ef4444; color: #ef4444; background: #fef2f2; font-weight: 600; }

        /* REVIEW LIST */
        .review-item { padding: 20px 0; border-bottom: 1px solid #f3f4f6; }
        .r-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .u-info { display: flex; gap: 12px; }
        .u-avatar { width: 40px; height: 40px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #6b7280; }
        .u-name { font-weight: 700; font-size: 14px; color: #1f2937; }
        .r-time { font-size: 12px; color: #9ca3af; }
        
        .r-content { margin-left: 52px; }
        .r-text { font-size: 14px; color: #374151; line-height: 1.5; margin-top: 8px; }
        .r-images { display: flex; gap: 10px; margin-top: 12px; }
        .r-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; cursor: pointer; }
        
        .r-actions { display: flex; gap: 20px; margin-top: 12px; }
        .act-btn { background: none; border: none; font-size: 12px; color: #9ca3af; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
        .act-btn:hover { color: #ef4444; }
        .act-btn.active { color: #ef4444; font-weight: 600; }

        /* SELLER REPLY */
        .seller-reply { margin-top: 15px; background: #f9fafb; padding: 15px; border-radius: 12px; border-left: 3px solid #ef4444; }
        .reply-title { font-size: 12px; font-weight: 700; color: #ef4444; margin-bottom: 4px; display:flex; align-items:center; gap:6px;} 
        .reply-text { font-size: 13px; color: #4b5563; }

        /* WRITE FORM */
        .write-box { margin-top: 30px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .w-header { font-weight: 700; font-size: 16px; margin-bottom: 15px; }
        .star-picker { display: flex; gap: 5px; margin-bottom: 15px; }
        .star-item { cursor: pointer; transition: 0.2s; }
        .star-item:hover { transform: scale(1.1); }
        
        .w-input { width: 100%; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; font-size: 14px; outline: none; min-height: 100px; resize: none; background: #f9fafb; transition: 0.3s; }
        .w-input:focus { background: white; border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
        
        .w-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
        .upload-btn { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: 0.2s; }
        .upload-btn:hover { background: #f3f4f6; color: #1f2937; }
        
        .btn-post { background: #ef4444; color: white; padding: 10px 24px; border-radius: 10px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-post:hover { background: #dc2626; transform: translateY(-1px); }
        .preview-list { display: flex; gap: 10px; margin-top: 10px; }
        .preview-item { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }

        @media(max-width: 768px) { .stats-box { flex-direction: column; gap: 20px; } .r-content { margin-left: 0; margin-top: 10px; } }
      `}</style>

      {/* 1. THỐNG KÊ SAO & PROGRESS BAR */}
      <div className="stats-box">
        <div className="stats-left">
            <div className="big-score">{avgRating}</div>
            <div className="stats-stars">
                {[...Array(5)].map((_,i) => <Star key={i} size={16} fill={i < Math.round(avgRating) ? "#fbbf24" : "#e5e7eb"} color="none"/>)}
            </div>
            <div className="stats-total">{reviews.length} đánh giá</div>
        </div>
        <div className="stats-bars">
            {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="bar-row">
                    <span>{star} <Star size={10} fill="#6b7280" color="none" style={{display:'inline'}}/></span>
                    <div className="progress-bg">
                        <div className="progress-fill" style={{width: `${reviews.length ? (countStar(star)/reviews.length)*100 : 0}%`}}></div>
                    </div>
                    <span style={{minWidth: 20, textAlign:'right'}}>{countStar(star)}</span>
                </div>
            ))}
        </div>
      </div>

      {/* 2. BỘ LỌC */}
      <div className="filter-tabs">
        <button className={`filter-btn ${filterStar === 'ALL' ? 'active' : ''}`} onClick={()=>setFilterStar('ALL')}>Tất cả</button>
        <button className={`filter-btn ${filterStar === 5 ? 'active' : ''}`} onClick={()=>setFilterStar(5)}>5 Sao</button>
        <button className={`filter-btn ${filterStar === 4 ? 'active' : ''}`} onClick={()=>setFilterStar(4)}>4 Sao</button>
        <button className={`filter-btn ${filterStar === 3 ? 'active' : ''}`} onClick={()=>setFilterStar(3)}>3 Sao</button>
        <button className={`filter-btn ${filterStar === 'IMAGE' ? 'active' : ''}`} onClick={()=>setFilterStar('IMAGE')}>Có hình ảnh/Video</button>
      </div>

      {/* 3. DANH SÁCH REVIEW */}
      <div className="review-list-area">
        {loading ? <div style={{textAlign:'center', padding:20, color:'#9ca3af'}}>Đang tải...</div> : 
         filteredReviews.length === 0 ? <div style={{textAlign:'center', padding:40, color:'#9ca3af'}}>Chưa có đánh giá nào phù hợp.</div> :
         filteredReviews.map(r => (
            <div key={r.id} className="review-item">
                <div className="r-header">
                    <div className="u-info">
                        <div className="u-avatar">{r.username ? r.username.charAt(0) : <User size={18}/>}</div>
                        <div>
                            <div className="u-name">{r.username || "Khách hàng"}</div>
                            <div style={{display:'flex', gap:2}}>
                                {[...Array(5)].map((_,i) => <Star key={i} size={12} fill={i < r.rating ? "#fbbf24" : "#e5e7eb"} color="none"/>)}
                            </div>
                        </div>
                    </div>
                    <div className="r-time">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>

                <div className="r-content">
                    <div className="r-text">{r.comment}</div>
                    
                    {/* Hình ảnh đánh giá (Nếu có) */}
                    {r.images && r.images.length > 0 && (
                        <div className="r-images">
                            {r.images.map((img, idx) => (
                                <img key={idx} src={img} className="r-img" alt="review" onClick={()=>window.open(img, '_blank')}/>
                            ))}
                        </div>
                    )}

                    {/* Nút Like & Reply */}
                    <div className="r-actions">
                        <button className={`act-btn ${r.isLiked ? 'active' : ''}`} onClick={() => handleLikeReview(r.id)}>
                            <ThumbsUp size={14} fill={r.isLiked ? "currentColor" : "none"}/> 
                            {r.isLiked ? 'Đã thích' : 'Hữu ích'} ({r.likes || 0})
                        </button>
                        <button className="act-btn"><MessageSquare size={14}/> Bình luận</button>
                    </div>

                    {/* Phản hồi của người bán */}
                    {r.reply && (
                        <div className="seller-reply">
                            <div className="reply-title"><Reply size={12}/> Phản hồi từ {r.reply.storeName}</div>
                            <div className="reply-text">{r.reply.content}</div>
                        </div>
                    )}
                </div>
            </div>
         ))
        }
      </div>

      {/* 4. FORM VIẾT ĐÁNH GIÁ */}
      {user ? (
        <form className="write-box" onSubmit={handleSubmit}>
            <div className="w-header">Đánh giá sản phẩm này</div>
            
            <div className="star-picker">
                {[1,2,3,4,5].map(s => (
                    <Star 
                        key={s} size={28} className="star-item"
                        fill={s <= newReview.rating ? "#fbbf24" : "#e5e7eb"} 
                        color={s <= newReview.rating ? "#fbbf24" : "#d1d5db"}
                        onClick={() => setNewReview({...newReview, rating: s})}
                    />
                ))}
                <span style={{marginLeft:10, fontSize:14, color:'#f59e0b', fontWeight:600}}>
                    {newReview.rating === 5 ? 'Tuyệt vời' : newReview.rating === 4 ? 'Hài lòng' : newReview.rating === 3 ? 'Bình thường' : 'Tệ'}
                </span>
            </div>

            <textarea 
                className="w-input" 
                placeholder="Chất lượng món ăn thế nào? Hãy chia sẻ cảm nhận của bạn nhé..."
                value={newReview.comment}
                onChange={e => setNewReview({...newReview, comment: e.target.value})}
            />

            {previewImages.length > 0 && (
                <div className="preview-list">
                    {previewImages.map((src, i) => <img key={i} src={src} className="preview-item" alt="preview"/>)}
                </div>
            )}

            <div className="w-footer">
                <label className="upload-btn">
                    <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
                    <Camera size={18}/> Thêm ảnh/video
                </label>
                <button type="submit" className="btn-post" disabled={submitting}>
                    {submitting ? 'Đang gửi...' : <><Send size={16}/> Gửi đánh giá</>}
                </button>
            </div>
        </form>
      ) : (
        <div style={{textAlign:'center', marginTop:30, padding:20, background:'#f9fafb', borderRadius:12}}>
            Bạn cần <a href="/login" style={{color:'#ef4444', fontWeight:700, textDecoration:'none'}}>đăng nhập</a> để viết đánh giá.
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
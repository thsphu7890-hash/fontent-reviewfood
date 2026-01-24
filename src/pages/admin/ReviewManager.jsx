import React, { useState, useEffect } from 'react';
import { 
  Star, Trash2, MessageSquare, Search, Filter, 
  MoreVertical, Eye, EyeOff, CheckCircle, Reply, X
} from 'lucide-react';
import api from '../../api/axios'; // Import axios instance
import { toast } from 'react-hot-toast'; // Dùng toast cho đẹp

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStar, setFilterStar] = useState('ALL');

  // State Modal trả lời
  const [replyModal, setReplyModal] = useState({ open: false, reviewId: null, reviewContent: '' });
  const [replyText, setReplyText] = useState('');

  // --- 1. GỌI API LẤY DANH SÁCH ---
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/reviews'); // Hoặc '/api/admin/reviews' tùy backend của bạn
      
      // Map dữ liệu từ Backend về đúng form của Frontend (nếu cần)
      // Giả sử Backend trả về: { id, user: { fullName: "A" }, food: { name: "Cơm" }, rating... }
      const formattedData = Array.isArray(res.data) ? res.data.map(item => ({
        id: item.id,
        user: item.user?.fullName || item.username || "Khách ẩn danh",
        avatar: (item.user?.fullName || "U").charAt(0).toUpperCase(),
        food: item.food?.name || item.productName || "Món ăn",
        rating: item.rating,
        comment: item.comment,
        date: new Date(item.createdAt).toLocaleDateString('vi-VN'),
        isHidden: item.hidden, // Backend trả về hidden (true/false)
        reply: item.reply // Backend trả về nội dung trả lời (nếu có)
      })) : [];

      setReviews(formattedData);
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
      toast.error("Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // --- 2. LOGIC LỌC & TÌM KIẾM ---
  const filteredReviews = reviews.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = r.user.toLowerCase().includes(searchLower) || 
                        r.food.toLowerCase().includes(searchLower);
    const matchStar = filterStar === 'ALL' || r.rating === parseInt(filterStar);
    return matchSearch && matchStar;
  });

  // --- 3. CÁC HÀNH ĐỘNG API ---

  // Xóa đánh giá
  const handleDelete = async (id) => {
    if(!window.confirm("Bạn chắc chắn muốn xóa vĩnh viễn đánh giá này?")) return;

    try {
      await api.delete(`/api/reviews/${id}`);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success("Đã xóa đánh giá thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa đánh giá.");
    }
  };

  // Ẩn / Hiện đánh giá
  const handleToggleHidden = async (id, currentStatus) => {
    try {
      // Gọi API cập nhật trạng thái (PUT hoặc PATCH)
      await api.put(`/api/reviews/${id}/visibility`, { hidden: !currentStatus });
      
      // Cập nhật UI ngay lập tức
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isHidden: !r.isHidden } : r));
      toast.success(currentStatus ? "Đã hiển thị đánh giá" : "Đã ẩn đánh giá");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật trạng thái.");
    }
  };

  // Mở modal trả lời
  const openReplyModal = (review) => {
    setReplyModal({ open: true, reviewId: review.id, reviewContent: review.comment });
    setReplyText('');
  };

  // Gửi trả lời
  const handleSubmitReply = async () => {
    if (!replyText.trim()) return toast.error("Vui lòng nhập nội dung trả lời");
    
    try {
      // Gọi API gửi trả lời
      await api.post(`/api/reviews/${replyModal.reviewId}/reply`, { 
        content: replyText 
      });

      // Cập nhật UI: Thêm reply vào đánh giá tương ứng
      setReviews(prev => prev.map(r => r.id === replyModal.reviewId ? { ...r, reply: replyText } : r));
      
      // Đóng modal & Reset
      setReplyModal({ open: false, reviewId: null, reviewContent: '' });
      toast.success("Đã gửi phản hồi thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Gửi phản hồi thất bại.");
    }
  };

  // 4. Thống kê nhanh
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="manager-container">
      {/* HEADER & STATS */}
      <div className="page-header">
        <div>
          <h3 className="page-title">Quản lý Đánh giá</h3>
          <p className="page-subtitle">Xem và phản hồi ý kiến khách hàng</p>
        </div>
        <div className="stats-box">
          <div className="stat-item">
            <span className="stat-val">{reviews.length}</span>
            <span className="stat-label">Tổng đánh giá</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-val" style={{color:'#eab308'}}>{avgRating} <Star size={16} fill="currentColor" style={{display:'inline'}}/></span>
            <span className="stat-label">Điểm trung bình</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} color="#9ca3af"/>
          <input 
            placeholder="Tìm theo tên khách, món ăn..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} color="#64748b"/>
          <select value={filterStar} onChange={(e) => setFilterStar(e.target.value)}>
            <option value="ALL">Tất cả sao</option>
            <option value="5">5 Sao (Tuyệt vời)</option>
            <option value="4">4 Sao (Tốt)</option>
            <option value="3">3 Sao (Khá)</option>
            <option value="2">2 Sao (Trung bình)</option>
            <option value="1">1 Sao (Tệ)</option>
          </select>
        </div>
      </div>
      
      {/* TABLE */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Đánh giá</th>
              <th style={{width: '40%'}}>Nội dung</th>
              <th>Ngày</th>
              <th>Trạng thái</th>
              <th style={{textAlign:'right'}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding:30}}>Đang tải dữ liệu...</td></tr>
            ) : filteredReviews.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding:30, color:'#9ca3af'}}>Không tìm thấy đánh giá nào.</td></tr>
            ) : (
              filteredReviews.map(review => (
                <tr key={review.id} className={review.isHidden ? 'row-hidden' : ''}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{review.avatar}</div>
                      <div>
                        <div className="user-name">{review.user}</div>
                        <div className="food-name">{review.food}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="star-display">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "#eab308" : "#e5e7eb"} color={i < review.rating ? "#eab308" : "#e5e7eb"}/>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="comment-content">
                        "{review.comment}"
                    </div>
                    {review.reply && (
                        <div className="admin-reply">
                            <Reply size={12} style={{transform:'rotate(180deg)'}}/> 
                            <span style={{fontWeight:600}}>Shop:</span> {review.reply}
                        </div>
                    )}
                  </td>
                  <td style={{fontSize:13, color:'#6b7280'}}>{review.date}</td>
                  <td>
                    {review.isHidden ? 
                        <span className="badge badge-hidden">Đã ẩn</span> : 
                        <span className="badge badge-visible">Hiển thị</span>
                    }
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!review.reply && (
                        <button className="btn-icon btn-reply" onClick={() => openReplyModal(review)} title="Trả lời">
                            <MessageSquare size={18} />
                        </button>
                      )}
                      <button className="btn-icon btn-hide" onClick={() => handleToggleHidden(review.id, review.isHidden)} title={review.isHidden ? "Hiện lại" : "Ẩn đi"}>
                        {review.isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(review.id)} title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TRẢ LỜI */}
      {replyModal.open && (
        <div className="modal-overlay">
            <div className="modal-box">
                <div className="modal-header">
                    <h4>Trả lời đánh giá</h4>
                    <button onClick={() => setReplyModal({...replyModal, open: false})}><X size={20}/></button>
                </div>
                <div className="modal-body">
                    <div className="review-quote">
                        <strong>Khách viết:</strong> "{replyModal.reviewContent}"
                    </div>
                    <textarea 
                        className="reply-input"
                        rows="4" 
                        placeholder="Nhập nội dung phản hồi của cửa hàng..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => setReplyModal({...replyModal, open: false})}>Hủy</button>
                    <button className="btn-confirm" onClick={handleSubmitReply}>Gửi phản hồi</button>
                </div>
            </div>
        </div>
      )}
      
      {/* CSS STYLING */}
      <style>{`
        .manager-container { background: #fff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); min-height: 80vh; }
        
        /* HEADER */
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
        .page-title { font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 5px 0; }
        .page-subtitle { color: #6b7280; font-size: 14px; margin: 0; }
        
        .stats-box { display: flex; align-items: center; background: #f8fafc; padding: 10px 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .stat-item { text-align: center; }
        .stat-val { display: block; font-weight: 800; font-size: 18px; color: #1f2937; }
        .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
        .stat-divider { width: 1px; height: 30px; background: #cbd5e1; margin: 0 20px; }

        /* TOOLBAR */
        .toolbar { display: flex; gap: 15px; margin-bottom: 25px; }
        .search-box { flex: 1; display: flex; align-items: center; background: #f9fafb; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 15px; }
        .search-box input { border: none; background: transparent; padding: 12px; width: 100%; outline: none; font-size: 14px; }
        
        .filter-box { display: flex; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 15px; gap: 10px; }
        .filter-box select { border: none; outline: none; font-size: 14px; color: #475569; font-weight: 600; cursor: pointer; padding: 12px 0; }

        /* TABLE */
        .table-wrapper { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 12px; }
        .admin-table { width: 100%; border-collapse: collapse; min-width: 900px; }
        .admin-table th { text-align: left; padding: 16px 20px; background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .admin-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: top; }
        .admin-table tr:last-child td { border-bottom: none; }
        
        .row-hidden { opacity: 0.6; background: #f8fafc; }

        /* CELLS */
        .user-cell { display: flex; gap: 12px; align-items: center; }
        .user-avatar { width: 36px; height: 36px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
        .user-name { font-weight: 700; font-size: 14px; color: #0f172a; }
        .food-name { font-size: 12px; color: #64748b; margin-top: 2px; }
        
        .star-display { display: flex; gap: 2px; }
        
        .comment-content { font-size: 14px; line-height: 1.5; color: #334155; }
        .admin-reply { margin-top: 8px; background: #f0fdf4; padding: 8px 12px; border-radius: 8px; border-left: 3px solid #22c55e; font-size: 13px; color: #166534; display: flex; gap: 6px; align-items: flex-start; }

        /* BADGES & ACTIONS */
        .badge { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 700; }
        .badge-visible { background: #dcfce7; color: #15803d; }
        .badge-hidden { background: #f1f5f9; color: #64748b; }

        .action-buttons { display: flex; justify-content: flex-end; gap: 8px; }
        .btn-icon { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .btn-reply { background: #eff6ff; color: #3b82f6; }
        .btn-reply:hover { background: #3b82f6; color: white; }
        .btn-hide { background: #f3f4f6; color: #64748b; }
        .btn-hide:hover { background: #64748b; color: white; }
        .btn-delete { background: #fef2f2; color: #ef4444; }
        .btn-delete:hover { background: #ef4444; color: white; }

        /* MODAL */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); animation: fadeIn 0.2s; }
        .modal-box { background: white; width: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
        .modal-header { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 18px; }
        .modal-header button { background: none; border: none; cursor: pointer; color: #9ca3af; }
        .modal-body { padding: 20px; }
        .review-quote { background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px; color: #475569; margin-bottom: 15px; border-left: 3px solid #cbd5e1; font-style: italic; }
        .reply-input { width: 100%; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; outline: none; font-size: 14px; resize: none; font-family: inherit; }
        .reply-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .modal-footer { padding: 15px 20px; background: #f8fafc; display: flex; justify-content: flex-end; gap: 10px; }
        .btn-cancel { padding: 10px 20px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-weight: 600; color: #64748b; cursor: pointer; }
        .btn-confirm { padding: 10px 20px; border-radius: 8px; border: none; background: #3b82f6; font-weight: 600; color: white; cursor: pointer; }
        .btn-confirm:hover { background: #2563eb; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ReviewManager;
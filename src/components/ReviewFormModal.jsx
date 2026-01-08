import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios'; // Import api instance của bạn

const ReviewFormModal = ({ isOpen, onClose, orderItem, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !orderItem) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Gọi API đánh giá (Cần đảm bảo Backend có endpoint này)
            // Ví dụ POST /api/reviews
            await api.post('/reviews', {
                orderId: orderItem.orderId,
                foodId: orderItem.foodId,
                rating: rating,
                comment: comment
            });

            toast.success("Đánh giá thành công!");
            onSuccess(); // Load lại danh sách đơn hàng để cập nhật trạng thái
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Không thể gửi đánh giá, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="btn-close" onClick={onClose}><X size={20}/></button>
                
                <h3>Đánh giá món ăn</h3>
                <div className="food-preview">
                    <img 
                        src={orderItem.image ? (orderItem.image.startsWith('http') ? orderItem.image : `http://localhost:8080${orderItem.image}`) : "https://placehold.co/100"} 
                        alt="Food" 
                    />
                    <div>
                        <h4>{orderItem.foodName}</h4>
                        <p>Bạn thấy món này thế nào?</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                                key={star} 
                                size={32} 
                                fill={star <= rating ? "#f59e0b" : "none"} 
                                color={star <= rating ? "#f59e0b" : "#cbd5e1"}
                                style={{cursor: 'pointer'}}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>

                    <textarea 
                        placeholder="Hãy chia sẻ cảm nhận của bạn về hương vị, đóng gói..."
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    ></textarea>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18}/> : "Gửi đánh giá"}
                    </button>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); z-index: 1000;
                    display: flex; align-items: center; justify-content: center;
                }
                .modal-content {
                    background: white; width: 90%; max-width: 500px;
                    padding: 24px; border-radius: 12px; position: relative;
                    animation: slideUp 0.3s ease;
                }
                .btn-close {
                    position: absolute; top: 16px; right: 16px;
                    background: none; border: none; cursor: pointer; color: #64748b;
                }
                .food-preview {
                    display: flex; gap: 15px; align-items: center; margin-bottom: 20px;
                    background: #f8fafc; padding: 10px; border-radius: 8px;
                }
                .food-preview img {
                    width: 50px; height: 50px; border-radius: 6px; object-fit: cover;
                }
                .food-preview h4 { margin: 0 0 4px 0; font-size: 15px; }
                .food-preview p { margin: 0; font-size: 13px; color: #64748b; }
                
                .star-rating { display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; }
                
                textarea {
                    width: 100%; padding: 12px; border: 1px solid #e2e8f0;
                    border-radius: 8px; margin-bottom: 20px; font-family: inherit;
                    resize: none; outline: none;
                }
                textarea:focus { border-color: #ef4444; }
                
                .btn-submit {
                    width: 100%; padding: 12px; background: #ef4444; color: white;
                    border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
                    display: flex; justify-content: center; align-items: center; gap: 8px;
                }
                .btn-submit:hover { background: #dc2626; }
                .btn-submit:disabled { background: #fca5a5; cursor: not-allowed; }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ReviewFormModal;
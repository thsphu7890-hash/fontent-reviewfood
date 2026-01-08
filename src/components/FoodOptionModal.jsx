import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import ReviewList from './ReviewList'; // <--- 1. IMPORT COMPONENT REVIEW LIST

const FoodOptionModal = ({ isOpen, onClose, food }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  
  // State để chuyển đổi giữa Tab "Thông tin" và "Đánh giá"
  const [activeTab, setActiveTab] = useState('INFO'); 

  if (!isOpen || !food) return null;

  const handleAddToCart = () => {
    addToCart({ ...food, quantity, note });
    toast.success(`Đã thêm ${quantity} ${food.name} vào giỏ!`);
    onClose();
    setQuantity(1);
    setNote('');
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Nút đóng */}
        <button className="close-btn" onClick={onClose}><X size={24} /></button>

        <div className="modal-body-scroll">
            {/* Ảnh món ăn */}
            <div className="food-cover">
            <img 
                src={food.image?.startsWith('http') ? food.image : `http://localhost:8080${food.image}`} 
                alt={food.name} 
                className="modal-img"
                onError={(e)=>{e.target.onerror=null; e.target.src="https://placehold.co/600x400?text=Food"}}
            />
            </div>

            <div className="food-details">
                <div className="modal-header-row">
                    <h2 className="modal-title">{food.name}</h2>
                    <div className="modal-price">{formatPrice(food.price)}</div>
                </div>
                <div className="modal-desc">{food.description || "Món ăn ngon, chất lượng tuyệt hảo."}</div>

                {/* --- 2. TAB SWITCHER (Thông tin / Đánh giá) --- */}
                <div className="tab-switcher">
                    <button 
                        className={`tab-item ${activeTab === 'INFO' ? 'active' : ''}`}
                        onClick={() => setActiveTab('INFO')}
                    >
                        Tùy chọn món
                    </button>
                    <button 
                        className={`tab-item ${activeTab === 'REVIEW' ? 'active' : ''}`}
                        onClick={() => setActiveTab('REVIEW')}
                    >
                        Đánh giá & Nhận xét
                    </button>
                </div>

                {/* --- NỘI DUNG TAB --- */}
                {activeTab === 'INFO' ? (
                    <div className="info-tab">
                        {/* Ghi chú */}
                        <div className="option-group">
                            <label>Ghi chú cho quán</label>
                            <input 
                                type="text" 
                                className="note-input" 
                                placeholder="Ví dụ: Không hành, ít cay..." 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        {/* Số lượng */}
                        <div className="action-row">
                            <div className="quantity-control">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={18}/></button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)}><Plus size={18}/></button>
                            </div>
                            <button className="add-btn" onClick={handleAddToCart}>
                                <ShoppingCart size={18} />
                                Thêm vào giỏ - {formatPrice(food.price * quantity)}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* --- 3. HIỂN THỊ REVIEW LIST --- */
                    <div className="review-tab">
                        <ReviewList foodId={food.id} />
                    </div>
                )}
            </div>
        </div>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); animation: fadeIn 0.2s; }
        .modal-content { background: white; width: 600px; max-width: 95%; height: 85vh; border-radius: 20px; overflow: hidden; position: relative; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .modal-body-scroll { overflow-y: auto; flex: 1; }
        
        .close-btn { position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .close-btn:hover { background: rgba(0,0,0,0.7); transform: rotate(90deg); }

        .food-cover { height: 250px; background: #f3f4f6; }
        .modal-img { width: 100%; height: 100%; object-fit: cover; }

        .food-details { padding: 25px; }
        .modal-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .modal-title { font-size: 22px; font-weight: 800; color: #111827; margin: 0; line-height: 1.3; flex: 1; }
        .modal-price { font-size: 20px; font-weight: 700; color: #ef4444; }
        .modal-desc { color: #6b7280; font-size: 14px; margin-bottom: 20px; line-height: 1.5; }

        /* TABS CSS */
        .tab-switcher { display: flex; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; }
        .tab-item { flex: 1; padding: 12px; background: none; border: none; border-bottom: 2px solid transparent; font-weight: 600; color: #6b7280; cursor: pointer; transition: 0.2s; }
        .tab-item:hover { color: #111827; background: #f9fafb; }
        .tab-item.active { color: #ef4444; border-color: #ef4444; }

        .option-group { margin-bottom: 25px; }
        .option-group label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #374151; }
        .note-input { width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; outline: none; font-size: 14px; transition: 0.2s; }
        .note-input:focus { border-color: #ef4444; }

        .action-row { display: flex; gap: 15px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f3f4f6; }
        .quantity-control { display: flex; align-items: center; gap: 10px; background: #f3f4f6; padding: 5px 10px; border-radius: 10px; }
        .quantity-control button { width: 32px; height: 32px; border: none; background: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #111827; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .quantity-control button:active { transform: scale(0.95); }
        .quantity-control span { font-weight: 700; font-size: 16px; min-width: 20px; text-align: center; }

        .add-btn { flex: 1; background: #ef4444; color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
        .add-btn:hover { background: #dc2626; transform: translateY(-1px); }
        .add-btn:active { transform: translateY(0); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default FoodOptionModal;
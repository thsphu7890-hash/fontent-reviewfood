import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
// 1. IMPORT COMPONENT REVIEW
import ReviewSection from './ReviewSection';

const FoodOptionModal = ({ isOpen, onClose, food }) => {
  const { addToCart } = useCart();
  
  // State lưu lựa chọn
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('M'); // Mặc định size M

  // Reset state mỗi khi mở modal với món mới
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSize('M');
    }
  }, [isOpen, food]);

  if (!isOpen || !food) return null;

  // Tính giá tiền dựa trên Size
  const calculatePrice = () => {
    let finalPrice = food.price;
    if (size === 'L') finalPrice += 5000; // Size L thêm 5k
    return finalPrice;
  };

  const handleAddToCart = () => {
    // 1. Chuẩn bị dữ liệu
    const productToAdd = {
        ...food,
        price: calculatePrice() // Lưu giá đã tính theo size
    };
    
    // 2. Chuẩn bị Options
    const options = { size: size }; 
    
    // 3. Gọi hàm Context
    addToCart(productToAdd, quantity, options);
    
    // 4. Đóng modal
    onClose();
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  return (
    <div className="food-modal-overlay" onClick={onClose}>
      <style>{`
        .food-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.2s; }
        
        /* Cập nhật CSS để Modal có thanh cuộn */
        .food-modal-box { 
            background: #fff; width: 90%; max-width: 500px; border-radius: 20px; 
            overflow: hidden; position: relative; animation: slideUp 0.3s; 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            display: flex; flex-direction: column; max-height: 90vh; /* Giới hạn chiều cao */
        }
        
        .modal-header-img { width: 100%; height: 200px; object-fit: cover; flex-shrink: 0; }
        
        /* Body có thể cuộn */
        .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
        
        .modal-title { font-size: 24px; font-weight: 800; margin-bottom: 8px; color: #111; }
        .modal-desc { font-size: 14px; color: #6b7280; margin-bottom: 20px; line-height: 1.5; }
        
        .option-group { margin-bottom: 20px; }
        .option-label { display: block; font-weight: 700; margin-bottom: 10px; font-size: 14px; }
        .size-options { display: flex; gap: 10px; }
        .size-btn { flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; transition: 0.2s; font-weight: 600; font-size: 14px; }
        .size-btn.active { border-color: #ef4444; background: #fef2f2; color: #ef4444; }
        
        .qty-control { display: flex; align-items: center; justify-content: center; gap: 16px; margin: 20px 0; background: #f9fafb; padding: 10px; border-radius: 12px; }
        .qty-btn { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #d1d5db; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .qty-btn:hover { background: #ef4444; border-color: #ef4444; color: white; }
        .qty-value { font-weight: 800; font-size: 18px; min-width: 30px; text-align: center; }

        /* Footer cố định ở đáy */
        .modal-footer { border-top: 1px solid #f3f4f6; padding: 20px; display: flex; justify-content: space-between; align-items: center; background: #fff; flex-shrink: 0; }
        .total-price { font-size: 20px; font-weight: 900; color: #ef4444; }
        .add-cart-btn { background: #111827; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; border: none; transition: 0.2s; }
        .add-cart-btn:hover { background: #000; transform: translateY(-2px); }
        
        .close-icon { position: absolute; top: 15px; right: 15px; background: white; border-radius: 50%; padding: 5px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10; }
        
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="food-modal-box" onClick={(e) => e.stopPropagation()}>
        <X className="close-icon" onClick={onClose} />
        
        <img src={food.image || "https://via.placeholder.com/500x300"} className="modal-header-img" alt={food.name} />
        
        <div className="modal-body">
            <h3 className="modal-title">{food.name}</h3>
            <p className="modal-desc">{food.description || "Món ăn chưa có mô tả."}</p>

            {/* CHỌN SIZE */}
            <div className="option-group">
                <label className="option-label">Chọn kích cỡ (Size)</label>
                <div className="size-options">
                    <button 
                        className={`size-btn ${size === 'M' ? 'active' : ''}`}
                        onClick={() => setSize('M')}
                    >
                        Size M <br/><span style={{fontSize: 12, fontWeight: 400}}>Giá gốc</span>
                    </button>
                    <button 
                        className={`size-btn ${size === 'L' ? 'active' : ''}`}
                        onClick={() => setSize('L')}
                    >
                        Size L <br/><span style={{fontSize: 12, fontWeight: 400}}>+5.000đ</span>
                    </button>
                </div>
            </div>

            {/* CHỌN SỐ LƯỢNG */}
            <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16}/></button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}><Plus size={16}/></button>
            </div>

            {/* 2. HIỂN THỊ PHẦN ĐÁNH GIÁ TẠI ĐÂY */}
            <ReviewSection foodId={food.id} />
        </div>

        <div className="modal-footer">
            <div>
                <div style={{fontSize: 12, color: '#6b7280'}}>Tổng tiền</div>
                <div className="total-price">{formatPrice(calculatePrice() * quantity)}</div>
            </div>
            <button className="add-cart-btn" onClick={handleAddToCart}>
                <ShoppingCart size={20} /> Thêm vào giỏ
            </button>
        </div>
      </div>
    </div>
  );
};

export default FoodOptionModal;
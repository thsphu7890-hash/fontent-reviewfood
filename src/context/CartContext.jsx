import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast'; // Sử dụng toast thay vì alert

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Khởi tạo giỏ hàng từ LocalStorage
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Tự động lưu vào LocalStorage mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- 1. HÀM THÊM VÀO GIỎ ---
  const addToCart = (product, quantity = 1, options = {}) => {
    setCartItems((prev) => {
      // Kiểm tra trùng lặp: Phải cùng ID và cùng tùy chọn (Size, Topping...)
      const existItemIndex = prev.findIndex((item) => 
        item.id === product.id && 
        JSON.stringify(item.options) === JSON.stringify(options)
      );

      if (existItemIndex !== -1) {
        // Nếu đã tồn tại món y hệt -> Tăng số lượng
        const newCart = [...prev];
        newCart[existItemIndex].quantity += quantity;
        return newCart;
      } else {
        // Nếu món mới hoặc tùy chọn khác -> Thêm dòng mới với ID duy nhất
        const newItem = { 
            ...product, 
            quantity, 
            options,
            cartItemId: Date.now() + Math.random() 
        };
        return [...prev, newItem];
      }
    });

    // Thông báo Luxury bằng Toast
    toast.success(`Đã thêm ${quantity} x ${product.name} vào giỏ!`, {
        icon: '🛒',
        style: {
            borderRadius: '10px',
            background: '#334155',
            color: '#fff',
        },
    });
  };

  // --- 2. HÀM XÓA DÒNG SẢN PHẨM ---
  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    toast.error("Đã xóa món khỏi giỏ hàng");
  };

  // --- 3. HÀM CẬP NHẬT SỐ LƯỢNG (Tăng/Giảm) ---
  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return; 
    setCartItems((prev) => 
        prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item)
    );
  };

  // --- 4. LÀM TRỐNG GIỎ HÀNG ---
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // --- 5. TÍNH TỔNG TIỀN ---
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
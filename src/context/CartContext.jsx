import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- 1. HÀM THÊM MỚI (NÂNG CẤP) ---
  // Nhận vào: product (thông tin món), quantity (số lượng khách chọn), options (Object chứa size, đường, đá...)
  const addToCart = (product, quantity = 1, options = {}) => {
    setCartItems((prev) => {
      // Tìm xem trong giỏ đã có món nào trùng ID VÀ trùng Options (Size) chưa
      const existItemIndex = prev.findIndex((item) => 
        item.id === product.id && 
        JSON.stringify(item.options) === JSON.stringify(options)
      );

      if (existItemIndex !== -1) {
        // TRƯỜNG HỢP 1: Đã có món y hệt (Cùng ID, cùng Size) -> Cộng dồn số lượng
        const newCart = [...prev];
        newCart[existItemIndex].quantity += quantity; 
        return newCart;
      } else {
        // TRƯỜNG HỢP 2: Món mới hoặc Size khác -> Thêm dòng mới
        // Tạo một cartItemId riêng để phân biệt các dòng trong giỏ
        const newItem = { 
            ...product, 
            quantity: quantity, 
            options: options,
            cartItemId: Date.now() + Math.random() // ID tạm thời cho dòng này trong giỏ
        };
        return [...prev, newItem];
      }
    });
    alert(`Đã thêm ${quantity} x "${product.name}" vào giỏ!`);
  };

  // --- 2. HÀM XÓA (SỬA LẠI) ---
  // Phải xóa theo cartItemId (ID dòng) chứ không xóa theo product.id
  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // --- 3. HÀM CẬP NHẬT SỐ LƯỢNG TRONG GIỎ (Tăng/Giảm) ---
  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return; // Không cho giảm dưới 1
    setCartItems((prev) => 
        prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item)
    );
  };

  const clearCart = () => setCartItems([]);

  // --- 4. TÍNH TỔNG TIỀN ---
  // Lưu ý: Giá product.price truyền vào phải là giá đã bao gồm phụ phí Size (nếu có)
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, // Xuất thêm hàm này để dùng ở trang Giỏ hàng
        clearCart, 
        totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
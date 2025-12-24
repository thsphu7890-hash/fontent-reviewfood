import React, { useState } from 'react';
import ReactPlayer from 'react-player'; // <--- Import cái này

const FoodItem = ({ food }) => {
  // Hàm xử lý khi bấm đặt món
  const handleOrder = () => {
    alert(`Đã thêm món "${food.name}" vào giỏ hàng! 🛒`);
    // Sau này code logic gửi API đặt hàng ở đây
  };

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
      
      {/* 1. Phần Ảnh (Luôn hiện) */}
      <img 
        src={food.image || "https://via.placeholder.com/300"} 
        alt={food.name} 
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3 className="font-bold text-xl mb-1">{food.name}</h3>
        <p className="text-red-500 font-bold text-lg mb-2">
          {food.price.toLocaleString('vi-VN')} đ
        </p>

        {/* 2. Phần Video Review (Chỉ hiện nếu có link) */}
        {food.videoUrl && (
          <div className="my-3 rounded overflow-hidden">
            <p className="text-xs text-gray-500 mb-1">🎥 Review thực tế:</p>
            <ReactPlayer 
              url={food.videoUrl} 
              width="100%" 
              height="200px" 
              controls={true} // Hiện nút Play/Pause
              light={true}    // Chế độ nhẹ: chỉ tải thumbnail trước khi bấm play
            />
          </div>
        )}

        {/* Mô tả món ăn */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {food.description}
        </p>

        {/* 3. Nút Đặt Món (Review xong thì đặt luôn) */}
        <button 
          onClick={handleOrder}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
        >
          <span>🛒</span> Đặt Món Ngay
        </button>
      </div>
    </div>
  );
};

export default FoodItem;
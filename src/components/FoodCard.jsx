import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { ShoppingCart, Play, Star, Clock, MapPin, Plus, Heart } from 'lucide-react';

const FoodItem = ({ food, onAdd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Xử lý khi bấm nút Thêm
  const handleOrder = (e) => {
    e.stopPropagation();
    if (onAdd) {
        onAdd(food); // Gọi hàm từ component cha (Home/Menu)
    } else {
        alert(`Đã chọn: ${food.name}`);
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';

  return (
    <div 
      className="food-card-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .food-card-wrapper {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #f3f4f6;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .food-card-wrapper:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.08);
            border-color: #fed7aa; /* Viền cam nhạt khi hover */
        }

        /* MEDIA AREA */
        .media-box {
            position: relative;
            width: 100%;
            padding-top: 65%; /* Aspect ratio 3:2 */
            overflow: hidden;
            background: #f9fafb;
        }
        .media-content {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        .food-card-wrapper:hover .media-content {
            transform: scale(1.05);
        }

        /* BADGES */
        .badge-time {
            position: absolute; bottom: 10px; left: 10px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(4px);
            padding: 4px 10px; border-radius: 20px;
            font-size: 11px; font-weight: 700; color: #374151;
            display: flex; align-items: center; gap: 4px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            z-index: 2;
        }
        
        .btn-play-overlay {
            position: absolute; inset: 0;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.2);
            opacity: 0; transition: 0.3s;
            z-index: 3;
        }
        .food-card-wrapper:hover .btn-play-overlay { opacity: 1; }
        
        .play-icon-circle {
            width: 44px; height: 44px;
            background: rgba(255,255,255,0.9);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #ef4444;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: scale(0.8); transition: 0.2s;
        }
        .food-card-wrapper:hover .play-icon-circle { transform: scale(1); }

        /* CONTENT */
        .card-body {
            padding: 16px;
            flex: 1;
            display: flex; flex-direction: column;
        }
        
        .food-name {
            font-size: 16px; font-weight: 700; color: #111827;
            margin-bottom: 6px;
            line-height: 1.4;
            display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
        }
        
        .food-desc {
            font-size: 13px; color: #6b7280;
            margin-bottom: 12px;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
            line-height: 1.5;
        }

        .meta-row {
            display: flex; align-items: center; gap: 12px;
            font-size: 12px; color: #6b7280; margin-bottom: 15px;
        }
        
        /* FOOTER ACTION */
        .card-footer {
            margin-top: auto;
            display: flex; justify-content: space-between; align-items: flex-end;
        }
        .price-text {
            font-size: 17px; font-weight: 800; color: #ef4444;
        }
        
        .btn-add {
            width: 36px; height: 36px;
            border-radius: 10px;
            border: 1px solid #ffedd5;
            background: #fff7ed;
            color: #ea580c;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: 0.2s;
        }
        .btn-add:hover {
            background: #ea580c; color: white; border-color: #ea580c;
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(234, 88, 12, 0.25);
        }

        /* VIDEO PLAYER OVERLAY */
        .video-overlay {
            position: absolute; inset: 0; z-index: 10; background: black;
        }
        .close-video {
            position: absolute; top: 10px; right: 10px; z-index: 20;
            background: rgba(255,255,255,0.2); color: white;
            border-radius: 50%; width: 30px; height: 30px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; backdrop-filter: blur(4px);
        }
      `}</style>

      {/* 1. MEDIA SECTION */}
      <div className="media-box">
        {food.videoUrl && isPlaying ? (
          <div className="video-overlay">
            <ReactPlayer 
              url={food.videoUrl} 
              width="100%" height="100%" 
              playing={true} controls={true} 
              onEnded={() => setIsPlaying(false)}
            />
            <div className="close-video" onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}>
                ✕
            </div>
          </div>
        ) : (
          <>
            <img 
              src={food.image || "https://via.placeholder.com/400x300?text=Food"} 
              alt={food.name} 
              className="media-content"
            />
            
            {/* Badge Time */}
            <div className="badge-time">
                <Clock size={11} color="#f59e0b" strokeWidth={2.5}/> 
                {food.time || "20"}p
            </div>

            {/* Video Play Button (Nếu có video) */}
            {food.videoUrl && (
                <div className="btn-play-overlay" onClick={(e) => { e.stopPropagation(); setIsPlaying(true); }}>
                    <div className="play-icon-circle">
                        <Play size={20} fill="currentColor" style={{marginLeft:2}}/>
                    </div>
                </div>
            )}
          </>
        )}
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="card-body">
        <h3 className="food-name">{food.name}</h3>
        <p className="food-desc">{food.description || "Hương vị tuyệt hảo, nguyên liệu tươi ngon được chọn lọc kỹ càng."}</p>
        
        <div className="meta-row">
            <div style={{display:'flex', alignItems:'center', gap:3}}>
                <Star size={13} fill="#fbbf24" color="#fbbf24"/> 4.8
            </div>
            <span style={{color:'#e5e7eb'}}>|</span>
            <div style={{display:'flex', alignItems:'center', gap:3}}>
                <MapPin size={13}/> {food.distance || "1.2"}km
            </div>
        </div>

        <div className="card-footer">
            <span className="price-text">{formatPrice(food.price)}</span>
            <button className="btn-add" onClick={handleOrder} title="Thêm vào giỏ">
                <Plus size={20} strokeWidth={2.5}/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
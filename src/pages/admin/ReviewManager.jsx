import React, { useState, useEffect } from 'react';
import { Star, Trash2, MessageSquare } from 'lucide-react';
// import api from '../../api/axios'; // Bỏ comment khi có API thật

const ReviewManager = () => {
  // Dữ liệu giả lập (Sau này thay bằng gọi API)
  const [reviews, setReviews] = useState([
    { id: 1, user: "Nguyễn Văn A", food: "Cơm tấm sườn", rating: 5, comment: "Ngon tuyệt vời!", date: "2023-10-20" },
    { id: 2, user: "Trần Thị B", food: "Trà sữa", rating: 3, comment: "Hơi ngọt quá", date: "2023-10-21" },
    { id: 3, user: "Lê Văn C", food: "Bún bò", rating: 1, comment: "Giao hàng chậm", date: "2023-10-22" },
  ]);

  const handleDelete = (id) => {
    if(window.confirm("Xóa đánh giá này?")) {
      setReviews(reviews.filter(r => r.id !== id));
      // await api.delete(/admin/reviews/${id});
    }
  };

  return (
    <div className="manager-container">
      <h3 className="page-title">Quản lý Đánh giá ({reviews.length})</h3>
      
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Món ăn</th>
              <th>Đánh giá</th>
              <th>Nội dung</th>
              <th>Ngày</th>
              <th>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>#{review.id}</td>
                <td>{review.user}</td>
                <td>{review.food}</td>
                <td>
                  <div style={{display:'flex', alignItems:'center', color: '#eab308'}}>
                    {review.rating} <Star size={14} fill="#eab308" style={{marginLeft:4}}/>
                  </div>
                </td>
                <td>{review.comment}</td>
                <td>{review.date}</td>
                <td>
                  <button onClick={() => handleDelete(review.id)} style={{border:'none', background:'none', cursor:'pointer', color:'#ef4444'}}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <style>{`
        .manager-container { background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .page-title { margin-bottom: 20px; font-size: 20px; font-weight: 800; }
        .table-wrapper { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .admin-table th { text-align: left; padding: 15px; background: #f9fafb; color: #6b7280; font-size: 13px; text-transform: uppercase; }
        .admin-table td { padding: 15px; border-bottom: 1px solid #f3f4f6; color: #1f2937; }
      `}</style>
    </div>
  );
};

export default ReviewManager;
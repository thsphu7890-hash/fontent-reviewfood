import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import AddFoodModal from './AddFoodModal'; 
// Import đầy đủ icon từ thư viện
import { Edit, Trash2, Plus, Search, Loader, UtensilsCrossed, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';

const FoodManager = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);   
  const pageSize = 8; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // --- GỌI API ---
  const fetchFoods = async (page = 0) => {
    try {
      setLoading(true);
      const response = await api.get(`/foods`, {
        params: { page: page, size: pageSize, search: searchTerm }
      }); 

      const data = response.data;
      if (data.content) {
        setFoods(data.content);         
        setTotalPages(data.totalPages); 
        setCurrentPage(data.number);    
      } else {
        setFoods(data); 
        setTotalPages(1);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECT ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchFoods(0); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- HANDLERS ---
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchFoods(newPage);
    }
  };

  const handleAddNew = () => { setEditingFood(null); setIsModalOpen(true); };
  const handleEdit = (food) => { setEditingFood(food); setIsModalOpen(true); };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa món ăn này không?")) {
      try {
        await api.delete(`/foods/${id}`);
        fetchFoods(currentPage); 
      } catch (error) {
        alert("Không thể xóa món ăn!");
      }
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  return (
    <div className="mgr-container">
      <style>{`
        /* --- LAYOUT CHUNG --- */
        .food-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 10px; }
        .food-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
        
        /* --- CARD MÓN ĂN --- */
        .food-card { background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; transition: 0.3s; display: flex; flex-direction: column; height: 100%; }
        .food-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1); border-color: #fca5a5; }
        
        .food-img-box { position: relative; height: 160px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .food-img { width: 100%; height: 100%; object-fit: cover; transition: 0.3s; }
        .food-card:hover .food-img { transform: scale(1.05); }
        .food-price-tag { position: absolute; bottom: 8px; right: 8px; background: rgba(239, 68, 68, 0.95); color: #fff; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); backdrop-filter: blur(2px); }
        
        .food-body { padding: 16px; flex-grow: 1; display: flex; flex-direction: column; }
        .food-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; height: 44px; }
        .food-res { font-size: 12px; color: #6b7280; margin-bottom: 12px; display: flex; align-items: center; gap: 4px; }
        .food-footer { display: flex; gap: 8px; border-top: 1px solid #f3f4f6; padding-top: 12px; margin-top: auto; }
        
        /* --- BUTTONS --- */
        .btn-action { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; border: 1px solid #e5e7eb; background: #fff; }
        .btn-edit:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .btn-delete:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
        
        .mgr-btn-add { background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3); transition: 0.2s; }
        .mgr-btn-add:hover { background: #dc2626; transform: translateY(-1px); }
        
        .search-container { margin-bottom: 24px; position: relative; max-width: 400px; width: 100%; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .search-input { width: 100%; padding: 10px 10px 10px 40px; border: 1px solid #e5e7eb; border-radius: 10px; outline: none; transition: 0.2s; }
        .search-input:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }

        /* --- 🔥 CSS PHÂN TRANG (ĐÃ SỬA LỖI PADDING) --- */
        .pagination-bar { 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          gap: 16px; 
          margin-top: 40px; 
          padding-top: 20px;
          border-top: 1px dashed #e5e7eb;
        }
        
        .page-btn { 
            display: flex;             /* Flexbox căn giữa */
            align-items: center; 
            justify-content: center; 
            
            width: 40px;               /* Kích thước vuông */
            height: 40px; 
            
            padding: 0 !important;     /* 🔴 QUAN TRỌNG: Reset padding về 0 để icon không bị bóp méo */
            
            border-radius: 8px; 
            border: 1px solid #d1d5db; 
            background: #ffffff; 
            color: #1f2937;            /* Màu icon đen xám */
            cursor: pointer; 
            transition: all 0.2s ease;
        }
        
        .page-btn:hover:not(:disabled) { 
            background: #f3f4f6;
            border-color: #ef4444;
            color: #ef4444;            /* Hover đổi màu đỏ */
        }
        
        .page-btn:disabled { 
            opacity: 0.5; 
            cursor: not-allowed; 
        }

        .page-info {
            font-weight: 600;
            font-size: 14px;
            color: #374151;
        }
      `}</style>

      {/* HEADER & SEARCH */}
      <div className="food-header">
        <h2 style={{fontSize: '24px', fontWeight: '900', color: '#1f2937'}}>
          Quản lý <span style={{color: '#ef4444'}}>Món ăn</span>
        </h2>
        <button className="mgr-btn-add" onClick={handleAddNew}>
          <Plus size={20} /> Thêm món mới
        </button>
      </div>

      <div className="search-container">
        <Search className="search-icon" size={18} />
        <input 
          type="text" placeholder="Tìm kiếm theo tên món..." className="search-input"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LOADING & DATA GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
          <Loader className="animate-spin" color="#ef4444" size={40} style={{margin: '0 auto 16px'}} />
          <p>Đang tải danh sách món ăn...</p>
        </div>
      ) : (
        <>
          <div className="food-grid">
            {foods.length > 0 ? foods.map((food) => (
              <div key={food.id} className="food-card">
                <div className="food-img-box">
                  {food.image ? (
                    <img 
                      src={food.image.startsWith('http') ? food.image : `http://localhost:8080${food.image}`} 
                      className="food-img" alt={food.name} 
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=No+Image"; }}
                    />
                  ) : (
                    <div style={{color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      <ImageOff size={32} />
                      <span style={{fontSize: '12px', marginTop: '4px'}}>No Image</span>
                    </div>
                  )}
                  <span className="food-price-tag">{formatPrice(food.price)}</span>
                </div>

                <div className="food-body">
                  <span className="food-name" title={food.name}>{food.name}</span>
                  <span className="food-res">
                    <UtensilsCrossed size={14} /> 
                    {food.restaurantName || "Chưa gán nhà hàng"}
                  </span>
                  
                  <div className="food-footer">
                    <button className="btn-action btn-edit" onClick={() => handleEdit(food)}>
                      <Edit size={16}/> Sửa
                    </button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(food.id)}>
                      <Trash2 size={16}/> Xóa
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px dashed #e5e7eb'}}>
                <UtensilsCrossed size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                <p style={{color: '#6b7280', fontWeight: '500'}}>Không tìm thấy món ăn nào.</p>
                <p style={{fontSize: '13px', color: '#9ca3af'}}>Thử tìm kiếm từ khóa khác hoặc thêm món mới.</p>
              </div>
            )}
          </div>

          {/* PHÂN TRANG (DÙNG ICON THƯ VIỆN CHUẨN) */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <button 
                className="page-btn" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                title="Trang trước"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              
              <span className="page-info">
                Trang {currentPage + 1} / {totalPages}
              </span>

              <button 
                className="page-btn" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                title="Trang sau"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL */}
      <AddFoodModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
        onRefresh={() => fetchFoods(currentPage)} editingFood={editingFood} 
      />
    </div>
  );
};

export default FoodManager;
import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  Search, Plus, Edit, Trash2, MapPin, Tag, Star
} from 'lucide-react';
import AddFoodModal from './AddFoodModal';

const FoodManager = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterPrice, setFilterPrice] = useState("ALL");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // --- 1. CALL API ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resFood, resCat] = await Promise.all([
        api.get('/api/food?size=1000'), 
        api.get('/api/categories')
      ]);
      setFoods(Array.isArray(resFood.data) ? resFood.data : resFood.data.content || []);
      setCategories(resCat.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. HANDLERS ---
  const handleAddNew = () => {
    setEditingFood(null);
    setIsModalOpen(true);
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa món ăn này không?")) return;
    try {
      await api.delete(`/api/food/${id}`);
      setFoods(prev => prev.filter(f => f.id !== id));
      toast.success("Đã xóa món ăn!");
    } catch (error) {
      toast.error("Lỗi khi xóa món ăn");
    }
  };

  const handleRefresh = () => {
      fetchData();
      toast.success(editingFood ? "Cập nhật thành công!" : "Thêm mới thành công!");
  };

  // --- 3. FILTER & RENDER ---
  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      const matchSearch = food.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategory === "ALL" || 
                       (food.categoryId && food.categoryId.toString() === filterCategory) || 
                       (food.categoryName === filterCategory);
      
      let matchPrice = true;
      if (filterPrice === "LOW") matchPrice = food.price < 30000;
      else if (filterPrice === "MID") matchPrice = food.price >= 30000 && food.price <= 70000;
      else if (filterPrice === "HIGH") matchPrice = food.price > 70000;

      return matchSearch && matchCat && matchPrice;
    });
  }, [searchTerm, filterCategory, filterPrice, foods]);

  // Pagination
  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);
  const currentData = filteredFoods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p);

  return (
    <div className="mgr-container">
      {/* --- CSS STYLES MỚI (ĐẸP HƠN) --- */}
      <style>{`
        .mgr-container { padding: 30px; font-family: 'Inter', sans-serif; color: #1f2937; background: #f3f4f6; min-height: 100vh; }
        
        /* HEADER */
        .mgr-header { margin-bottom: 30px; }
        .mgr-title h2 { font-size: 28px; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.5px; }
        .mgr-title p { color: #6b7280; font-size: 15px; margin-top: 6px; }

        /* TOOLBAR */
        .mgr-toolbar { 
            display: flex; gap: 15px; align-items: center; background: white; 
            padding: 15px 20px; border-radius: 16px; margin-bottom: 30px; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border: 1px solid rgba(229, 231, 235, 0.5);
        }
        .search-box { position: relative; flex: 1; min-width: 280px; }
        .search-input { width: 100%; padding: 12px 12px 12px 45px; border: 1px solid #e5e7eb; border-radius: 12px; outline: none; font-size: 14px; transition: 0.2s; background: #f9fafb; box-sizing: border-box; }
        .search-input:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .filter-select { padding: 12px 15px; border: 1px solid #e5e7eb; border-radius: 12px; outline: none; background: white; cursor: pointer; font-size: 14px; color: #4b5563; font-weight: 500; }
        .btn-add { background: #111827; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn-add:hover { background: #2563eb; transform: translateY(-1px); }

        /* --- CARD STYLE (NEW DESIGN) --- */
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
        
        .food-card { 
            background: white; border-radius: 20px; overflow: hidden; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            display: flex; flex-direction: column; position: relative;
            border: 1px solid rgba(0,0,0,0.04);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            height: 100%;
        }
        .food-card:hover { 
            transform: translateY(-8px); 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Ảnh sản phẩm */
        .card-img-wrapper { position: relative; width: 100%; height: 200px; overflow: hidden; }
        .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .food-card:hover .card-img { transform: scale(1.1); } /* Zoom khi hover */
        
        .price-badge { 
            position: absolute; top: 15px; right: 15px; 
            background: rgba(255, 255, 255, 0.95); 
            padding: 6px 12px; border-radius: 30px; 
            font-weight: 800; color: #ef4444; font-size: 14px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            backdrop-filter: blur(4px);
        }

        /* Nội dung card */
        .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
        
        .card-tags { display: flex; gap: 8px; margin-bottom: 10px; }
        .cat-pill { 
            font-size: 11px; font-weight: 700; color: #4f46e5; background: #e0e7ff; 
            padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;
            display: inline-flex; align-items: center; gap: 4px;
        }

        .card-title { font-weight: 800; color: #111827; margin-bottom: 8px; font-size: 18px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .card-res { font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px; margin-bottom: 15px; }
        
        .card-desc { font-size: 13px; color: #9ca3af; line-height: 1.5; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        /* Nút hành động */
        .card-actions { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .btn-action { 
            padding: 10px; border-radius: 10px; border: none; cursor: pointer; 
            display: flex; align-items: center; justify-content: center; gap: 6px; 
            font-size: 13px; font-weight: 600; transition: 0.2s; 
        }
        .btn-edit { background: #f3f4f6; color: #374151; }
        .btn-edit:hover { background: #e5e7eb; color: #111827; }
        .btn-delete { background: #fee2e2; color: #ef4444; }
        .btn-delete:hover { background: #fecaca; color: #dc2626; }

        /* PAGINATION */
        .pagination { display: flex; justify-content: center; margin-top: 40px; gap: 8px; }
        .page-btn { width: 40px; height: 40px; border: 1px solid #e5e7eb; background: white; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-weight: 600; color: #4b5563; }
        .page-btn.active { background: #111827; color: white; border-color: #111827; }
        .page-btn:hover:not(.active):not(:disabled) { border-color: #6366f1; color: #6366f1; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* HEADER */}
      <div className="mgr-header">
        <div className="mgr-title">
          <h2>Quản Lý Thực Đơn</h2>
          <p>Quản lý danh sách món ăn, giá cả và danh mục hiển thị trên ứng dụng</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="mgr-toolbar">
        <div className="search-box">
            <Search size={18} style={{position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', color:'#9ca3af'}} />
            <input 
                className="search-input" 
                placeholder="Tìm kiếm món ăn, nhà hàng..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
        </div>
        
        <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="ALL">📦 Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select className="filter-select" value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)}>
            <option value="ALL">💲 Tất cả mức giá</option>
            <option value="LOW">Dưới 30k</option>
            <option value="MID">30k - 70k</option>
            <option value="HIGH">Trên 70k</option>
        </select>

        <button className="btn-add" onClick={handleAddNew}>
            <Plus size={18}/> Thêm món mới
        </button>
      </div>

      {/* CARD GRID */}
      <div className="card-grid">
        {loading ? (
           <div style={{gridColumn:'1/-1', textAlign:'center', padding:60, color:'#6b7280'}}>Đang tải dữ liệu...</div>
        ) : currentData.length === 0 ? (
           <div style={{gridColumn:'1/-1', textAlign:'center', padding:60, color:'#9ca3af', border:'2px dashed #e5e7eb', borderRadius:20}}>
              Không tìm thấy món ăn nào phù hợp.
           </div>
        ) : (
           currentData.map((food) => (
             <div key={food.id} className="food-card">
               {/* 1. Hình ảnh + Giá */}
               <div className="card-img-wrapper">
                 <img 
                   src={food.image || food.imageUrl || "https://via.placeholder.com/300x200"} 
                   className="card-img" 
                   alt={food.name}
                   onError={(e)=>{e.target.src="https://via.placeholder.com/400x300?text=No+Image"}}
                 />
                 <div className="price-badge">{formatPrice(food.price)}đ</div>
               </div>
               
               {/* 2. Nội dung */}
               <div className="card-body">
                 <div className="card-tags">
                    <span className="cat-pill">
                        <Tag size={10}/>
                        {categories.find(c => c.id == food.categoryId)?.name || food.categoryName || "Khác"}
                    </span>
                 </div>

                 <div className="card-title">{food.name}</div>
                 
                 <div className="card-res">
                    <MapPin size={14} color="#6b7280"/>
                    {food.restaurantName || "Nhà hàng FoodNest"}
                 </div>

                 <div className="card-desc">
                    {food.description || "Chưa có mô tả chi tiết cho món ăn này."}
                 </div>
                 
                 {/* 3. Nút bấm */}
                 <div className="card-actions">
                   <button className="btn-action btn-edit" onClick={() => handleEdit(food)}>
                     <Edit size={16}/> Chỉnh sửa
                   </button>
                   <button className="btn-action btn-delete" onClick={() => handleDelete(food.id)}>
                     <Trash2 size={16}/> Xóa
                   </button>
                 </div>
               </div>
             </div>
           ))
        )}
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
           <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}> ← </button>
           {Array.from({length: totalPages}, (_, i) => i + 1).map(pageNum => (
               <button 
                 key={pageNum} 
                 className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                 onClick={() => setCurrentPage(pageNum)}
               >
                 {pageNum}
               </button>
           ))}
           <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}> → </button>
        </div>
      )}

      {/* MODAL (Giữ nguyên component cũ) */}
      <AddFoodModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={handleRefresh} 
        editingFood={editingFood} 
      />
    </div>
  );
};

export default FoodManager;
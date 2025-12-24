import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Edit, Trash2, Plus, Search, Loader, Tag, X, Save } from 'lucide-react';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  // 1. Lấy danh sách
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories'); // Gọi API GET
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi lấy chuyên mục:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Mở modal
  const openModal = (category = null) => {
    setEditingCategory(category);
    setCategoryName(category ? category.name : '');
    setIsModalOpen(true);
  };

  // 2. Xử lý Lưu (Thêm mới hoặc Cập nhật)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (editingCategory) {
        // --- GỌI API SỬA (PUT) ---
        const response = await api.put(`/categories/${editingCategory.id}`, { name: categoryName });
        
        // Cập nhật state trực tiếp (không cần load lại API)
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? response.data : cat
        ));
        alert("Đã cập nhật thành công!");
      } else {
        // --- GỌI API THÊM (POST) ---
        const response = await api.post('/categories', { name: categoryName });
        
        // Thêm vào đầu danh sách
        setCategories([response.data, ...categories]);
        alert("Đã thêm mới thành công!");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu chuyên mục!");
    }
  };

  // 3. Xử lý Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa chuyên mục này?")) {
      try {
        // --- GỌI API XÓA (DELETE) ---
        await api.delete(`/categories/${id}`);
        
        // Lọc bỏ item đã xóa khỏi state
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        console.error(error);
        alert("Không thể xóa (có thể đang được sử dụng bởi nhà hàng nào đó)!");
      }
    }
  };

  return (
    <div className="cat-mgr-container">
      {/* CSS Styles giữ nguyên như cũ của bạn */}
      <style>{`
        .cat-mgr-container { animation: fadeIn 0.4s ease; padding: 10px; }
        .cat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        
        .mgr-btn-add { background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .mgr-btn-add:hover { background: #dc2626; }

        .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .cat-card { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; transition: 0.3s; }
        .cat-card:hover { border-color: #ef4444; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        .cat-icon-box { background: #000; color: #fff; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; }
        .cat-info { flex: 1; }
        .cat-name { font-weight: 800; color: #000; font-size: 16px; margin-bottom: 2px; display: block; }
        .cat-count { font-size: 12px; color: #9ca3af; }

        .cat-actions { display: flex; gap: 8px; }
        .btn-mini { background: none; border: none; cursor: pointer; color: #9ca3af; transition: 0.2s; }
        .btn-mini:hover { color: #ef4444; }

        .cat-search-bar { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 15px; display: flex; align-items: center; gap: 10px; margin-bottom: 24px; max-width: 400px; }
        .cat-search-bar input { border: none; outline: none; width: 100%; font-size: 14px; }

        .cat-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .cat-modal { background: #fff; padding: 24px; border-radius: 16px; width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); position: relative; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .f-input { width: 100%; padding: 12px; border: 2px solid #f3f4f6; border-radius: 8px; outline: none; margin-bottom: 20px; box-sizing: border-box; }
        .f-input:focus { border-color: #fecaca; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="cat-header">
        <h2 style={{ fontSize: '24px', fontWeight: 900 }}>Quản lý <span style={{ color: '#ef4444' }}>Chuyên mục</span></h2>
        <button className="mgr-btn-add" onClick={() => openModal()}>
          <Plus size={20} /> Thêm chuyên mục
        </button>
      </div>

      <div className="cat-search-bar">
        <Search size={18} color="#9ca3af" />
        <input 
          type="text" 
          placeholder="Tìm chuyên mục (VD: Đồ uống, Món Á...)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Loader className="animate-spin" color="#ef4444" />
        </div>
      ) : (
        <div className="cat-grid">
          {categories
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((cat) => (
              <div key={cat.id} className="cat-card">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="cat-icon-box">
                    <Tag size={20} />
                  </div>
                  <div className="cat-info">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-count">ID: #{cat.id}</span>
                  </div>
                </div>
                <div className="cat-actions">
                  <button className="btn-mini" onClick={() => openModal(cat)} title="Sửa">
                    <Edit size={16} />
                  </button>
                  <button className="btn-mini" onClick={() => handleDelete(cat.id)} title="Xóa">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="cat-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="cat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editingCategory ? 'Sửa chuyên mục' : 'Thêm chuyên mục'}</h3>
              <X style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleSave}>
              <input 
                className="f-input"
                placeholder="Nhập tên chuyên mục..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
                required
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                 <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
                   Hủy
                 </button>
                 <button type="submit" className="mgr-btn-add" style={{ flex: 2, justifyContent: 'center' }}>
                   <Save size={18} /> {editingCategory ? 'Cập nhật' : 'Lưu mới'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
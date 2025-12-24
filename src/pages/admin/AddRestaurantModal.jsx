import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Save, Loader } from 'lucide-react';

const AddRestaurantModal = ({ isOpen, onClose, onRefresh, editingData }) => {
  // State danh sách chuyên mục để chọn
  const [categories, setCategories] = useState([]);
  
  // State form
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    image: '',
    categoryId: '' // Thêm trường này
  });
  
  const [loading, setLoading] = useState(false);

  // 1. Lấy danh sách chuyên mục khi mở Modal
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const res = await api.get('/categories');
          setCategories(res.data);
        } catch (err) {
          console.error("Lỗi lấy danh mục:", err);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  // 2. Đổ dữ liệu vào form khi sửa
  useEffect(() => {
    if (editingData) {
      setFormData({
        name: editingData.name || '',
        address: editingData.address || '',
        description: editingData.description || '',
        image: editingData.image || '',
        // Backend cần trả về categoryId trong DTO
        categoryId: editingData.categoryId || '' 
      });
    } else {
      // Reset form khi thêm mới
      setFormData({ name: '', address: '', description: '', image: '', categoryId: '' });
    }
  }, [editingData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingData) {
        // --- LOGIC SỬA ---
        await api.put(`/restaurants/${editingData.id}`, formData);
        alert("Cập nhật thành công!");
      } else {
        // --- LOGIC THÊM ---
        await api.post('/restaurants', formData);
        alert("Thêm mới thành công!");
      }
      onRefresh(); 
      onClose();   
    } catch (error) {
      alert("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
        .modal-content { background: #fff; width: 500px; padding: 30px; border-radius: 16px; position: relative; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .modal-title { font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #111; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #374151; }
        .form-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; transition: 0.2s; box-sizing: border-box; }
        .form-input:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
        .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; display: flex; align-items: center; gap: 8px; }
        .btn-cancel { background: #f3f4f6; color: #4b5563; }
        .btn-submit { background: #ef4444; color: #fff; }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .close-icon { position: absolute; top: 20px; right: 20px; cursor: pointer; color: #9ca3af; }
        .close-icon:hover { color: #000; }
        
        /* Style riêng cho select */
        select.form-input { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1em; }
      `}</style>

      <div className="modal-content">
        <X className="close-icon" onClick={onClose} />
        <h3 className="modal-title">
          {editingData ? 'Cập nhật nhà hàng' : 'Thêm nhà hàng mới'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên nhà hàng</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ví dụ: Phở Thìn..." 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Chuyên mục</label>
            <select 
              className="form-input"
              value={formData.categoryId}
              onChange={e => setFormData({...formData, categoryId: e.target.value})}
              required
            >
              <option value="">-- Chọn chuyên mục --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Số 13 Lò Đúc..." 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Link ảnh (URL)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="https://..." 
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả chi tiết</label>
            <textarea 
              className="form-input" 
              rows="3"
              placeholder="Giới thiệu về quán..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>Hủy bỏ</button>
            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
              {editingData ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurantModal;
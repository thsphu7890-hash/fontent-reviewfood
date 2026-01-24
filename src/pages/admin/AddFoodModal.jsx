import React, { useState, useEffect } from 'react';
import { 
  X, Save, Link as LinkIcon, Utensils, DollarSign, 
  AlignLeft, Store, Layers, Loader, UploadCloud, Image as ImageIcon, CheckSquare, Square
} from 'lucide-react';
import api from '../../api/axios';

const AddFoodModal = ({ isOpen, onClose, onRefresh, editingFood }) => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    name: '', price: '', description: '',
    restaurantId: '', 
    categoryIds: [], 
    image: ''
  });
  
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // --- FETCH DATA (Restaurants & Categories) ---
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [resRes, catRes] = await Promise.all([
            api.get('/api/restaurants'),
            api.get('/api/categories')
          ]);
          setRestaurants(resRes.data);
          setCategories(catRes.data);
        } catch (error) { console.error("Lỗi tải dữ liệu:", error); }
      };
      fetchData();
    }
  }, [isOpen]);

  // --- LOAD DATA FOR EDIT ---
  useEffect(() => {
    if (editingFood) {
      // EDIT MODE: Populate form with existing data
      setFormData({
        name: editingFood.name || '',
        price: editingFood.price || '',
        description: editingFood.description || '',
        restaurantId: editingFood.restaurantId || '',
        categoryIds: editingFood.categories ? editingFood.categories.map(c => c.id) : [],
        image: editingFood.image || ''
      });
      setPreviewImage(editingFood.image);
    } else {
      // ADD MODE: Reset form
      setFormData({ name: '', price: '', description: '', restaurantId: '', categoryIds: [], image: '' });
      setPreviewImage(null);
    }
  }, [editingFood, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'image') setPreviewImage(value);
  };

  // --- MULTI-CATEGORY SELECTION LOGIC ---
  const toggleCategory = (catId) => {
    setFormData(prev => {
      const currentIds = prev.categoryIds;
      if (currentIds.includes(catId)) {
        // If already selected -> Remove
        return { ...prev, categoryIds: currentIds.filter(id => id !== catId) };
      } else {
        // If not selected -> Add
        return { ...prev, categoryIds: [...currentIds, catId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        restaurantId: parseInt(formData.restaurantId),
        categoryIds: formData.categoryIds, 
      };

      if (editingFood) {
        // CALL EDIT API (PUT)
        await api.put(`api/food/${editingFood.id}`, payload);
      } else {
        // CALL ADD API (POST)
        await api.post('api/food', payload);
      }
      onRefresh(); 
      onClose();
    } catch (error) {
      alert("Lỗi lưu dữ liệu: " + (error.response?.data?.message || error.message));
    } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.2s; }
        .modal-container { background: #fff; width: 900px; max-height: 90vh; border-radius: 20px; display: flex; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        
        /* LEFT: IMAGE PREVIEW */
        .modal-left { width: 40%; background: #f9fafb; padding: 30px; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .preview-box { width: 100%; aspect-ratio: 4/3; border: 2px dashed #d1d5db; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; background: white; position: relative; }
        .preview-box.has-img { border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .preview-img { width: 100%; height: 100%; object-fit: cover; transition: 0.3s; }
        .empty-state { text-align: center; color: #9ca3af; }
        .empty-icon { margin-bottom: 10px; color: #d1d5db; }

        /* RIGHT: FORM */
        .modal-right { width: 60%; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .modal-title { font-size: 22px; font-weight: 800; color: #111827; margin: 0; }
        .btn-close { background: transparent; border: none; color: #9ca3af; cursor: pointer; transition: 0.2s; padding: 5px; border-radius: 50%; }
        .btn-close:hover { background: #f3f4f6; color: #ef4444; }

        /* FORM ELEMENTS */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { margin-bottom: 20px; }
        .full-width { grid-column: 1 / -1; }
        .form-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; text-transform: uppercase; }
        .form-input, .form-select, .form-textarea { width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; outline: none; font-size: 14px; transition: 0.2s; background: #fff; box-sizing: border-box; }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
        .form-textarea { resize: vertical; min-height: 100px; }

        /* CATEGORY GRID STYLE */
        .category-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            border: 1px solid #e5e7eb;
            padding: 15px;
            border-radius: 10px;
            max-height: 150px;
            overflow-y: auto;
        }
        .cat-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: 0.2s;
            border: 1px solid transparent;
        }
        .cat-checkbox:hover { background: #f3f4f6; }
        .cat-checkbox.selected { background: #eff6ff; color: #2563eb; font-weight: 600; border-color: #bfdbfe; }

        /* FOOTER */
        .modal-actions { margin-top: auto; padding-top: 20px; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 12px; }
        .btn { padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-size: 14px; }
        .btn-cancel { background: white; border: 1px solid #e5e7eb; color: #64748b; }
        .btn-cancel:hover { background: #f9fafb; border-color: #d1d5db; }
        .btn-submit { background: #ef4444; color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
        .btn-submit:hover { background: #dc2626; transform: translateY(-2px); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="modal-container">
        {/* LEFT COLUMN: IMAGE PREVIEW */}
        <div className="modal-left">
          <div className={`preview-box ${previewImage ? 'has-img' : ''}`}>
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Xem trước ảnh" 
                className="preview-img" 
                onError={(e) => { e.target.src="https://placehold.co/400x300?text=Lỗi+Ảnh"; }} 
              />
            ) : (
              <div className="empty-state">
                <ImageIcon size={64} className="empty-icon" strokeWidth={1} />
                <p style={{fontSize: 14, fontWeight: 600}}>Chưa có ảnh</p>
                <p style={{fontSize: 12}}>Dán link ảnh để xem trước</p>
              </div>
            )}
          </div>
          <div style={{marginTop: 20, textAlign: 'center', color: '#6b7280', fontSize: 13}}>
            <p>Mẹo: Sử dụng ảnh tỉ lệ 4:3 hoặc 16:9</p>
            <p>để hiển thị đẹp nhất.</p>
          </div>
        </div>

        {/* RIGHT COLUMN: FORM */}
        <div className="modal-right">
          <div className="modal-header">
            <h3 className="modal-title">{editingFood ? 'Chỉnh sửa món ăn' : 'Thêm món mới'}</h3>
            <button onClick={onClose} className="btn-close"><X size={24}/></button>
          </div>

          <form id="foodForm" onSubmit={handleSubmit} className="form-grid">
            {/* Name */}
            <div className="form-group full-width">
              <label className="form-label"><Utensils size={14}/> Tên món ăn <span style={{color:'red'}}>*</span></label>
              <input 
                name="name" 
                className="form-input" 
                placeholder="VD: Phở bò đặc biệt..." 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Image Link */}
            <div className="form-group full-width">
              <label className="form-label"><LinkIcon size={14}/> Đường dẫn ảnh (URL)</label>
              <div style={{position: 'relative'}}>
                <input 
                  name="image" 
                  className="form-input" 
                  placeholder="https://example.com/mon-an.jpg" 
                  value={formData.image} 
                  onChange={handleChange} 
                />
                <UploadCloud size={18} style={{position:'absolute', right:12, top:12, color:'#9ca3af'}}/>
              </div>
            </div>

            {/* Restaurant */}
            <div className="form-group">
              <label className="form-label"><Store size={14}/> Nhà hàng <span style={{color:'red'}}>*</span></label>
              <select name="restaurantId" className="form-select" value={formData.restaurantId} onChange={handleChange} required>
                <option value="">-- Chọn nhà hàng --</option>
                {restaurants.map(res => <option key={res.id} value={res.id}>{res.name}</option>)}
              </select>
            </div>

            {/* Price */}
            <div className="form-group">
              <label className="form-label"><DollarSign size={14}/> Giá (VNĐ) <span style={{color:'red'}}>*</span></label>
              <input 
                type="number" 
                name="price" 
                className="form-input" 
                placeholder="Nhập giá (VD: 50000)" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                min="0"
              />
            </div>

            {/* Categories (Multi-Select) */}
            <div className="form-group full-width">
              <label className="form-label"><Layers size={14}/> Danh mục (Chọn nhiều) <span style={{color:'red'}}>*</span></label>
              <div className="category-grid">
                {categories.map(cat => {
                    const isSelected = formData.categoryIds.includes(cat.id);
                    return (
                        <div 
                            key={cat.id} 
                            className={`cat-checkbox ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleCategory(cat.id)}
                        >
                            {isSelected ? <CheckSquare size={16} color="#2563eb"/> : <Square size={16} color="#9ca3af"/>}
                            {cat.name}
                        </div>
                    )
                })}
              </div>
              <div style={{fontSize: 11, color: '#6b7280', marginTop: 5}}>
                  Đã chọn: {formData.categoryIds.length} danh mục
              </div>
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label className="form-label"><AlignLeft size={14}/> Mô tả</label>
              <textarea 
                name="description" 
                className="form-textarea" 
                placeholder="Thành phần, hương vị, nguồn gốc..." 
                value={formData.description} 
                onChange={handleChange}
              ></textarea>
            </div>
          </form>

          {/* ACTIONS */}
          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>Hủy</button>
            <button type="submit" form="foodForm" className="btn btn-submit" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
              {editingFood ? 'Lưu thay đổi' : 'Tạo món mới'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFoodModal;
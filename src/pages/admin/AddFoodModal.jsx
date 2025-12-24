import React, { useState, useEffect } from 'react';
import { 
  X, Save, Link as LinkIcon, Utensils, DollarSign, 
  AlignLeft, Store, Layers, Loader, Image as ImageIcon
} from 'lucide-react';
import api from '../../api/axios';

const AddFoodModal = ({ isOpen, onClose, onRefresh, editingFood }) => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    restaurantId: '',
    categoryId: '',
    image: '' // Changed to store URL string
  });
  
  // Data for Dropdowns
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);

  // --- EFFECT ---
  // 1. Load Restaurants & Categories when Modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [resRes, catRes] = await Promise.all([
            api.get('/restaurants'),
            api.get('/categories')
          ]);
          setRestaurants(resRes.data);
          setCategories(catRes.data);
        } catch (error) {
          console.error("Error loading dropdown data:", error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // 2. Fill data if in Edit Mode
  useEffect(() => {
    if (editingFood) {
      setFormData({
        name: editingFood.name,
        price: editingFood.price,
        description: editingFood.description || '',
        restaurantId: editingFood.restaurantId || '',
        categoryId: editingFood.categoryId || '',
        image: editingFood.image || '' // Fill image URL
      });
    } else {
      // Reset form for Add Mode
      setFormData({ name: '', price: '', description: '', restaurantId: '', categoryId: '', image: '' });
    }
  }, [editingFood, isOpen]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send JSON data directly
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price), // Ensure price is a number
        description: formData.description,
        restaurantId: parseInt(formData.restaurantId), // Ensure ID is a number
        categoryId: parseInt(formData.categoryId),     // Ensure ID is a number
        image: formData.image // Send the URL string
      };

      if (editingFood) {
        // Update (PUT)
        await api.put(`/foods/${editingFood.id}`, payload);
        alert("Food updated successfully!");
      } else {
        // Add New (POST)
        await api.post('/foods', payload);
        alert("Food added successfully!");
      }

      onRefresh(); // Refresh parent list
      onClose();   // Close modal

    } catch (error) {
      console.error("Error saving food:", error);
      alert("An error occurred, please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-container { background: #fff; width: 100%; max-width: 600px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; animation: slideIn 0.3s ease; }
        .modal-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: #f9fafb; }
        .modal-title { font-size: 20px; font-weight: 800; color: #111827; }
        .btn-close { background: none; border: none; cursor: pointer; color: #6b7280; transition: 0.2s; padding: 4px; border-radius: 50%; }
        .btn-close:hover { background: #fee2e2; color: #ef4444; }
        
        .modal-body { padding: 24px; max-height: 80vh; overflow-y: auto; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .form-input, .form-select, .form-textarea { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; transition: 0.2s; font-family: inherit; }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #ef4444; ring: 2px solid #fee2e2; }
        
        /* Image Preview Styling */
        .image-preview-box { border: 2px dashed #d1d5db; border-radius: 12px; height: 180px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #f9fafb; margin-top: 10px; position: relative; }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }
        .no-image-placeholder { color: #9ca3af; font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 8px; }

        .modal-footer { padding: 20px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; background: #f9fafb; }
        .btn-cancel { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: 1px solid #d1d5db; background: #fff; color: #374151; }
        .btn-save { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; background: #ef4444; color: #fff; display: flex; align-items: center; gap: 8px; }
        .btn-save:hover { background: #dc2626; }
        .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            {editingFood ? 'Update Food Item' : 'Add New Food'}
          </h3>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form id="foodForm" onSubmit={handleSubmit}>
            
            {/* 1. Image URL Input */}
            <div className="form-group">
              <label className="form-label"><LinkIcon size={16}/> Image URL</label>
              <input 
                type="text" 
                name="image" 
                className="form-input" 
                placeholder="https://example.com/food-image.jpg" 
                value={formData.image} 
                onChange={handleChange} 
              />
              
              {/* Image Preview Area */}
              <div className="image-preview-box">
                {formData.image ? (
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="preview-img" 
                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/400x200?text=Invalid+Image+URL"; }}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <ImageIcon size={40} />
                    <span>Enter a URL to preview image</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Name & Price (2 columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label"><Utensils size={16}/> Name</label>
                <input 
                  type="text" name="name" className="form-input" 
                  placeholder="e.g. Beef Noodle Soup" 
                  value={formData.name} onChange={handleChange} required 
                />
              </div>
              <div className="form-group">
                <label className="form-label"><DollarSign size={16}/> Price (VND)</label>
                <input 
                  type="number" name="price" className="form-input" 
                  placeholder="e.g. 50000" 
                  value={formData.price} onChange={handleChange} required 
                />
              </div>
            </div>

            {/* 3. Restaurant & Category (2 columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label"><Store size={16}/> Restaurant</label>
                <select 
                  name="restaurantId" className="form-select" 
                  value={formData.restaurantId} onChange={handleChange} required
                >
                  <option value="">-- Select Restaurant --</option>
                  {restaurants.map(res => (
                    <option key={res.id} value={res.id}>{res.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label"><Layers size={16}/> Category</label>
                <select 
                  name="categoryId" className="form-select" 
                  value={formData.categoryId} onChange={handleChange} required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Description */}
            <div className="form-group">
              <label className="form-label"><AlignLeft size={16}/> Description</label>
              <textarea 
                name="description" className="form-textarea" rows="4"
                placeholder="Ingredients, taste, etc..." 
                value={formData.description} onChange={handleChange}
              ></textarea>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" form="foodForm" className="btn-save" disabled={isLoading}>
            {isLoading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            {editingFood ? 'Save Changes' : 'Add Food'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFoodModal;
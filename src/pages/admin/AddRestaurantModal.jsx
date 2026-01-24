import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Save, Loader, MapPin, UploadCloud } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

const LocationMarker = ({ position, setPosition, setAddress }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lon}`)
        .then(res => res.json())
        .then(data => {
            if(data && data.display_name) {
                const addr = data.display_name.split(',').slice(0, 5).join(',');
                setAddress(addr);
            }
        })
        .catch(err => console.error("Lỗi lấy địa chỉ:", err));
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

const AddRestaurantModal = ({ isOpen, onClose, onRefresh, editingData }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [position, setPosition] = useState({ lat: 10.762622, lng: 106.660172 }); 

  const [formData, setFormData] = useState({
    name: '', address: '', description: '', image: '', categoryId: '', latitude: '', longitude: ''
  });

  useEffect(() => {
    if (isOpen) {
      api.get('api/categories').then(res => setCategories(res.data)).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingData) {
      setFormData({
        name: editingData.name || '',
        address: editingData.address || '',
        description: editingData.description || '',
        image: editingData.image || '',
        categoryId: editingData.categoryId || '',
        latitude: editingData.latitude || '',
        longitude: editingData.longitude || ''
      });
      setPreviewImage(editingData.image);
      
      if (editingData.latitude && editingData.longitude) {
          setPosition({ lat: parseFloat(editingData.latitude), lng: parseFloat(editingData.longitude) });
      }
    } else {
      setFormData({ name: '', address: '', description: '', image: '', categoryId: '', latitude: '', longitude: '' });
      setPreviewImage(null);
      setPosition({ lat: 10.762622, lng: 106.660172 });
    }
  }, [editingData, isOpen]);

  useEffect(() => {
      if (position) {
          setFormData(prev => ({
              ...prev,
              latitude: position.lat,
              longitude: position.lng
          }));
      }
  }, [position]);

  const handleAddressUpdate = (newAddr) => {
      setFormData(prev => ({ ...prev, address: newAddr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
      };

      if (editingData) {
        await api.put(`/api/restaurants/${editingData.id}`, payload);
        alert("Cập nhật thành công!");
      } else {
        await api.post('/api/restaurants', payload);
        alert("Thêm mới thành công!");
      }
      onRefresh(); 
      onClose();   
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-content { background: #fff; width: 950px; max-height: 90vh; border-radius: 20px; display: flex; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        
        .modal-left { width: 45%; background: #f9fafb; padding: 30px; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 20px; }
        
        /* ẨN SCROLLBAR CHO MODAL-RIGHT */
        .modal-right { 
            width: 55%; 
            padding: 30px; 
            overflow-y: auto; 
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE/Edge */
        }
        .modal-right::-webkit-scrollbar { 
            display: none; /* Chrome/Safari */
        }

        .modal-title { font-size: 22px; font-weight: 800; color: #111827; margin: 0; }
        .form-group { margin-bottom: 20px; position: relative; }
        .form-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; }
        .form-input { width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; outline: none; font-size: 14px; background: #fff; }
        .form-input:focus { border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
        
        .img-preview-box { width: 100%; height: 180px; border: 2px dashed #d1d5db; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #9ca3af; overflow: hidden; background: white; }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }

        .map-box { height: 300px; width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; position: relative; z-index: 1; }
        .map-instruct { position: absolute; bottom: 10px; left: 10px; z-index: 1000; background: rgba(255,255,255,0.9); padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }

        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px; }
        .btn { padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; }
        .btn-cancel { background: white; border: 1px solid #e5e7eb; color: #4b5563; }
        .btn-submit { background: #ef4444; color: white; }
        
        .leaflet-container { width: 100%; height: 100%; }
      `}</style>

      <div className="modal-content">
        <div className="modal-left">
            {/* ... content left ... */}
            <div>
                <label className="form-label">Hình ảnh minh họa</label>
                <div className="img-preview-box">
                    {previewImage ? <img src={previewImage} className="preview-img" alt="Preview" onError={(e)=>{e.target.style.display='none'}}/> : <UploadCloud size={32} />}
                </div>
            </div>

            <div style={{flex: 1, display:'flex', flexDirection:'column'}}>
                <label className="form-label">Vị trí bản đồ <span style={{fontSize:10, fontWeight:400, color:'#ef4444'}}>(Click để chọn)</span></label>
                <div className="map-box">
                    <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                        <LocationMarker position={position} setPosition={setPosition} setAddress={handleAddressUpdate} />
                    </MapContainer>
                    <div className="map-instruct">📍 Click chuột để ghim vị trí quán</div>
                </div>
                <div style={{fontSize:11, color:'#6b7280', marginTop:5, fontFamily:'monospace'}}>
                    Lat: {position?.lat.toFixed(6)} | Lng: {position?.lng.toFixed(6)}
                </div>
            </div>
        </div>

        <div className="modal-right">
            {/* ... content right ... */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
                <h3 className="modal-title">{editingData ? 'Chỉnh sửa thông tin' : 'Thêm nhà hàng mới'}</h3>
                <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer'}}><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Tên nhà hàng <span style={{color:'red'}}>*</span></label>
                    <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>

                <div className="form-group">
                    <label className="form-label">Danh mục <span style={{color:'red'}}>*</span></label>
                    <select className="form-input" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Địa chỉ (Tự động)</label>
                    <div style={{position:'relative'}}>
                        <input className="form-input" style={{paddingRight:35}} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                        <MapPin size={18} color="#ef4444" style={{position:'absolute', right:10, top:12}}/>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Link Ảnh (URL)</label>
                    <input className="form-input" value={formData.image} onChange={e => {setFormData({...formData, image: e.target.value}); setPreviewImage(e.target.value);}} />
                </div>

                <div className="form-group">
                    <label className="form-label">Mô tả chi tiết</label>
                    <textarea className="form-input" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} ></textarea>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn btn-cancel" onClick={onClose}>Đóng</button>
                    <button type="submit" className="btn btn-submit" disabled={loading}>
                        {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} Lưu lại
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurantModal;
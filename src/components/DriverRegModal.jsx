import React, { useState } from 'react';
import api from '../api/axios'; // Đảm bảo đường dẫn đúng
import toast from 'react-hot-toast'; 
import { 
  User, Truck, CreditCard, UploadCloud, 
  CheckCircle, Loader, X, Camera 
} from 'lucide-react';

const DriverRegModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    idCardNumber: '',
    vehicleType: 'MOTORBIKE',
    licensePlate: '',
  });

  const [files, setFiles] = useState({
    idCardFront: null,
    idCardBack: null,
  });

  const [previews, setPreviews] = useState({
    idCardFront: null,
    idCardBack: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chỉ chọn file hình ảnh!");
        return;
      }
      setFiles({ ...files, [fieldName]: file });
      setPreviews({ ...previews, [fieldName]: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.idCardNumber || !files.idCardFront) {
        toast.error("Vui lòng điền đủ thông tin và tải ảnh CCCD mặt trước!");
        return;
    }

    const loadId = toast.loading("Đang gửi hồ sơ đăng ký...");

    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      Object.keys(files).forEach(key => {
        if (files[key]) data.append(key, files[key]);
      });

      // API Call
      await api.post('/api/driver/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Gửi hồ sơ thành công!", { id: loadId });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data || "Đăng ký thất bại. Vui lòng thử lại!", { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  // Nếu modal chưa mở thì không render gì cả
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex; justify-content: center; align-items: center;
          padding: 20px;
          animation: fadeIn 0.2s;
        }
        .modal-content {
          background: #1f2937;
          width: 100%; max-width: 600px;
          max-height: 90vh; /* Giới hạn chiều cao */
          overflow-y: auto; /* Cho phép cuộn nếu form dài */
          border-radius: 20px;
          padding: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
          color: #f3f4f6;
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* Custom Scrollbar cho Modal */
        .modal-content::-webkit-scrollbar { width: 6px; }
        .modal-content::-webkit-scrollbar-track { background: #111827; }
        .modal-content::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }

        .modal-header { margin-bottom: 25px; text-align: center; }
        .modal-header h2 { font-size: 24px; color: #fff; margin: 0 0 5px 0; }
        .modal-header p { font-size: 14px; color: #9ca3af; margin: 0; }

        .modal-close {
          position: absolute; top: 20px; right: 20px;
          background: rgba(255,255,255,0.05); border: none; 
          color: #9ca3af; cursor: pointer; padding: 8px; border-radius: 50%;
          transition: 0.2s;
        }
        .modal-close:hover { background: #ef4444; color: #fff; }

        /* Form Styles */
        .section-label { font-size: 14px; font-weight: 700; color: #ff4757; margin: 20px 0 10px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
        
        .form-group { margin-bottom: 15px; }
        .form-label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #d1d5db; }
        .inp { width: 100%; padding: 10px 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 14px; outline: none; transition: 0.2s; }
        .inp:focus { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }

        .upload-row { display: flex; gap: 15px; }
        .upload-box { flex: 1; border: 2px dashed rgba(255,255,255,0.15); border-radius: 12px; height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; position: relative; overflow: hidden; background: rgba(0,0,0,0.2); }
        .upload-box:hover { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }
        .upload-text { font-size: 12px; color: #9ca3af; margin-top: 5px; }

        .btn-submit { width: 100%; padding: 14px; background: #10b981; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 20px; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-submit:hover { background: #059669; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .icon-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Nút đóng */}
        <button className="modal-close" onClick={onClose}><X size={20} /></button>

        {success ? (
          <div style={{textAlign: 'center', padding: '40px 20px'}}>
            <CheckCircle size={80} color="#10b981" style={{margin: '0 auto 20px'}}/>
            <h2 style={{fontSize: '24px', marginBottom: '10px'}}>Đăng Ký Thành Công!</h2>
            <p style={{color: '#9ca3af', marginBottom: '30px', lineHeight: '1.6'}}>
              Hồ sơ của bạn đã được gửi đi. Đội ngũ FoodNest sẽ liên hệ xác minh trong vòng 24h làm việc.
            </p>
            <button className="btn-submit" onClick={onClose} style={{background: '#374151'}}>
              Đóng và tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Đăng Ký Tài Xế</h2>
              <p>Thu nhập hấp dẫn, tự do thời gian cùng FoodNest</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* --- Thông tin cá nhân --- */}
              <div className="section-label"><User size={16}/> Cá Nhân</div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input className="inp" name="fullName" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <input className="inp" name="phone" placeholder="09xxxxxxxxx" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Số CCCD / CMND *</label>
                <input className="inp" name="idCardNumber" value={formData.idCardNumber} onChange={handleChange} required />
              </div>

              {/* --- Phương tiện --- */}
              <div className="section-label"><Truck size={16}/> Phương Tiện</div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Loại xe</label>
                  <select className="inp" name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
                      <option value="MOTORBIKE">Xe Máy</option>
                      <option value="CAR">Ô tô</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Biển số xe *</label>
                  <input className="inp" name="licensePlate" placeholder="29A-123.45" value={formData.licensePlate} onChange={handleChange} required />
                </div>
              </div>

              {/* --- Hình ảnh --- */}
              <div className="section-label"><CreditCard size={16}/> Hình Ảnh Xác Thực</div>
              <div className="upload-row">
                <label className="upload-box">
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'idCardFront')} />
                    {previews.idCardFront ? (
                        <img src={previews.idCardFront} className="preview-img" alt="Front" />
                    ) : (
                        <>
                          <Camera size={24} color="#6b7280"/>
                          <span className="upload-text">Mặt trước CCCD</span>
                        </>
                    )}
                </label>
                
                <label className="upload-box">
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'idCardBack')} />
                    {previews.idCardBack ? (
                        <img src={previews.idCardBack} className="preview-img" alt="Back" />
                    ) : (
                        <>
                          <Camera size={24} color="#6b7280"/>
                          <span className="upload-text">Mặt sau CCCD</span>
                        </>
                    )}
                </label>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? <Loader className="icon-spin" size={20}/> : "Gửi Đăng Ký"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DriverRegModal;
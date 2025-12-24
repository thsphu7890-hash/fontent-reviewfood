import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api/axios'; // Đảm bảo bạn đã cấu hình axios instance
import { 
  User, Mail, Phone, MapPin, Camera, 
  Save, Edit, LogOut, Calendar, Shield, Loader2, X 
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State quản lý User & Loading
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [loading, setLoading] = useState(false); // Loading khi update info
  const [uploading, setUploading] = useState(false); // Loading khi upload ảnh
  const [isEditing, setIsEditing] = useState(false); // Toggle chế độ sửa

  // State Form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    email: '' // Email thường không cho sửa, chỉ hiển thị
  });

  // Load dữ liệu vào Form khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        email: user.email || ""
      });
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  // --- 1. XỬ LÝ UPLOAD AVATAR ---
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) return alert("Vui lòng chọn file ảnh!");
    if (file.size > 2 * 1024 * 1024) return alert("Ảnh không được quá 2MB!");

    setUploading(true);
    try {
      // Gọi API Upload (Endpoint dựa trên Controller đã viết trước đó)
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await api.post(`/users/${user.id}/avatar`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Cập nhật State & LocalStorage
      const newAvatarUrl = res.data.avatar; // API trả về { avatar: "url...", message: "..." }
      const updatedUser = { ...user, avatar: newAvatarUrl };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      console.error("Lỗi upload:", error);
      alert("Lỗi khi upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  // --- 2. XỬ LÝ CẬP NHẬT THÔNG TIN ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Giả sử API update info là PUT /users/{id}
      // Lưu ý: Backend cần có endpoint này để nhận fullName, phone, address
      const res = await api.put(`/users/${user.id}`, {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address
      });

      // Merge dữ liệu cũ với dữ liệu mới trả về
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error(error);
      alert("Cập nhật thất bại: " + (error.response?.data?.message || "Lỗi hệ thống"));
    } finally {
      setLoading(false);
    }
  };

  // --- 3. XỬ LÝ ĐĂNG XUẤT ---
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Nếu có lưu token riêng
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="profile-wrapper">
        {/* CSS IN-JS */}
        <style>{`
          .profile-wrapper {
            background-color: #f8f9fa;
            min-height: calc(100vh - 80px); /* Trừ header */
            padding: 40px 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .profile-container {
            max-width: 1000px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 30px;
          }
          
          /* Sidebar Card */
          .profile-card {
            background: white;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            height: fit-content;
          }
          
          /* Avatar Styling */
          .avatar-box {
            width: 140px; height: 140px;
            margin: 0 auto 20px;
            position: relative;
            border-radius: 50%;
            border: 4px solid #fff;
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2); /* Red shadow */
          }
          .avatar-img {
            width: 100%; height: 100%;
            object-fit: cover;
            border-radius: 50%;
          }
          .avatar-placeholder {
            width: 100%; height: 100%;
            background: linear-gradient(135deg, #ef4444, #f87171);
            color: white;
            font-size: 48px;
            font-weight: bold;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%;
          }
          .btn-avatar-edit {
            position: absolute; bottom: 5px; right: 5px;
            background: white; border: none;
            width: 36px; height: 36px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            color: #ef4444;
            transition: 0.2s;
          }
          .btn-avatar-edit:hover { transform: scale(1.1); background: #fef2f2; }
          .upload-overlay {
            position: absolute; inset: 0; background: rgba(255,255,255,0.7);
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: #ef4444;
          }

          /* Info Main */
          .info-card {
            background: white;
            border-radius: 16px;
            padding: 30px 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          }
          .section-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;
          }
          .section-title { font-size: 24px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px; }
          
          /* Form Grid */
          .form-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 25px;
          }
          .form-group { display: flex; flex-direction: column; gap: 8px; }
          .form-group.full-width { grid-column: span 2; }
          
          .label { font-size: 14px; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 8px; }
          .input-field {
            padding: 12px 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            transition: 0.2s;
            outline: none;
            background: #f8fafc;
            color: #334155;
          }
          .input-field:focus { border-color: #ef4444; background: white; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
          .input-field:disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }

          /* View Mode Value */
          .value-display {
            font-size: 18px; font-weight: 500; color: #334155;
            padding: 12px 0; border-bottom: 1px solid #f1f5f9;
          }

          /* Buttons */
          .btn {
            padding: 10px 20px; border-radius: 8px; font-weight: 600;
            cursor: pointer; display: flex; align-items: center; gap: 8px;
            transition: 0.2s; border: none;
          }
          .btn-primary { background: #ef4444; color: white; }
          .btn-primary:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
          .btn-outline { background: white; border: 1px solid #e2e8f0; color: #64748b; }
          .btn-outline:hover { background: #f8fafc; color: #334155; border-color: #cbd5e1; }
          
          .role-badge {
            display: inline-block; padding: 6px 16px;
            background: #fee2e2; color: #ef4444;
            border-radius: 20px; font-size: 13px; font-weight: 700;
            margin-bottom: 10px; text-transform: uppercase;
          }
          .join-date { color: #94a3b8; font-size: 14px; margin-top: 5px; display: flex; align-items: center; justify-content: center; gap: 6px;}

          .btn-logout {
            margin-top: 20px; width: 100%;
            background: #fff1f2; color: #e11d48;
            border: 1px solid #ffe4e6;
            justify-content: center;
          }
          .btn-logout:hover { background: #ffe4e6; }

          @media (max-width: 768px) {
            .profile-container { grid-template-columns: 1fr; }
            .form-grid { grid-template-columns: 1fr; }
            .form-group.full-width { grid-column: span 1; }
          }
        `}</style>

        <div className="profile-container">
          {/* CỘT TRÁI: AVATAR & INFO CƠ BẢN */}
          <aside>
            <div className="profile-card">
              <div className="avatar-box">
                {uploading && (
                  <div className="upload-overlay">
                    <Loader2 className="animate-spin" size={32} />
                  </div>
                )}
                
                {user.avatar ? (
                  <img src={user.avatar} className="avatar-img" alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                
                <button className="btn-avatar-edit" onClick={handleAvatarClick} title="Thay đổi ảnh">
                  <Camera size={18}/>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{display: 'none'}} 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>

              <div className="role-badge">
                {user.role === "ROLE_ADMIN" ? "Quản trị viên" : "Khách hàng thân thiết"}
              </div>
              
              <h3 style={{margin: '0 0 5px 0', fontSize: '22px', color: '#1e293b'}}>
                {user.fullName}
              </h3>
              
              <p style={{color: '#64748b', margin: 0}}>{user.email}</p>

              <div className="join-date">
                <Calendar size={14} /> 
                Tham gia: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </div>

              <button className="btn btn-logout" onClick={handleLogout}>
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          </aside>

          {/* CỘT PHẢI: CHI TIẾT & FORM */}
          <main>
            <div className="info-card">
              <div className="section-header">
                <div className="section-title">
                  <Shield size={24} className="text-red-500" style={{color: '#ef4444'}}/>
                  Thông tin cá nhân
                </div>
                {!isEditing ? (
                  <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                    <Edit size={18} /> Chỉnh sửa
                  </button>
                ) : (
                  <button className="btn btn-outline" onClick={() => setIsEditing(false)}>
                    <X size={18} /> Hủy bỏ
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className="form-grid">
                  {/* Họ và tên */}
                  <div className="form-group full-width">
                    <label className="label"><User size={16}/> Họ và tên</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="fullName"
                        className="input-field" 
                        value={formData.fullName} 
                        onChange={handleInputChange}
                        required
                      />
                    ) : (
                      <div className="value-display">{user.fullName}</div>
                    )}
                  </div>

                  {/* Email (Read only) */}
                  <div className="form-group">
                    <label className="label"><Mail size={16}/> Email</label>
                    <input 
                      type="email" 
                      className="input-field" 
                      value={formData.email} 
                      disabled 
                      title="Không thể thay đổi email"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className="form-group">
                    <label className="label"><Phone size={16}/> Số điện thoại</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="phone"
                        className="input-field" 
                        value={formData.phone} 
                        onChange={handleInputChange}
                        placeholder="Thêm số điện thoại..."
                      />
                    ) : (
                      <div className="value-display" style={{color: user.phone ? '#334155' : '#94a3b8'}}>
                        {user.phone || "Chưa cập nhật"}
                      </div>
                    )}
                  </div>

                  {/* Địa chỉ */}
                  <div className="form-group full-width">
                    <label className="label"><MapPin size={16}/> Địa chỉ nhận hàng</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="address"
                        className="input-field" 
                        value={formData.address} 
                        onChange={handleInputChange}
                        placeholder="Thêm địa chỉ giao hàng mặc định..."
                      />
                    ) : (
                      <div className="value-display" style={{color: user.address ? '#334155' : '#94a3b8'}}>
                        {user.address || "Chưa cập nhật"}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div style={{marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px'}}>
                    <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Profile;
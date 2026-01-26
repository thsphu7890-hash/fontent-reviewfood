import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header'; // Đảm bảo đường dẫn đúng
import api from '../api/axios'; 
import { 
  User, Mail, Phone, MapPin, Camera, 
  Save, Edit3, LogOut, Shield, Loader2, X, ShoppingBag, Key, 
  ChevronRight, Package, Clock, CheckCircle, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // --- STATE ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'orders', 'security'
  const [isEditing, setIsEditing] = useState(false);

  // State cho Form thông tin
  const [formData, setFormData] = useState({
    fullName: '', phone: '', address: '', email: '' 
  });

  // State cho Đơn hàng
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // State cho Đổi mật khẩu
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.username || "", 
        phone: user.phone || "",
        address: user.address || "",
        email: user.email || ""
      });
      fetchOrders(); // Gọi API lấy đơn hàng
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  // --- API: LẤY ĐƠN HÀNG ---
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('api/orders/my-orders');
      setOrders(res.data);
    } catch (error) {
      console.log("Chưa có API đơn hàng, dùng dữ liệu mẫu.");
      // Dữ liệu mẫu để giao diện đẹp
      setOrders([
        { id: 1023, date: '2023-10-25', total: 150000, status: 'COMPLETED', items: 'Gà rán, Pepsi' },
        { id: 1024, date: '2023-10-28', total: 85000, status: 'PENDING', items: 'Cơm tấm sườn bì' },
      ]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // --- HANDLER: UPLOAD AVATAR ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return toast.error("Vui lòng chọn file ảnh!");
    if (file.size > 2 * 1024 * 1024) return toast.error("Ảnh không được quá 2MB!");

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      // API Upload
      const res = await api.post(`api/users/${user.id}/avatar`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newAvatarUrl = res.data.avatar || res.data; // Tùy backend trả về
      const updatedUser = { ...user, avatar: newAvatarUrl };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success("Đã cập nhật ảnh đại diện!");
    } catch (error) {
      toast.error("Lỗi upload ảnh, vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  // --- HANDLER: CẬP NHẬT THÔNG TIN ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`api/users/${user.id}`, {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address
      });

      const updatedUser = { ...user, ...formData }; 
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      toast.error("Cập nhật thất bại: " + (error.response?.data?.message || "Lỗi hệ thống"));
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: ĐỔI MẬT KHẨU ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp!");
    }
    if (passData.newPassword.length < 6) {
      return toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
    }

    setLoading(true);
    try {
      await api.put(`api/users/change-password`, {
        oldPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      toast.success("Đổi mật khẩu thành công!");
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Mật khẩu cũ không đúng!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.clear();
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="profile-page">
        {/* CSS IN-JS */}
        <style>{`
          .profile-page { background-color: #f3f4f6; min-height: calc(100vh - 80px); padding: 40px 20px; font-family: 'Inter', sans-serif; }
          .profile-layout { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 320px 1fr; gap: 30px; }
          
          /* Cards */
          .card { background: white; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid white; overflow: hidden; }
          
          /* Sidebar */
          .sidebar-header { background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); padding: 40px 20px 30px; text-align: center; color: white; }
          .avatar-wrapper { width: 110px; height: 110px; margin: 0 auto 15px; position: relative; }
          .avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 8px 16px rgba(0,0,0,0.1); background: white; }
          .avatar-placeholder { width: 100%; height: 100%; background: #fff; color: #ff4757; font-size: 40px; font-weight: 800; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); }
          
          .btn-camera { position: absolute; bottom: 0; right: 0; background: #1f2937; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; cursor: pointer; transition: 0.2s; }
          .btn-camera:hover { transform: scale(1.1); background: #000; }

          .user-name { font-size: 18px; font-weight: 700; margin: 0 0 4px; }
          .user-email { font-size: 13px; opacity: 0.9; margin-bottom: 10px; }
          .role-badge { display: inline-block; padding: 4px 12px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }

          .menu-list { padding: 20px; }
          .menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 5px; color: #64748b; font-weight: 600; font-size: 14px; border-radius: 12px; cursor: pointer; transition: 0.2s; }
          .menu-item:hover { background: #f8fafc; color: #1e293b; }
          .menu-item.active { background: #fff1f2; color: #ff4757; }
          .menu-item.logout { color: #ef4444; margin-top: 20px; border-top: 1px solid #f1f5f9; border-radius: 0; padding-top: 20px; }
          .menu-item.logout:hover { background: #fef2f2; }

          /* Main Content */
          .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
          .content-title { font-size: 20px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 10px; }
          
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .full-width { grid-column: span 2; }
          
          .input-group label { display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 8px; }
          .input-box { width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; color: #1e293b; outline: none; transition: 0.2s; background: #f8fafc; }
          .input-box:focus { border-color: #ff4757; background: white; box-shadow: 0 0 0 4px rgba(255, 71, 87, 0.1); }
          .input-box:disabled { background: #f1f5f9; cursor: not-allowed; }
          
          .btn { padding: 10px 20px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; border: none; transition: 0.2s; }
          .btn-primary { background: #ff4757; color: white; box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3); }
          .btn-primary:hover { background: #e8414e; transform: translateY(-1px); }
          .btn-ghost { background: transparent; color: #64748b; border: 1px solid #e2e8f0; }
          .btn-ghost:hover { background: #f8fafc; color: #1e293b; }

          /* Order Item */
          .order-item { border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
          .order-item:hover { border-color: #ff4757; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
          .status-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
          .status-completed { background: #dcfce7; color: #166534; }
          .status-pending { background: #fff7ed; color: #c2410c; }
          
          .password-wrapper { position: relative; }
          .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; }

          @media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
        `}</style>

        <div className="profile-layout">
          {/* --- SIDEBAR --- */}
          <aside className="card">
            <div className="sidebar-header">
              <div className="avatar-wrapper">
                {uploading && (
                  <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', zIndex:10}}>
                    <Loader2 className="animate-spin text-white" size={24}/>
                  </div>
                )}
                {user.avatar ? (
                  <img src={user.avatar} className="avatar-img" alt="User" />
                ) : (
                  <div className="avatar-placeholder">
                    {(user.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <button className="btn-camera" onClick={() => fileInputRef.current.click()}>
                  <Camera size={16}/>
                </button>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
              </div>

              <h3 className="user-name">{user.fullName || user.username}</h3>
              <p className="user-email">{user.email}</p>
              <div className="role-badge">{user.role === "ADMIN" ? "Quản trị viên" : "Thành viên thân thiết"}</div>
            </div>

            <div className="menu-list">
              <div className={`menu-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                <User size={18}/> Thông tin cá nhân
              </div>
              <div className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                <ShoppingBag size={18}/> Đơn hàng của tôi
              </div>
              <div className={`menu-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                <Shield size={18}/> Đổi mật khẩu
              </div>
              <div className="menu-item logout" onClick={handleLogout}>
                <LogOut size={18}/> Đăng xuất
              </div>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <main className="card" style={{padding: '30px 40px'}}>
            
            {/* 1. TAB INFO */}
            {activeTab === 'info' && (
              <>
                <div className="content-header">
                  <div className="content-title"><User size={24} className="text-rose-500"/> Hồ sơ của tôi</div>
                  <button className="btn btn-ghost" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <><X size={16}/> Hủy</> : <><Edit3 size={16}/> Chỉnh sửa</>}
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="form-grid">
                    <div className="input-group full-width">
                      <label>Họ và tên</label>
                      <input type="text" className="input-box" value={formData.fullName} disabled={!isEditing}
                        onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>

                    <div className="input-group">
                      <label>Email</label>
                      <input type="text" className="input-box" value={formData.email} disabled style={{opacity: 0.7}} />
                    </div>

                    <div className="input-group">
                      <label>Số điện thoại</label>
                      <input type="text" className="input-box" value={formData.phone} disabled={!isEditing}
                        onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Thêm số điện thoại"/>
                    </div>

                    <div className="input-group full-width">
                      <label>Địa chỉ giao hàng mặc định</label>
                      <input type="text" className="input-box" value={formData.address} disabled={!isEditing}
                        onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Nhập địa chỉ nhận hàng..."/>
                    </div>
                  </div>

                  {isEditing && (
                    <div style={{marginTop: '30px', display: 'flex', justifyContent: 'flex-end'}}>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  )}
                </form>
              </>
            )}

            {/* 2. TAB ORDERS */}
            {activeTab === 'orders' && (
              <>
                <div className="content-header">
                  <div className="content-title"><ShoppingBag size={24} className="text-rose-500"/> Lịch sử đơn hàng</div>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-10"><Loader2 className="animate-spin text-rose-500" size={30} style={{margin:'0 auto'}}/></div>
                ) : orders.length > 0 ? (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order.id} className="order-item">
                        <div style={{flex: 1}}>
                          <div style={{display:'flex', gap:'10px', alignItems:'center', marginBottom:'5px'}}>
                            <h4 style={{margin:0}}>Đơn hàng #{order.id}</h4>
                            <span className={`status-badge ${order.status === 'COMPLETED' ? 'status-completed' : 'status-pending'}`}>
                              {order.status}
                            </span>
                          </div>
                          <p style={{margin:0, color:'#64748b', fontSize:'13px'}}>{order.items || "Nhiều món ăn"}</p>
                          <small style={{color:'#94a3b8'}}>{order.date}</small>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontWeight:'bold', color:'#ff4757', fontSize:'16px'}}>{order.total?.toLocaleString()}đ</div>
                          <button className="btn btn-ghost" style={{padding:'6px 12px', marginTop:'5px', fontSize:'12px'}} onClick={() => navigate(`/order/${order.id}`)}>
                            Chi tiết <ChevronRight size={14}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{textAlign:'center', padding:'50px 0', color:'#94a3b8'}}>
                    <Package size={48} style={{margin:'0 auto 20px', opacity:0.5}}/>
                    <h3>Chưa có đơn hàng nào</h3>
                    <button className="btn btn-primary" style={{margin:'20px auto'}} onClick={() => navigate('/menu')}>Đặt món ngay</button>
                  </div>
                )}
              </>
            )}

            {/* 3. TAB SECURITY */}
            {activeTab === 'security' && (
              <>
                <div className="content-header">
                  <div className="content-title"><Key size={24} className="text-rose-500"/> Đổi mật khẩu</div>
                </div>
                
                <form onSubmit={handleChangePassword} style={{maxWidth: '500px'}}>
                  <div className="input-group" style={{marginBottom:'20px'}}>
                    <label>Mật khẩu hiện tại</label>
                    <div className="password-wrapper">
                      <input type={showPass.current ? "text" : "password"} className="input-box" 
                        value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} />
                      <button type="button" className="eye-btn" onClick={() => setShowPass({...showPass, current: !showPass.current})}>
                        {showPass.current ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>

                  <div className="input-group" style={{marginBottom:'20px'}}>
                    <label>Mật khẩu mới</label>
                    <div className="password-wrapper">
                      <input type={showPass.new ? "text" : "password"} className="input-box" 
                        value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} />
                      <button type="button" className="eye-btn" onClick={() => setShowPass({...showPass, new: !showPass.new})}>
                        {showPass.new ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>

                  <div className="input-group" style={{marginBottom:'30px'}}>
                    <label>Xác nhận mật khẩu mới</label>
                    <div className="password-wrapper">
                      <input type={showPass.confirm ? "text" : "password"} className="input-box" 
                        value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} />
                      <button type="button" className="eye-btn" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}>
                        {showPass.confirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading || !passData.currentPassword}>
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>} Cập nhật mật khẩu
                  </button>
                </form>
              </>
            )}

          </main>
        </div>
      </div>
    </>
  );
};

export default Profile;
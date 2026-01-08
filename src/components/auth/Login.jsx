import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight, Loader2, UtensilsCrossed } from 'lucide-react'; 
import toast from 'react-hot-toast';
import api from '../../api/axios'; // Đảm bảo file axios này đúng (xem phần 2 bên dưới)

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
        toast.error("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    setLoading(true);
    // console.log("🚀 Đang gửi request login...", formData);

    try {
      // 👇 QUAN TRỌNG: Đã sửa từ '/users/login' thành '/auth/login'
      // Nếu Backend có tiền tố /api thì axios đã lo (xem file axios bên dưới)
      const res = await api.post('/auth/login', {
        username: formData.username,
        password: formData.password
      });

      console.log("✅ Phản hồi từ Server:", res.data);

      // Tìm Token trong mọi ngóc ngách có thể
      const token = res.data.token || res.data.accessToken || res.data.jwt;
      
      if (!token) {
          toast.error("Lỗi: Server không trả về Token!");
          return;
      }

      // Xử lý Role
      let role = 'USER';
      if (res.data.role) {
          const rawRole = JSON.stringify(res.data.role); 
          if (rawRole.includes("ADMIN")) role = "ADMIN";
          else if (rawRole.includes("DRIVER") || rawRole.includes("SHIPPER")) role = "DRIVER";
      }

      // Lưu vào LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: res.data.id || res.data.userId,
        username: res.data.username,
        fullName: res.data.fullName,
        role: role,
        avatar: res.data.avatar
      }));

      toast.success("Đăng nhập thành công!");
      
      // Điều hướng dựa trên quyền
      if (role === "ADMIN") {
          navigate('/admin');
      } else {
          navigate('/');
      }

    } catch (error) {
      console.error("❌ Lỗi Login:", error);
      
      if (error.code === "ERR_NETWORK") {
          toast.error("Không kết nối được Server (Backend chưa chạy?)");
      } else if (error.response) {
          // Lấy thông báo lỗi chính xác từ Backend trả về
          const msg = error.response.data?.message || "Sai tài khoản hoặc mật khẩu!";
          toast.error(msg);
      } else {
          toast.error("Lỗi không xác định, vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="brand-section">
          <div className="logo-circle"><UtensilsCrossed size={32} color="white" /></div>
          <h1>Food Review</h1>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Nhập username" />
            </div>
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20}/> : <>Đăng nhập <ArrowRight size={20} /></>}
          </button>
        </form>
        <p className="login-footer">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </div>
      <style>{`
        .login-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f1f5f9; }
        .login-card { background: white; padding: 40px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .brand-section { text-align: center; margin-bottom: 30px; }
        .logo-circle { background: #ef4444; width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
        .form-group { margin-bottom: 20px; }
        .input-group { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 12px; color: #94a3b8; }
        input { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; box-sizing: border-box; }
        .btn-submit { width: 100%; padding: 14px; background: #ef4444; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .login-footer { text-align: center; margin-top: 20px; font-size: 14px; color: #64748b; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
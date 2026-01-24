import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight, Loader2, UtensilsCrossed } from 'lucide-react'; 
import toast from 'react-hot-toast';
import api from '../../api/axios'; 

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

    try {
      // 1. GỌI LOGIN
      const res = await api.post('/api/auth/login', {
        username: formData.username,
        password: formData.password
      });

      console.log("🔍 LOGIN RESPONSE:", res.data); // Xem server trả về gì

      // 2. LẤY TOKEN (QUAN TRỌNG NHẤT)
      // Backend có thể trả về 'token', 'accessToken' hoặc 'jwt'
      const token = res.data.token || res.data.accessToken || res.data.jwt;

      if (!token) {
          throw new Error("Server không trả về Token đăng nhập!");
      }

      // ✅ LƯU TOKEN THẬT NGAY LẬP TỨC
      localStorage.setItem('token', token); 

      // 3. XÁC ĐỊNH USER VÀ ROLE
      // Một số backend trả user luôn trong login, một số thì không
      let userData = res.data.user || res.data; 

      // Nếu trong login response chưa có role, gọi thêm API profile
      // (Lúc này đã có token trong localStorage nên gọi sẽ thành công)
      if (!userData.role && !userData.roles) {
          try {
              const profileRes = await api.get('/api/users/profile');
              userData = { ...userData, ...profileRes.data };
          } catch (err) {
              console.warn("Không lấy được profile chi tiết, dùng thông tin cơ bản.");
          }
      }

      // 4. CHUẨN HÓA ROLE (Chuyển về ADMIN hoặc USER)
      let role = "USER";
      if (userData.role) {
          role = userData.role.toUpperCase(); // Ví dụ: "admin" -> "ADMIN"
      } else if (userData.roles && Array.isArray(userData.roles)) {
          // Trường hợp Spring Security trả về mảng ["ROLE_ADMIN", "ROLE_USER"]
          if (userData.roles.includes("ROLE_ADMIN") || userData.roles.includes("ADMIN")) {
              role = "ADMIN";
          }
      }

      // 5. LƯU USER ĐÃ CHUẨN HÓA
      const finalUser = {
          id: userData.id,
          username: userData.username || formData.username,
          fullName: userData.fullName || userData.username,
          role: role, 
          avatar: userData.avatar
      };

      localStorage.setItem('user', JSON.stringify(finalUser));
      toast.success(`Xin chào, ${finalUser.fullName}!`);

      // 6. ĐIỀU HƯỚNG
      if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
          navigate('/admin');
      } else {
          navigate('/');
      }

      // Reload để cập nhật Header và Axios Interceptor
      setTimeout(() => window.location.reload(), 100);

    } catch (error) {
      console.error("❌ Lỗi Đăng nhập:", error);
      const msg = error.response?.data?.message || "Đăng nhập thất bại. Kiểm tra lại tài khoản!";
      toast.error(msg);
      
      // Xóa rác nếu lỗi
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
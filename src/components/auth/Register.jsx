import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { UserPlus, Mail, Lock, User, Loader2, UtensilsCrossed, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast'; // Sử dụng toast thay cho alert

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    fullName: '', 
    email: '' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate cơ bản
    if(!formData.username || !formData.password || !formData.email || !formData.fullName) {
        toast.error("Vui lòng điền đầy đủ thông tin!");
        setLoading(false);
        return;
    }

    try {
      await api.post('/auth/register', formData);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      
      // Delay một chút để người dùng đọc thông báo trước khi chuyển trang
      setTimeout(() => {
          navigate('/login');
      }, 1500);
      
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(typeof msg === 'string' ? msg : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background"></div>

      <div className="auth-card animate-slide-up">
        {/* Branding Logo */}
        <div className="brand-section">
          <div className="logo-circle">
            <UtensilsCrossed size={32} color="white" />
          </div>
          <h1>Food Review</h1>
        </div>

        <div className="auth-header">
          <h2>Tạo tài khoản mới</h2>
          <p>Khám phá thế giới ẩm thực ngay hôm nay.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* FULL NAME */}
          <div className="form-group">
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input 
                type="text" 
                name="fullName"
                placeholder="Họ và tên hiển thị" 
                className="auth-input" 
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <div className="input-group">
              <Mail size={20} className="input-icon" />
              <input 
                type="email" 
                name="email"
                placeholder="Địa chỉ Email" 
                className="auth-input" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* USERNAME */}
          <div className="form-group">
            <div className="input-group">
              <UserPlus size={20} className="input-icon" />
              <input 
                type="text" 
                name="username"
                placeholder="Tên đăng nhập" 
                className="auth-input" 
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input 
                type="password" 
                name="password"
                placeholder="Mật khẩu" 
                className="auth-input" 
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
                <Loader2 className="animate-spin" size={20} />
            ) : (
                <>Đăng ký ngay <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
        </div>
      </div>

      {/* --- CSS STYLING (Đồng bộ với Login) --- */}
      <style>{`
        .auth-wrapper {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          padding: 20px;
        }

        .auth-background {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
          z-index: 0;
        }
        
        /* Bong bóng trang trí nền */
        .auth-background::before, .auth-background::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          z-index: 0;
        }
        .auth-background::before {
          width: 300px; height: 300px;
          background: #fecaca;
          top: -50px; left: -50px;
        }
        .auth-background::after {
          width: 400px; height: 400px;
          background: #fde047;
          bottom: -100px; right: -100px;
          opacity: 0.3;
        }

        /* Thẻ Card chính */
        .auth-card {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          width: 100%;
          max-width: 440px;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        /* Logo Branding */
        .brand-section {
          display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;
        }
        .logo-circle {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
          transform: rotate(-5deg);
        }
        .brand-section h1 {
          font-size: 24px; fontWeight: 800; color: #1e293b; letter-spacing: -0.5px; margin: 0;
        }

        .auth-header { text-align: center; margin-bottom: 25px; }
        .auth-header h2 { font-size: 20px; color: #334155; margin: 0 0 5px; fontWeight: 700; }
        .auth-header p { font-size: 14px; color: #64748b; margin: 0; }

        /* Form Inputs */
        .form-group { margin-bottom: 16px; }
        
        .input-group { position: relative; transition: all 0.2s ease; }
        .input-icon {
          position: absolute; left: 16px; top: 50%;
          transform: translateY(-50%);
          color: #94a3b8; transition: color 0.2s;
        }
        .auth-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px; color: #1e293b;
          background: #f8fafc;
          outline: none; transition: all 0.2s;
          box-sizing: border-box;
        }
        .auth-input:focus {
          background: #fff;
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }
        .auth-input:focus ~ .input-icon { color: #ef4444; }
        .auth-input::placeholder { color: #cbd5e1; }

        /* Button */
        .btn-submit {
          width: 100%; padding: 14px; margin-top: 10px;
          background: linear-gradient(to right, #ef4444, #dc2626);
          color: white; border: none; border-radius: 12px;
          font-size: 16px; fontWeight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
        }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .auth-footer {
          margin-top: 25px; text-align: center;
          font-size: 14px; color: #64748b;
          border-top: 1px solid #f1f5f9; padding-top: 20px;
        }
        .auth-footer a {
          color: #1e293b; fontWeight: 700; text-decoration: none; margin-left: 4px;
        }
        .auth-footer a:hover { color: #ef4444; text-decoration: underline; }

        /* Animations */
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .auth-card { padding: 30px 20px; border-radius: 0; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; }
          .auth-background { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Register;
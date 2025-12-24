import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { UserPlus, Mail, Lock, User, Loader } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      alert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <style>{`
        .auth-page { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 100px); background: #f9fafb; padding: 20px; font-family: 'Inter', sans-serif; }
        .auth-card { background: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); width: 100%; max-width: 400px; border: 1px solid #e5e7eb; }
        .auth-header { text-align: center; margin-bottom: 30px; }
        .auth-header h2 { font-size: 28px; font-weight: 900; color: #111827; margin: 0; }
        .auth-header p { color: #6b7280; margin-top: 8px; }
        .input-group { position: relative; margin-bottom: 20px; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .auth-input { width: 100%; padding: 14px 14px 14px 45px; border: 1.5px solid #e5e7eb; border-radius: 12px; outline: none; transition: 0.3s; font-size: 15px; box-sizing: border-box; }
        .auth-input:focus { border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
        .auth-btn { width: 100%; padding: 14px; background: #ef4444; color: #fff; border: none; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
        .auth-btn:hover { background: #dc2626; transform: translateY(-1px); }
        .error-box { background: #fef2f2; color: #b91c1c; padding: 12px; border-radius: 10px; font-size: 14px; margin-bottom: 20px; text-align: center; border: 1px solid #fecaca; }
        .auth-footer { text-align: center; margin-top: 25px; font-size: 14px; color: #6b7280; }
        .auth-link { color: #ef4444; font-weight: 700; text-decoration: none; }
      `}</style>

      <div className="auth-card">
        <div className="auth-header">
          <h2>Tạo tài khoản</h2>
          <p>Khám phá vạn món ngon cùng FoodReview</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input type="text" placeholder="Họ và tên" className="auth-input" required
              onChange={e => setFormData({...formData, fullName: e.target.value})} />
          </div>

          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input type="email" placeholder="Email" className="auth-input" required
              onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="input-group">
            <UserPlus className="input-icon" size={20} />
            <input type="text" placeholder="Tên đăng nhập" className="auth-input" required
              onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input type="password" placeholder="Mật khẩu" className="auth-input" required
              onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader className="animate-spin" size={20} /> : "Đăng ký thành viên"}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
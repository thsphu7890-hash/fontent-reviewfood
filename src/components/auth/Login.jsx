import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { LogIn, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));

      const role = userData.role;
      if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  // --- Hệ thống Style Objects ---
  const styles = {
    wrapper: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: '#ffffff',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    iconCircle: {
      width: '56px',
      height: '56px',
      backgroundColor: '#ef4444',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      color: '#fff'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b'
    },
    error: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '20px',
      border: '1px solid #fee2e2'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '8px'
    },
    inputWrapper: {
      position: 'relative',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center'
    },
    input: {
      width: '100%',
      padding: '12px 16px 12px 42px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      fontSize: '15px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    inputIcon: {
      position: 'absolute',
      left: '14px',
      color: '#94a3b8'
    },
    eyeButton: {
      position: 'absolute',
      right: '12px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: loading ? '#fca5a5' : '#ef4444',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s'
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#64748b'
    },
    link: {
      color: '#ef4444',
      textDecoration: 'none',
      fontWeight: '600',
      marginLeft: '5px'
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <LogIn size={28} />
          </div>
          <h2 style={styles.title}>Đăng nhập</h2>
          <p style={styles.subtitle}>Chào mừng bạn quay trở lại</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div>
            <label style={styles.label}>Tên đăng nhập</label>
            <div style={styles.inputWrapper}>
              <User style={styles.inputIcon} size={18} />
              <input 
                type="text" 
                placeholder="Nhập tài khoản"
                style={styles.input}
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Mật khẩu</label>
            <div style={styles.inputWrapper}>
              <Lock style={styles.inputIcon} size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                style={styles.input}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
              <button 
                type="button" 
                style={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
          </button>
        </form>

        <div style={styles.footer}>
          Chưa có tài khoản? 
          <Link to="/register" style={styles.link}>Đăng ký ngay</Link>
        </div>
      </div>

      {/* Style hỗ trợ hiệu ứng xoay cho Spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
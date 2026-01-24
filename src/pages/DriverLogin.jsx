import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Bike, Phone, ArrowRight, Loader2, ChevronLeft, ShieldCheck } from 'lucide-react';

const DriverLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm kiểm tra định dạng số điện thoại Việt Nam
  const validatePhone = (phoneNumber) => {
    const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    return regex.test(phoneNumber);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validate Client-side
    if (!phone) {
      setError("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!validatePhone(phone)) {
      setError("Số điện thoại không đúng định dạng VN (VD: 09...)");
      return;
    }

    setLoading(true);
    const loadId = toast.loading("Đang kết nối đến tổng đài...");

    try {
      // 2. Call API
      const res = await api.post('/api/driver/login', null, { params: { phone } });
      
      // 3. Success Handling
      localStorage.setItem('driverInfo', JSON.stringify(res.data));
      toast.success(`Chào mừng bác tài ${res.data.fullName} quay lại!`, { id: loadId });
      
      // Hiệu ứng delay nhỏ để người dùng đọc thông báo
      setTimeout(() => {
        navigate('/driver/dashboard');
      }, 800);

    } catch (err) {
      // 4. Error Handling
      const msg = err.response?.data?.message || "Số điện thoại chưa đăng ký hoặc tài khoản đang bị khóa!";
      toast.error(msg, { id: loadId });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES OBJECT ---
  const styles = {
    wrapper: {
      minHeight: '100vh',
      background: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    },
    card: {
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '40px',
      borderRadius: '24px',
      width: '100%',
      maxWidth: '420px',
      textAlign: 'center',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    logoCircle: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
    },
    title: {
      color: 'white',
      fontSize: '28px',
      fontWeight: '800',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#94a3b8',
      fontSize: '14px',
      marginBottom: '32px'
    },
    inputGroup: {
      position: 'relative',
      marginBottom: '20px',
      textAlign: 'left'
    },
    icon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8',
      transition: '0.3s'
    },
    input: {
      width: '100%',
      padding: '16px 16px 16px 50px',
      borderRadius: '16px',
      border: error ? '1px solid #ef4444' : '1px solid #334155',
      background: '#0f172a',
      color: 'white',
      outline: 'none',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box' // Quan trọng để padding không làm vỡ layout
    },
    button: {
      width: '100%',
      padding: '16px',
      borderRadius: '16px',
      background: 'linear-gradient(to right, #38bdf8, #0ea5e9)',
      color: 'white',
      fontWeight: '700',
      fontSize: '16px',
      border: 'none',
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '10px',
      transition: 'transform 0.2s',
      opacity: loading ? 0.7 : 1
    },
    errorText: {
      color: '#ef4444',
      fontSize: '13px',
      marginTop: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    footer: {
      marginTop: '30px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      paddingTop: '20px',
      fontSize: '14px',
      color: '#94a3b8'
    },
    link: {
      color: '#38bdf8',
      textDecoration: 'none',
      fontWeight: '600',
      marginLeft: '5px'
    },
    backLink: {
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: '#fff',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '14px',
        opacity: 0.7
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Nút quay lại trang chủ */}
      <Link to="/" style={styles.backLink}>
        <ChevronLeft size={20} /> Trang chủ
      </Link>

      <div style={styles.card}>
        <div style={styles.logoCircle}>
          <Bike size={48} color="white" />
        </div>
        
        <h2 style={styles.title}>Đối Tác Tài Xế</h2>
        <p style={styles.subtitle}>Kiếm thêm thu nhập cùng FoodNest</p>

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <Phone size={20} style={{...styles.icon, color: phone ? '#38bdf8' : '#94a3b8'}} />
            <input 
              type="tel" // Đổi thành tel để bàn phím điện thoại hiện số
              placeholder="Nhập số điện thoại của bạn" 
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError(''); // Xóa lỗi khi người dùng nhập lại
              }}
              style={{
                ...styles.input,
                borderColor: phone ? '#38bdf8' : (error ? '#ef4444' : '#334155')
              }}
            />
            {error && (
                <div style={styles.errorText}>
                    <ShieldCheck size={14}/> {error}
                </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={styles.button}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={20} /> Đang xác thực...
                </>
            ) : (
                <>
                    Đăng Nhập <ArrowRight size={20} />
                </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          Chưa là đối tác tài xế? 
          <Link to="/driver-register" style={styles.link}>Đăng ký ngay</Link>
        </div>
      </div>
      
      {/* CSS Animation cho Loader */}
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DriverLogin;
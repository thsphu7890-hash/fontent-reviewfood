import React, { useEffect, useState, useRef } from 'react';
import { ShoppingCart, User, Search, LogOut, ClipboardList, Settings, ChevronDown, Bike, Home, BookOpen, Ticket, Gift, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { useCart } from '../context/CartContext';
import DriverRegModal from './DriverRegModal';
import NotificationDropdown from './NotificationDropdown'; 
import api from '../api/axios';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  
  // 1. KHỞI TẠO USER TỪ LOCALSTORAGE (Để F5 không bị mất)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  
  const userRef = useRef(null);

  // --- XỬ LÝ ẢNH AVATAR ---
  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Ảnh Google/Facebook
    return `http://localhost:8080${path}`;    // Ảnh Upload lên Server
  };

  // --- LẤY THÔNG TIN USER MỚI NHẤT TỪ SERVER ---
  const fetchUserProfile = async () => {
    // Chỉ gọi nếu đã có user trong localStorage
    if (!localStorage.getItem('user')) return;

    try {
      // Gọi API lấy profile (Session Cookie tự gửi đi)
      const response = await api.get('/api/users/profile'); 
      setUser(response.data);
      // Cập nhật lại localStorage để đồng bộ
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.warn("⚠️ Không đồng bộ được Profile từ Server (Có thể do Cookie chưa nhận), dùng data cũ.");
      
      // ❌❌❌ QUAN TRỌNG: ĐÃ XÓA ĐOẠN handleLogout() GÂY LỖI Ở ĐÂY ❌❌❌
      // Trước đây: if (error... 403) -> handleLogout() -> Bị đá ra ngoài.
      // Bây giờ: Chỉ log cảnh báo, giữ nguyên trạng thái đăng nhập của người dùng.
    }
  };

  useEffect(() => {
    fetchUserProfile(); // Gọi update profile khi mount

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (event) => {
        if (userRef.current && !userRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- XỬ LÝ ĐĂNG XUẤT ---
  const handleLogout = async () => {
    try {
        // 1. Báo Server xóa Session
        await api.post('/api/auth/logout');
    } catch (err) {
        console.log("Lỗi logout server:", err);
    } finally {
        // 2. Xóa sạch Client
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setShowDropdown(false);
        navigate('/login');
        // Reload nhẹ để reset toàn bộ state của App
        window.location.reload(); 
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword("");
    }
  };

  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <>
      <header className={`hd-wrapper ${isScrolled ? 'hd-scrolled' : ''}`}>
        <style>{`
          .hd-wrapper { background: #111827; position: sticky; top: 0; z-index: 1000; transition: 0.4s; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
          .hd-scrolled { background: rgba(17, 24, 39, 0.95); backdrop-filter: blur(12px); padding: 5px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
          .hd-container { max-width: 1240px; margin: 0 auto; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
          
          .hd-logo { font-size: 24px; font-weight: 900; color: #fff; text-decoration: none; letter-spacing: -1.5px; }
          .hd-logo span { color: #ff4757; }

          .hd-nav { display: flex; gap: 5px; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 50px; }
          .hd-nav-link { text-decoration: none; color: #9ca3af; font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 20px; transition: 0.3s; display: flex; align-items: center; gap: 6px; }
          .hd-nav-link:hover { color: #fff; background: rgba(255,255,255,0.1); }
          .hd-nav-link.active { background: #ff4757; color: white; }

          .hd-search-form { flex: 1; max-width: 300px; position: relative; }
          .hd-search-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 40px 10px 15px; color: #fff; outline: none; }
          .hd-search-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #9ca3af; cursor: pointer; }

          .hd-actions { display: flex; align-items: center; gap: 12px; }
          .hd-icon-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(255,255,255,0.03); color: #d1d5db; position: relative; cursor: pointer; transition: 0.2s; text-decoration: none; border: none; }
          .hd-icon-btn:hover { background: rgba(255, 255, 255, 0.1); color: #ff4757; }
          
          .hd-badge { position: absolute; top: -5px; right: -5px; background: #ff4757; color: #fff; font-size: 9px; font-weight: 800; height: 16px; min-width: 16px; padding: 0 4px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid #111827; }

          .hd-driver-btn { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 8px 14px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; }
          .hd-user-trigger { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 5px 10px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); }
          .hd-avatar { width: 30px; height: 30px; background: #ff4757; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 13px;}
          .hd-avatar img { width: 100%; height: 100%; object-fit: cover; }
          .hd-user-info { display: flex; flex-direction: column; }
          .hd-user-name { font-weight: 700; color: #f3f4f6; font-size: 12px; }
          .hd-user-role { font-size: 9px; color: #9ca3af; }

          .hd-dropdown { position: absolute; top: calc(100% + 15px); right: 0; background: #1f2937; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; width: 240px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); z-index: 1001; overflow: hidden; }
          .hd-dropdown-item { display: flex; align-items: center; gap: 12px; padding: 14px 20px; color: #d1d5db; font-size: 14px; font-weight: 500; text-decoration: none; cursor: pointer; border: none; width: 100%; background: none; text-align: left;}
          .hd-dropdown-item:hover { background: #374151; color: #ff4757; }
          .hd-dropdown-item.highlight { background: rgba(255, 71, 87, 0.1); color: #ff4757; font-weight: 600; }

          .mission-btn { position: relative; color: #fbbf24; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); }
          .mission-btn:hover { background: rgba(251, 191, 36, 0.2); transform: translateY(-2px); }
          .dot-badge { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 1px solid #111827; }

          @media (max-width: 1024px) { .hd-nav { display: none; } }
          @media (max-width: 768px) { .hd-search-form, .hd-user-info { display: none; } .hd-driver-btn span { display: none; } }
        `}</style>

        <div className="hd-container">
          <Link to="/" className="hd-logo">FOOD<span>NEST</span>.</Link>

          <nav className="hd-nav">
            <Link to="/" className={`hd-nav-link ${isActive('/') ? 'active' : ''}`}><Home size={16}/> Trang chủ</Link>
            <Link to="/menu" className={`hd-nav-link ${isActive('/menu') ? 'active' : ''}`}><BookOpen size={16}/> Thực đơn</Link>
            <Link to="/vouchers" className={`hd-nav-link ${isActive('/vouchers') ? 'active' : ''}`}><Ticket size={16}/> Ưu đãi</Link>
          </nav>

          <form className="hd-search-form" onSubmit={handleSearch}>
            <input type="text" placeholder="Tìm kiếm..." className="hd-search-input" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
            <button type="submit" className="hd-search-btn"><Search size={16} /></button>
          </form>

          <div className="hd-actions">
            <div className="hd-driver-btn" onClick={() => setShowDriverForm(true)}><Bike /> <span>Đăng ký</span></div>

            <NotificationDropdown />

            {user ? (
              <>
                <Link to="/mission" className="hd-icon-btn mission-btn" title="Săn thưởng">
                   <Gift size={20} />
                   <span className="dot-badge"></span>
                </Link>

                <div className="hd-user-wrapper" style={{position:'relative'}} ref={userRef}>
                  <div className="hd-user-trigger" onClick={() => setShowDropdown(!showDropdown)}>
                    <div className="hd-avatar">
                      {user.avatar ? 
                          <img src={getAvatarUrl(user.avatar)} alt="Ava" onError={(e)=>{e.target.onerror=null; e.target.src="https://ui-avatars.com/api/?name="+user.fullName}}/> 
                          : (user.fullName?.charAt(0).toUpperCase() || 'U')
                      }
                    </div>
                    <div className="hd-user-info">
                      <span className="hd-user-name">{user.fullName || "User"}</span>
                      <span className="hd-user-role">{user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}</span>
                    </div>
                    <ChevronDown size={12} color="#9ca3af" />
                  </div>
                  
                  {showDropdown && (
                    <div className="hd-dropdown">
                      <div style={{padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                        <p style={{margin:0, color:'#fff', fontWeight:600, fontSize:14}}>{user.fullName}</p>
                        <p style={{margin:0, color:'#9ca3af', fontSize:11}}>{user.email}</p>
                      </div>

                      <Link to="/dashboard" className="hd-dropdown-item highlight">
                        <LayoutDashboard size={16} /> Tổng quan
                      </Link>

                      <Link to="/profile" className="hd-dropdown-item"><User size={16} /> Hồ sơ cá nhân</Link>
                      <Link to="/history" className="hd-dropdown-item"><ClipboardList size={16} /> Lịch sử đơn hàng</Link>
                      <Link to="/mission" className="hd-dropdown-item"><Gift size={16} /> Nhiệm vụ & Quà</Link>

                      {user.role === 'ADMIN' && <Link to="/admin" className="hd-dropdown-item"><Settings size={16} /> Trang quản trị</Link>}
                      
                      <button className="hd-dropdown-item" style={{color: '#ff4757'}} onClick={handleLogout}><LogOut size={16} /> Đăng xuất</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="hd-icon-btn"><User size={20} /></Link>
            )}

            <Link to="/order" className="hd-icon-btn" style={{background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757'}}>
              <ShoppingCart size={20} />
              {totalQuantity > 0 && <span className="hd-badge">{totalQuantity}</span>}
            </Link>
          </div>
        </div>
      </header>

      <DriverRegModal isOpen={showDriverForm} onClose={() => setShowDriverForm(false)} />
    </>
  );
};

export default Header;
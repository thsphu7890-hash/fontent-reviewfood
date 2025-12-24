import React, { useEffect, useState } from 'react';
import { ShoppingCart, User, Search, MapPin, LogOut, ClipboardList, Settings, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      // Navigate to SearchPage with query param
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword(""); // Optional: Clear input after search
    }
  };

  // Calculate total quantity of items in cart
  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="hd-wrapper">
      <style>{`
        /* --- LAYOUT CHUNG --- */
        .hd-wrapper { 
          background-color: #fff; 
          border-bottom: 1px solid #f3f4f6; 
          position: sticky; 
          top: 0; 
          z-index: 1000; 
          font-family: 'Inter', sans-serif; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.03); 
        }
        
        .hd-container { 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 12px 20px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          gap: 20px; 
        }
        
        /* --- LOGO --- */
        .hd-logo { 
          font-size: 26px; 
          font-weight: 900; 
          color: #111827; 
          text-decoration: none; 
          letter-spacing: -1px; 
          flex-shrink: 0; 
          display: flex;
          align-items: center;
        }
        .hd-logo span { color: #ef4444; }

        /* --- SEARCH BAR --- */
        .hd-search-form { 
          flex: 1; 
          max-width: 450px; 
          position: relative; 
        }
        .hd-search-input { 
          width: 100%; 
          background-color: #f9fafb; 
          border: 1px solid #e5e7eb; 
          border-radius: 99px; 
          padding: 10px 45px 10px 20px; 
          font-size: 14px; 
          outline: none; 
          transition: all 0.2s ease; 
          color: #374151;
          box-sizing: border-box; /* Fix width issue */
        }
        .hd-search-input:focus { 
          border-color: #ef4444; 
          background-color: #fff; 
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); 
        }
        .hd-search-btn { 
          position: absolute; 
          right: 12px; 
          top: 50%; 
          transform: translateY(-50%); 
          background: none; 
          border: none; 
          color: #9ca3af; 
          cursor: pointer; 
          padding: 5px;
          display: flex;
        }
        .hd-search-btn:hover { color: #ef4444; }

        /* --- ACTIONS (RIGHT SIDE) --- */
        .hd-actions { 
          display: flex; 
          align-items: center; 
          gap: 24px; 
        }
        
        .hd-item { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          cursor: pointer; 
          text-decoration: none; 
          color: #4b5563; 
          font-weight: 500; 
          font-size: 14px; 
          transition: 0.2s; 
          position: relative; 
        }
        .hd-item:hover { color: #ef4444; }

        /* Location (Hidden on mobile) */
        .hd-location { display: none; } 
        @media (min-width: 900px) {
          .hd-location { display: flex; }
        }

        /* --- USER PROFILE --- */
        .hd-user-wrapper { position: relative; }
        
        .hd-user-trigger { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          cursor: pointer; 
          padding: 4px 8px 4px 4px; 
          border-radius: 30px; 
          border: 1px solid transparent;
          transition: 0.2s; 
        }
        .hd-user-trigger:hover { 
          background-color: #f3f4f6; 
          border-color: #e5e7eb;
        }
        
        .hd-avatar { 
          width: 36px; 
          height: 36px; 
          background: linear-gradient(135deg, #ef4444, #dc2626); 
          color: #fff; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 15px; 
          font-weight: 700; 
          box-shadow: 0 2px 5px rgba(239, 68, 68, 0.3);
        }
        
        .hd-user-name {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        /* --- DROPDOWN MENU --- */
        .hd-dropdown { 
          position: absolute; 
          top: calc(100% + 12px); 
          right: 0; 
          background: #fff; 
          border: 1px solid #f3f4f6; 
          border-radius: 16px; 
          width: 220px; 
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); 
          overflow: hidden; 
          animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1); 
          z-index: 1100;
        }
        
        .hd-dropdown-item { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 12px 20px; 
          text-decoration: none; 
          color: #4b5563; 
          font-size: 14px; 
          font-weight: 500;
          transition: 0.2s; 
          width: 100%; 
          border: none; 
          background: none; 
          text-align: left; 
          cursor: pointer; 
          box-sizing: border-box; /* Fix padding issue */
        }
        .hd-dropdown-item:hover { 
          background-color: #fef2f2; 
          color: #ef4444; 
        }

        /* --- CART BADGE --- */
        .hd-cart-icon { position: relative; display: flex; align-items: center; }
        .hd-badge { 
          position: absolute; 
          top: -8px; 
          right: -10px; 
          background-color: #ef4444; 
          color: #fff; 
          font-size: 11px; 
          font-weight: 800; 
          border-radius: 50%; 
          height: 20px; 
          width: 20px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 2px solid #fff; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* --- RESPONSIVE --- */
        @media (max-width: 768px) {
          .hd-search-form { display: none; } 
          .hd-container { padding: 10px 15px; gap: 10px; }
          .hd-logo { font-size: 22px; }
          .hd-user-name { display: none; } 
          .hd-actions { gap: 15px; }
        }
      `}</style>

      <div className="hd-container">
        {/* Logo */}
        <Link to="/" className="hd-logo">
          FOOD<span>REVIEW</span>.
        </Link>

        {/* Search Bar */}
        <form className="hd-search-form" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Tìm nhà hàng, món ngon..." 
            className="hd-search-input"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button type="submit" className="hd-search-btn">
            <Search size={18} />
          </button>
        </form>

        {/* Right Actions */}
        <div className="hd-actions">
          {/* Location */}
          <div className="hd-item hd-location">
            <MapPin size={18} color="#ef4444" />
            <span>Hồ Chí Minh</span>
          </div>

          {/* User Section */}
          {user ? (
            <div className="hd-user-wrapper">
              <div className="hd-user-trigger" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="hd-avatar">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hd-user-name">Hi, {user.fullName.split(' ').pop()}</span>
                <ChevronDown size={14} color="#6b7280" />
              </div>

              {showDropdown && (
                <div className="hd-dropdown">
                  <Link to="/user/dashboard" className="hd-dropdown-item" onClick={() => setShowDropdown(false)}>
                    <User size={18} /> Dashboard cá nhân
                  </Link>
                  <Link to="/history" className="hd-dropdown-item" onClick={() => setShowDropdown(false)}>
                    <ClipboardList size={18} /> Đơn hàng của tôi
                  </Link>
                  <Link to="/settings" className="hd-dropdown-item" onClick={() => setShowDropdown(false)}>
                    <Settings size={18} /> Cài đặt
                  </Link>
                  <div style={{borderTop: '1px solid #f3f4f6', margin: '4px 0'}}></div>
                  <button className="hd-dropdown-item" style={{color: '#ef4444'}} onClick={handleLogout}>
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hd-item" style={{fontWeight: 600}}>
              <User size={20} />
              <span>Đăng nhập</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link to="/order" className="hd-item hd-cart-icon">
            <ShoppingCart size={24} color="#374151" />
            {totalQuantity > 0 && (
              <span className="hd-badge">
                {totalQuantity > 99 ? '99+' : totalQuantity}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
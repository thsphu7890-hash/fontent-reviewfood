import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { 
  User, Lock, Bell, MapPin, Globe, Moon, 
  ChevronRight, LogOut, ShieldAlert, X, Plus, Trash2, Check, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem('user')) || { fullName: 'Người dùng', email: 'user@example.com', phone: '0901234567' };

  // --- STATE CÀI ĐẶT (Có lưu vào LocalStorage) ---
  const [notify, setNotify] = useState(() => JSON.parse(localStorage.getItem('setting_notify')) ?? true);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('setting_dark')) ?? false);
  const [language, setLanguage] = useState(() => localStorage.getItem('setting_lang') || 'Tiếng Việt');

  // --- STATE MODALS ---
  const [showPassModal, setShowPassModal] = useState(false);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  // --- STATE DỮ LIỆU GIẢ LẬP ---
  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Nhà riêng', content: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM', isDefault: true },
    { id: 2, type: 'Công ty', content: 'Tòa nhà Bitexco, Quận 1, TP.HCM', isDefault: false },
  ]);

  // --- EFFECT: XỬ LÝ DARK MODE ---
  useEffect(() => {
    localStorage.setItem('setting_notify', JSON.stringify(notify));
    localStorage.setItem('setting_dark', JSON.stringify(darkMode));
    localStorage.setItem('setting_lang', language);

    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [notify, darkMode, language]);

  const handleLogout = () => {
    if(window.confirm("Bạn chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Component Item con
  const SettingItem = ({ icon, title, desc, onClick, isToggle, toggleValue, onToggle, valueLabel }) => (
    <div className="st-item" onClick={!isToggle ? onClick : undefined}>
      <div className="st-icon-box">{icon}</div>
      <div className="st-content">
        <div className="st-title">{title}</div>
        {desc && <div className="st-desc">{desc}</div>}
      </div>
      
      {isToggle ? (
        <div 
          className={`st-toggle ${toggleValue ? 'active' : ''}`} 
          onClick={(e) => { e.stopPropagation(); onToggle(!toggleValue); }}
        >
          <div className="st-circle"></div>
        </div>
      ) : (
        <div style={{display:'flex', alignItems:'center', gap: 10}}>
            {valueLabel && <span style={{fontSize:13, color:'#ef4444', fontWeight:600}}>{valueLabel}</span>}
            <ChevronRight size={18} color="#9ca3af" />
        </div>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <div className={`st-wrapper ${darkMode ? 'dark' : ''}`}>
        <div className="st-container">
            {/* CSS STYLES */}
            <style>{`
            /* DARK MODE VARIABLES */
            body.dark-theme { background-color: #111827; color: #f9fafb; }
            .st-wrapper.dark .st-section { background: #1f2937; border-color: #374151; }
            .st-wrapper.dark .st-h1 { color: #f9fafb; }
            .st-wrapper.dark .st-section-title { background: #374151; color: #9ca3af; border-color: #4b5563; }
            .st-wrapper.dark .st-item { border-color: #374151; }
            .st-wrapper.dark .st-item:hover { background-color: #374151; }
            .st-wrapper.dark .st-title { color: #f3f4f6; }
            .st-wrapper.dark .st-icon-box { background: #374151; color: #e5e7eb; }
            .st-wrapper.dark .user-preview { background: #1f2937; border-color: #374151; }
            .st-wrapper.dark .user-name { color: #f9fafb; }
            
            /* BASE STYLES */
            .st-container { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; padding-bottom: 80px; }
            .st-header { margin-bottom: 30px; }
            .st-h1 { font-size: 28px; font-weight: 800; color: #111827; }
            
            .st-section { background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 24px; transition: 0.3s; }
            .st-section-title { padding: 16px 20px; background: #f9fafb; font-weight: 700; font-size: 13px; color: #6b7280; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.5px; }
            
            .st-item { display: flex; align-items: center; padding: 16px 20px; cursor: pointer; transition: 0.2s; border-bottom: 1px solid #f3f4f6; }
            .st-item:last-child { border-bottom: none; }
            .st-item:hover { background-color: #fef2f2; }
            
            .st-icon-box { width: 40px; height: 40px; border-radius: 10px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: #374151; transition: 0.3s; }
            .st-content { flex: 1; }
            .st-title { font-weight: 600; color: #1f2937; font-size: 15px; }
            .st-desc { font-size: 13px; color: #6b7280; margin-top: 2px; }

            .st-toggle { width: 44px; height: 24px; background: #e5e7eb; border-radius: 20px; position: relative; cursor: pointer; transition: 0.3s; }
            .st-toggle.active { background: #ef4444; }
            .st-circle { width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.3s; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
            .st-toggle.active .st-circle { left: 22px; }

            .btn-logout { width: 100%; padding: 15px; background: #fee2e2; color: #ef4444; border: 1px dashed #ef4444; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; margin-top: 10px; }
            .btn-logout:hover { background: #fecaca; }

            .user-preview { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; background: white; padding: 20px; border-radius: 16px; border: 1px solid #e5e7eb; transition: 0.3s; }
            .up-avatar { width: 60px; height: 60px; border-radius: 50%; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; }
            .user-name { font-weight: 800; font-size: 18px; color: #111827; }

            /* --- MODAL STYLES --- */
            .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.2s; }
            .modal-box { background: white; width: 90%; max-width: 450px; border-radius: 20px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .modal-title { font-size: 18px; font-weight: 800; }
            
            .inp-group { margin-bottom: 15px; }
            .inp-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #374151; }
            .inp-field { width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; outline: none; transition: 0.2s; }
            .inp-field:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
            
            .btn-primary { width: 100%; padding: 12px; background: #111827; color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 10px; }
            .btn-primary:hover { opacity: 0.9; }

            .addr-item { border: 1px solid #e5e7eb; padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
            .addr-badge { background: #fee2e2; color: #ef4444; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 8px; }

            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes popUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>

            <div className="st-header">
            <h1 className="st-h1">Cài đặt</h1>
            </div>

            {/* Thông tin User */}
            <div className="user-preview">
            <div className="up-avatar">{user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</div>
            <div>
                <div className="user-name">{user.fullName}</div>
                <div style={{color: '#6b7280', fontSize: 14}}>{user.email}</div>
            </div>
            </div>

            {/* NHÓM 1: TÀI KHOẢN */}
            <div className="st-section">
            <div className="st-section-title">Tài khoản</div>
            
            <SettingItem 
                icon={<User size={20}/>} 
                title="Thông tin cá nhân" 
                desc="Chỉnh sửa tên, email, ảnh đại diện"
                onClick={() => navigate('/profile')} 
            />
            <SettingItem 
                icon={<MapPin size={20}/>} 
                title="Sổ địa chỉ" 
                desc="Quản lý địa chỉ giao hàng"
                onClick={() => setShowAddrModal(true)} 
            />
            <SettingItem 
                icon={<Lock size={20}/>} 
                title="Đổi mật khẩu" 
                desc="Cập nhật mật khẩu mới"
                onClick={() => setShowPassModal(true)} 
            />
            </div>

            {/* NHÓM 2: ỨNG DỤNG */}
            <div className="st-section">
            <div className="st-section-title">Ứng dụng</div>
            
            <SettingItem 
                icon={<Bell size={20}/>} 
                title="Thông báo" 
                desc="Nhận tin tức khuyến mãi"
                isToggle={true}
                toggleValue={notify}
                onToggle={setNotify}
            />
            <SettingItem 
                icon={<Globe size={20}/>} 
                title="Ngôn ngữ" 
                valueLabel={language}
                desc="Ngôn ngữ hiển thị"
                onClick={() => setShowLangModal(true)} 
            />
            <SettingItem 
                icon={<Moon size={20}/>} 
                title="Chế độ tối" 
                desc="Giao diện nền tối (Dark Mode)"
                isToggle={true}
                toggleValue={darkMode}
                onToggle={setDarkMode}
            />
            </div>

            {/* NHÓM 3: HỖ TRỢ */}
            <div className="st-section">
            <div className="st-section-title">Hỗ trợ</div>
            <SettingItem icon={<ShieldAlert size={20}/>} title="Điều khoản & Chính sách" onClick={() => {}} />
            </div>

            <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={20}/> Đăng xuất
            </button>
            <div style={{textAlign:'center', marginTop: 20, color:'#9ca3af', fontSize:12}}>FoodReview App v2.0</div>
        </div>

        {/* --- MODAL ĐỔI MẬT KHẨU --- */}
        {showPassModal && (
            <div className="modal-overlay" onClick={() => setShowPassModal(false)}>
                <div className="modal-box" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="modal-title">Đổi mật khẩu</div>
                        <X style={{cursor:'pointer'}} onClick={() => setShowPassModal(false)}/>
                    </div>
                    <div className="inp-group">
                        <label className="inp-label">Mật khẩu hiện tại</label>
                        <input type="password" className="inp-field" placeholder="•••••••"/>
                    </div>
                    <div className="inp-group">
                        <label className="inp-label">Mật khẩu mới</label>
                        <input type="password" className="inp-field" placeholder="Nhập mật khẩu mới"/>
                    </div>
                    <div className="inp-group">
                        <label className="inp-label">Xác nhận mật khẩu mới</label>
                        <input type="password" className="inp-field" placeholder="Nhập lại mật khẩu mới"/>
                    </div>
                    <button className="btn-primary" onClick={() => {alert('Đổi mật khẩu thành công!'); setShowPassModal(false)}}>
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        )}

        {/* --- MODAL QUẢN LÝ ĐỊA CHỈ --- */}
        {showAddrModal && (
            <div className="modal-overlay" onClick={() => setShowAddrModal(false)}>
                <div className="modal-box" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="modal-title">Sổ địa chỉ</div>
                        <X style={{cursor:'pointer'}} onClick={() => setShowAddrModal(false)}/>
                    </div>
                    <div style={{maxHeight:'300px', overflowY:'auto', marginBottom:15}}>
                        {addresses.map(addr => (
                            <div key={addr.id} className="addr-item">
                                <div>
                                    <div style={{fontWeight:700, fontSize:14}}>
                                        {addr.type} {addr.isDefault && <span className="addr-badge">Mặc định</span>}
                                    </div>
                                    <div style={{fontSize:13, color:'#6b7280'}}>{addr.content}</div>
                                </div>
                                <Trash2 size={16} color="#ef4444" style={{cursor:'pointer'}}/>
                            </div>
                        ))}
                    </div>
                    <button className="btn-primary" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                        <Plus size={18}/> Thêm địa chỉ mới
                    </button>
                </div>
            </div>
        )}

        {/* --- MODAL CHỌN NGÔN NGỮ --- */}
        {showLangModal && (
            <div className="modal-overlay" onClick={() => setShowLangModal(false)}>
                <div className="modal-box" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="modal-title">Chọn ngôn ngữ</div>
                        <X style={{cursor:'pointer'}} onClick={() => setShowLangModal(false)}/>
                    </div>
                    {['Tiếng Việt', 'English', '中文 (Chinese)'].map(lang => (
                        <div 
                            key={lang} 
                            onClick={() => {setLanguage(lang); setShowLangModal(false)}}
                            style={{
                                padding: '12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', 
                                display: 'flex', justifyContent: 'space-between', fontWeight: language === lang ? 700 : 400,
                                color: language === lang ? '#ef4444' : '#374151'
                            }}
                        >
                            {lang}
                            {language === lang && <Check size={18}/>}
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default Settings;
import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import { 
  Ticket, Coins, Gift, Copy, CheckCircle, Wallet, RefreshCw, Zap, Tag, ArrowLeft, Filter, Search, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoucherMarket = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('MARKET'); // MARKET | WALLET
  const [vouchers, setVouchers] = useState([]);         // Voucher để săn
  const [myVouchers, setMyVouchers] = useState([]);     // Voucher trong ví
  const [loading, setLoading] = useState(false);
  
  // Filter & Search
  const [filterType, setFilterType] = useState('ALL'); // ALL, EXCHANGE, FREE
  const [searchTerm, setSearchTerm] = useState('');

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const user = JSON.parse(localStorage.getItem('user'));
  const [points, setPoints] = useState(user?.points || 0);

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const refreshData = () => {
    if (activeTab === 'MARKET') fetchMarket();
    else fetchWallet();
  };

  const fetchMarket = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/user-vouchers/available');
      setVouchers(res.data);
    } catch (err) { console.error(err); } 
    finally { setTimeout(() => setLoading(false), 400); }
  };

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/user-vouchers/my-wallet/${user.id}`);
      setMyVouchers(res.data);
    } catch (err) { console.error(err); } 
    finally { setTimeout(() => setLoading(false), 400); }
  };

  const handleExchange = async (voucher) => {
    if (points < voucher.conditionValue) return;

    if (window.confirm(`Xác nhận dùng ${voucher.conditionValue} điểm để đổi Voucher này?`)) {
      try {
        await api.post(`/api/user-vouchers/exchange?userId=${user.id}&voucherId=${voucher.id}`);
        showToast("🎉 Đổi thành công! Voucher đã vào ví.", "success");
        setPoints(prev => prev - voucher.conditionValue);
        
        // Cập nhật lại localStorage để đồng bộ điểm
        const updatedUser = { ...user, points: points - voucher.conditionValue };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        fetchMarket(); 
      } catch (err) {
        showToast(err.response?.data || "Lỗi đổi điểm", "error");
      }
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Đã copy mã: ${code}`, "success");
  };

  // --- FILTER LOGIC ---
  const filteredList = useMemo(() => {
    let data = activeTab === 'MARKET' ? vouchers : myVouchers;
    
    // Lọc theo từ khóa
    if (searchTerm) {
      data = data.filter(item => {
        const v = activeTab === 'MARKET' ? item : item.voucher;
        return v.code.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Lọc theo loại (Chỉ áp dụng cho tab Market)
    if (activeTab === 'MARKET' && filterType !== 'ALL') {
      data = data.filter(v => {
        if (filterType === 'EXCHANGE') return v.type === 'POINT_EXCHANGE';
        if (filterType === 'FREE') return v.type !== 'POINT_EXCHANGE';
        return true;
      });
    }

    return data;
  }, [vouchers, myVouchers, activeTab, searchTerm, filterType]);

  return (
    <div className="market-wrapper">
      <style>{`
        .market-wrapper { max-width: 1000px; margin: 30px auto; padding: 0 20px; font-family: 'Inter', sans-serif; position: relative; }
        
        /* HEADER SECTION */
        .market-header { 
          background: linear-gradient(135deg, #2563eb, #1e40af); 
          color: white; padding: 30px; border-radius: 20px; 
          display: flex; justify-content: space-between; align-items: center; 
          box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4); 
          margin-bottom: 30px; position: relative; overflow: hidden;
        }
        .market-header::before {
          content: ''; position: absolute; top: -50px; right: -50px; width: 150px; height: 150px;
          background: rgba(255,255,255,0.1); border-radius: 50%; pointer-events: none;
        }
        
        .btn-back {
          position: absolute; top: 20px; left: 20px;
          background: rgba(255,255,255,0.2); border: none; 
          border-radius: 50%; width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          color: white; cursor: pointer; transition: 0.2s; z-index: 10;
        }
        .btn-back:hover { background: rgba(255,255,255,0.4); transform: translateX(-3px); }

        .header-title { margin-left: 40px; }
        .header-title h2 { margin: 0; font-size: 26px; font-weight: 800; }
        .header-title p { margin: 5px 0 0; opacity: 0.85; font-size: 14px; }
        
        .points-badge { 
          background: rgba(255, 255, 255, 0.2); 
          padding: 8px 16px; border-radius: 50px; 
          display: flex; align-items: center; gap: 8px; 
          font-weight: 700; font-size: 16px; border: 1px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(5px);
        }

        /* TOOLBAR (Tabs & Filter) */
        .toolbar { 
            display: flex; justify-content: space-between; align-items: center; 
            margin-bottom: 25px; flex-wrap: wrap; gap: 15px; 
        }

        .nav-tabs { 
          display: flex; gap: 5px; background: #f1f5f9; padding: 5px; border-radius: 12px; 
        }
        .nav-item { 
          padding: 8px 20px; border-radius: 8px; border: none; 
          font-weight: 600; cursor: pointer; transition: all 0.3s; 
          color: #64748b; background: transparent; display: flex; align-items: center; gap: 6px; font-size: 13px;
        }
        .nav-item:hover { color: #0f172a; }
        .nav-item.active { 
          background: #fff; color: #2563eb; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
        }

        .filter-group { display: flex; gap: 10px; }
        .search-box { position: relative; }
        .search-inp { 
            padding: 8px 12px 8px 32px; border: 1px solid #e2e8f0; border-radius: 8px; 
            font-size: 13px; outline: none; width: 180px; transition: 0.2s;
        }
        .search-inp:focus { border-color: #2563eb; width: 220px; }
        .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

        .filter-select { 
            padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; 
            font-size: 13px; outline: none; background: white; cursor: pointer; color: #475569;
        }

        /* GRID LAYOUT */
        .voucher-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

        /* TICKET CARD DESIGN */
        .ticket-card { 
          display: flex; background: #fff; border-radius: 16px; overflow: hidden; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; 
          height: 110px; transition: transform 0.2s, box-shadow 0.2s; position: relative;
        }
        .ticket-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #cbd5e1; }

        .ticket-left { 
          width: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; 
          color: #fff; position: relative; border-right: 2px dashed #fff; 
        }
        .ticket-left::after, .ticket-left::before { 
            content: ""; position: absolute; right: -10px; width: 20px; height: 20px; 
            background: #f8fafc; border-radius: 50%; 
        }
        .ticket-left::after { bottom: -10px; }
        .ticket-left::before { top: -10px; }
        
        .bg-exchange { background: linear-gradient(135deg, #f97316, #ea580c); }
        .bg-free { background: linear-gradient(135deg, #10b981, #059669); }
        .bg-wallet { background: linear-gradient(135deg, #6366f1, #4f46e5); }

        .ticket-percent { font-size: 22px; font-weight: 800; line-height: 1; }
        .ticket-label { font-size: 9px; text-transform: uppercase; margin-top: 4px; opacity: 0.9; font-weight: 700; letter-spacing: 0.5px; }

        .ticket-right { flex: 1; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; background: #fff; }
        .ticket-title { font-weight: 700; color: #1e293b; font-size: 14px; margin-bottom: 2px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .ticket-desc { font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 4px; }
        
        .btn-ticket { 
          margin-top: auto; align-self: flex-start; 
          padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; border: none;
          display: flex; align-items: center; gap: 4px; transition: 0.2s;
        }
        .btn-exchange { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
        .btn-exchange:hover { background: #ffedd5; }
        .btn-disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; border: 1px solid #e2e8f0; }

        .btn-save { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }
        .btn-save:hover { background: #d1fae5; }

        .btn-copy { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; width: 100%; justify-content: center; }
        .btn-copy:hover { background: #dbeafe; }

        .state-box { grid-column: 1 / -1; text-align: center; padding: 60px; color: #94a3b8; background: #fff; border-radius: 16px; border: 2px dashed #e2e8f0; }
        
        /* SKELETON */
        .skeleton { height: 110px; background: #e2e8f0; border-radius: 16px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

        /* TOAST */
        .toast-notification { position: fixed; bottom: 30px; right: 30px; background: white; padding: 12px 20px; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 10px; z-index: 9999; animation: slideIn 0.3s ease-out; border-left: 4px solid #10b981; }
        .toast-error { border-left-color: #ef4444; }
        .toast-content { font-weight: 600; font-size: 13px; color: #1f2937; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* HEADER */}
      <div className="market-header">
        <button className="btn-back" onClick={() => navigate('/')} title="Quay về trang chủ">
            <ArrowLeft size={20} />
        </button>

        <div className="header-title">
          <h2>Kho Voucher</h2>
          <p>Dùng điểm tích lũy để đổi lấy ưu đãi độc quyền!</p>
        </div>
        <div className="points-badge">
          <Coins size={20} fill="#fbbf24" color="#fbbf24" />
          <span>{points.toLocaleString()} Điểm</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="nav-tabs">
            <button 
                className={`nav-item ${activeTab === 'MARKET' ? 'active' : ''}`} 
                onClick={() => setActiveTab('MARKET')}
            >
                <Gift size={16} /> Săn Voucher
            </button>
            <button 
                className={`nav-item ${activeTab === 'WALLET' ? 'active' : ''}`} 
                onClick={() => setActiveTab('WALLET')}
            >
                <Wallet size={16} /> Kho Của Tôi
            </button>
        </div>

        <div className="filter-group">
            <div className="search-box">
                <Search size={14} className="search-icon"/>
                <input 
                    className="search-inp" 
                    placeholder="Tìm mã voucher..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {activeTab === 'MARKET' && (
                <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="ALL">Tất cả loại</option>
                    <option value="EXCHANGE">Đổi điểm</option>
                    <option value="FREE">Miễn phí</option>
                </select>
            )}
            <button className="nav-item active" onClick={refreshData} title="Làm mới" style={{padding: '8px', minWidth: 'auto'}}>
                <RefreshCw size={16}/>
            </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="voucher-grid">
        {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="skeleton"></div>)
        ) : (
            filteredList.length > 0 ? filteredList.map(item => {
                // Xử lý dữ liệu tùy theo Tab
                const v = activeTab === 'MARKET' ? item : item.voucher;
                const canExchange = points >= v.conditionValue;
                const isExchange = v.type === 'POINT_EXCHANGE';
                
                return (
                    <div key={activeTab === 'MARKET' ? v.id : item.id} className="ticket-card">
                        <div className={`ticket-left ${activeTab === 'WALLET' ? 'bg-wallet' : (isExchange ? 'bg-exchange' : 'bg-free')}`}>
                            {activeTab === 'WALLET' ? <CheckCircle size={24}/> : (isExchange ? <Zap size={24}/> : <Tag size={24}/>)}
                            <span className="ticket-percent">{v.percent}%</span>
                            <span className="ticket-label">{activeTab === 'WALLET' ? 'SỞ HỮU' : 'GIẢM'}</span>
                        </div>
                        <div className="ticket-right">
                            <div>
                                <div className="ticket-title">Voucher {v.code}</div>
                                <div className="ticket-desc">
                                    {activeTab === 'WALLET' ? (
                                        <span>• HSD: {v.expirationDate ? new Date(v.expirationDate).toLocaleDateString() : 'Vô thời hạn'}</span>
                                    ) : (
                                        isExchange ? (
                                            <span style={{color: canExchange ? '#ea580c' : '#ef4444', fontWeight: 600}}>
                                                • Cần {v.conditionValue.toLocaleString()} điểm
                                            </span>
                                        ) : (
                                            <span>• {v.type === 'REWARD_ORDER' ? 'Quà tặng' : 'Miễn phí'}</span>
                                        )
                                    )}
                                </div>
                                <div className="ticket-desc" style={{marginTop: 2}}>
                                    • Giảm tối đa {v.maxDiscount.toLocaleString()}đ
                                </div>
                            </div>

                            {activeTab === 'MARKET' ? (
                                isExchange ? (
                                    <button 
                                        className={`btn-ticket ${canExchange ? 'btn-exchange' : 'btn-disabled'}`} 
                                        onClick={() => canExchange && handleExchange(v)}
                                        disabled={!canExchange}
                                    >
                                        {canExchange ? 'Đổi ngay' : 'Thiếu điểm'}
                                    </button>
                                ) : (
                                    <button className="btn-ticket btn-save" onClick={() => handleCopy(v.code)}>
                                        <Copy size={12}/> Lưu mã
                                    </button>
                                )
                            ) : (
                                <button className="btn-ticket btn-copy" onClick={() => handleCopy(v.code)}>
                                    <Copy size={12}/> Sao chép mã
                                </button>
                            )}
                        </div>
                    </div>
                )
            }) : (
                <div className="state-box">
                    <Gift size={48} style={{margin:'0 auto 10px', opacity:0.3}}/>
                    <p>Không tìm thấy voucher nào phù hợp.</p>
                </div>
            )
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`toast-notification ${toast.type === 'error' ? 'toast-error' : ''}`}>
          {toast.type === 'success' ? <CheckCircle size={18} color="#10b981" /> : <X size={18} color="#ef4444" />}
          <div className="toast-content">{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default VoucherMarket;
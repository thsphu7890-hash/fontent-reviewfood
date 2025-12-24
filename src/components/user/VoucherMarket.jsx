import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Ticket, Coins, Gift, Copy, CheckCircle, Loader, 
  Wallet, RefreshCw, Zap, Tag, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoucherMarket = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [activeTab, setActiveTab] = useState('MARKET'); // MARKET | WALLET
  const [vouchers, setVouchers] = useState([]);         // Voucher để săn
  const [myVouchers, setMyVouchers] = useState([]);     // Voucher trong ví
  const [loading, setLoading] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const [points, setPoints] = useState(user?.points || 0);

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = () => {
    if (activeTab === 'MARKET') fetchMarket();
    else fetchWallet();
  };

  const fetchMarket = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user-vouchers/available');
      setVouchers(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/user-vouchers/my-wallet/${user.id}`);
      setMyVouchers(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleExchange = async (voucher) => {
    if (points < voucher.conditionValue) return;

    if (window.confirm(`Xác nhận dùng ${voucher.conditionValue} điểm để đổi Voucher này?`)) {
      try {
        await api.post(`/user-vouchers/exchange?userId=${user.id}&voucherId=${voucher.id}`);
        alert("🎉 Đổi thành công! Voucher đã vào ví.");
        setPoints(prev => prev - voucher.conditionValue);
        fetchMarket(); 
      } catch (err) {
        alert(err.response?.data || "Lỗi đổi điểm");
      }
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã: ${code}`);
  };

  return (
    <div className="market-wrapper">
      <style>{`
        .market-wrapper { max-width: 1000px; margin: 30px auto; padding: 0 20px; font-family: 'Inter', sans-serif; }
        
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
        
        /* BACK BUTTON */
        .btn-back {
          position: absolute; top: 20px; left: 20px;
          background: rgba(255,255,255,0.2); border: none; 
          border-radius: 50%; width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          color: white; cursor: pointer; transition: 0.2s; z-index: 10;
        }
        .btn-back:hover { background: rgba(255,255,255,0.4); transform: translateX(-3px); }

        .header-title { margin-left: 40px; } /* Thêm margin để tránh đè nút back */
        .header-title h2 { margin: 0; font-size: 26px; font-weight: 800; }
        .header-title p { margin: 5px 0 0; opacity: 0.85; font-size: 14px; }
        
        .points-badge { 
          background: rgba(255, 255, 255, 0.2); 
          padding: 8px 16px; border-radius: 50px; 
          display: flex; align-items: center; gap: 8px; 
          font-weight: 700; font-size: 16px; border: 1px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(5px);
        }

        /* TABS */
        .nav-tabs { 
          display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; 
          background: #f1f5f9; padding: 6px; border-radius: 16px; width: fit-content; margin-left: auto; margin-right: auto;
        }
        .nav-item { 
          padding: 10px 30px; border-radius: 12px; border: none; 
          font-weight: 600; cursor: pointer; transition: all 0.3s; 
          color: #64748b; background: transparent; display: flex; align-items: center; gap: 8px; font-size: 14px;
        }
        .nav-item:hover { color: #0f172a; }
        .nav-item.active { 
          background: #fff; color: #2563eb; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); 
        }

        /* GRID LAYOUT */
        .voucher-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }

        /* TICKET CARD DESIGN */
        .ticket-card { 
          display: flex; background: #fff; border-radius: 16px; overflow: hidden; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; 
          height: 120px; transition: transform 0.2s, box-shadow 0.2s; position: relative;
        }
        .ticket-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1); border-color: #cbd5e1; }

        /* Left Side (Icon & Percent) */
        .ticket-left { 
          width: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; 
          color: #fff; position: relative; 
          border-right: 2px dashed #fff; 
        }
        .ticket-left::after { content: ""; position: absolute; bottom: -10px; right: -10px; width: 20px; height: 20px; background: #f8fafc; border-radius: 50%; }
        .ticket-left::before { content: ""; position: absolute; top: -10px; right: -10px; width: 20px; height: 20px; background: #f8fafc; border-radius: 50%; }
        
        .bg-exchange { background: linear-gradient(135deg, #f97316, #ea580c); }
        .bg-free { background: linear-gradient(135deg, #10b981, #059669); }
        .bg-wallet { background: linear-gradient(135deg, #6366f1, #4f46e5); }

        .ticket-percent { font-size: 24px; font-weight: 800; line-height: 1; }
        .ticket-label { font-size: 10px; text-transform: uppercase; margin-top: 4px; opacity: 0.9; }

        /* Right Side */
        .ticket-right { flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; background: #fff; }
        .ticket-title { font-weight: 700; color: #1e293b; font-size: 15px; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .ticket-desc { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px; }
        
        /* Buttons */
        .btn-ticket { 
          margin-top: auto; align-self: flex-start; 
          padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; border: none;
          display: flex; align-items: center; gap: 5px; transition: 0.2s;
        }
        .btn-exchange { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
        .btn-exchange:hover { background: #ffedd5; }
        .btn-disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; border: 1px solid #e2e8f0; }

        .btn-save { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }
        .btn-save:hover { background: #d1fae5; }

        .btn-copy { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; width: 100%; justify-content: center; }
        .btn-copy:hover { background: #dbeafe; }

        .state-box { grid-column: 1 / -1; text-align: center; padding: 60px; color: #94a3b8; background: #fff; border-radius: 16px; border: 1px dashed #cbd5e1; }
      `}</style>

      {/* HEADER */}
      <div className="market-header">
        {/* NÚT BACK */}
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

      {/* TABS */}
      <div className="nav-tabs">
        <button 
          className={`nav-item ${activeTab === 'MARKET' ? 'active' : ''}`} 
          onClick={() => setActiveTab('MARKET')}
        >
          <Gift size={18} /> Săn Voucher
        </button>
        <button 
          className={`nav-item ${activeTab === 'WALLET' ? 'active' : ''}`} 
          onClick={() => setActiveTab('WALLET')}
        >
          <Wallet size={18} /> Kho Của Tôi
        </button>
        <button className="nav-item" onClick={refreshData} title="Làm mới">
            <RefreshCw size={16}/>
        </button>
      </div>

      {/* CONTENT */}
      <div className="voucher-grid">
        {loading ? (
            <div className="state-box"><Loader className="animate-spin" style={{margin:'0 auto'}}/></div>
        ) : (
            <>
                {/* --- TAB: MARKET --- */}
                {activeTab === 'MARKET' && (
                    vouchers.length > 0 ? vouchers.map(v => {
                        const canExchange = points >= v.conditionValue;
                        const isExchange = v.type === 'POINT_EXCHANGE';
                        
                        return (
                            <div key={v.id} className="ticket-card">
                                <div className={`ticket-left ${isExchange ? 'bg-exchange' : 'bg-free'}`}>
                                    {isExchange ? <Zap size={24}/> : <Tag size={24}/>}
                                    <span className="ticket-percent">{v.percent}%</span>
                                    <span className="ticket-label">GIẢM</span>
                                </div>
                                <div className="ticket-right">
                                    <div>
                                        <div className="ticket-title">Voucher {v.code}</div>
                                        <div className="ticket-desc">
                                            {isExchange ? (
                                                <span style={{color: canExchange ? '#ea580c' : '#ef4444', fontWeight: 600}}>
                                                    • Cần {v.conditionValue.toLocaleString()} điểm
                                                </span>
                                            ) : (
                                                <span>• {v.type === 'REWARD_ORDER' ? 'Quà tặng' : 'Miễn phí'}</span>
                                            )}
                                        </div>
                                        <div className="ticket-desc" style={{marginTop: 2}}>
                                            • Giảm tối đa {v.maxDiscount.toLocaleString()}đ
                                        </div>
                                    </div>

                                    {isExchange ? (
                                        <button 
                                            className={`btn-ticket ${canExchange ? 'btn-exchange' : 'btn-disabled'}`} 
                                            onClick={() => canExchange && handleExchange(v)}
                                            disabled={!canExchange}
                                        >
                                            {canExchange ? 'Đổi ngay' : 'Thiếu điểm'}
                                        </button>
                                    ) : (
                                        <button className="btn-ticket btn-save" onClick={() => handleCopy(v.code)}>
                                            <Copy size={14}/> Lưu mã
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    }) : <div className="state-box">Hết voucher để đổi rồi. Quay lại sau nhé!</div>
                )}

                {/* --- TAB: WALLET --- */}
                {activeTab === 'WALLET' && (
                    myVouchers.length > 0 ? myVouchers.map(uv => (
                        <div key={uv.id} className="ticket-card">
                            <div className="ticket-left bg-wallet">
                                <CheckCircle size={24}/>
                                <span className="ticket-percent">{uv.voucher.percent}%</span>
                                <span className="ticket-label">SỞ HỮU</span>
                            </div>
                            <div className="ticket-right">
                                <div>
                                    <div className="ticket-title">{uv.voucher.code}</div>
                                    <div className="ticket-desc">
                                        • HSD: {uv.voucher.expirationDate ? new Date(uv.voucher.expirationDate).toLocaleDateString() : 'Vô thời hạn'}
                                    </div>
                                    <div className="ticket-desc" style={{marginTop: 2}}>
                                        • Giảm tối đa {uv.voucher.maxDiscount.toLocaleString()}đ
                                    </div>
                                </div>
                                <button className="btn-ticket btn-copy" onClick={() => handleCopy(uv.voucher.code)}>
                                    <Copy size={14}/> Sao chép mã
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="state-box">
                            <Gift size={40} style={{opacity:0.2, marginBottom: 10}}/>
                            <p>Ví trống trơn. Hãy sang tab "Săn Voucher" để đổi quà nhé!</p>
                        </div>
                    )
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default VoucherMarket;
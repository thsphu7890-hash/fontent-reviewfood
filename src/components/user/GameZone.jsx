import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Gift, LogIn, ChevronRight, Trophy, Sparkles, X, ArrowLeft } from 'lucide-react'; // Thêm ArrowLeft

const GameZone = () => {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  const user = JSON.parse(localStorage.getItem('user'));

  // --- 1. GIAO DIỆN CHƯA ĐĂNG NHẬP ---
  if (!user) {
    return (
      <div className="login-wrapper">
        <style>{`
            .login-wrapper { min-height: 60vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; }
            .login-card { background: white; padding: 40px; border-radius: 24px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 400px; width: 90%; }
            .icon-circle { width: 80px; height: 80px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #3b82f6; }
            .btn-login { background: #111827; color: white; border: none; padding: 14px 30px; border-radius: 12px; font-weight: 600; margin-top: 20px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.3s; }
            .btn-login:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        `}</style>
        <div className="login-card">
          <div className="icon-circle"><LogIn size={40} /></div>
          <h2 style={{margin: '0 0 10px', color: '#1f2937'}}>Đăng nhập để chơi</h2>
          <p style={{color: '#6b7280', margin: 0}}>Hãy đăng nhập để tham gia vòng quay may mắn và nhận hàng ngàn Voucher hấp dẫn!</p>
          <button className="btn-login" onClick={() => navigate('/login')}>
             Đăng nhập ngay <ChevronRight size={18}/>
          </button>
        </div>
      </div>
    );
  }

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowModal(false);

    try {
      const res = await api.post(`/user-vouchers/play-game/${user.id}`);
      const msg = res.data;
      const isWin = msg.toLowerCase().includes("chúc mừng") || msg.toLowerCase().includes("trúng");

      const randomOffset = Math.floor(Math.random() * 360); 
      const newRotation = rotation + (360 * 5) + randomOffset;
      
      setRotation(newRotation);

      setTimeout(() => {
        setResult({ message: msg, isWin });
        setShowModal(true);
        setIsSpinning(false);
      }, 4000);

    } catch (error) {
      console.error(error);
      setIsSpinning(false);
      alert("Lỗi kết nối hoặc bạn đã hết lượt quay!");
    }
  };

  return (
    <div className="game-wrapper">
      <style>{`
        .game-wrapper {
            background: #0f172a;
            min-height: 90vh;
            display: flex;
            flex-direction: column; /* Đổi sang column để Header ở trên */
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
            position: relative;
            overflow: hidden;
            padding: 20px;
        }

        /* Nút thoát ở góc trên trái */
        .exit-button {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 100;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 10px 15px;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: 0.3s;
            backdrop-filter: blur(5px);
        }
        .exit-button:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(-5px);
        }

        .glow { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
        .game-content { position: relative; z-index: 10; text-align: center; color: white; }
        .header-badge { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 50px; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; margin-bottom: 20px; color: #fbbf24; }
        h1.game-title { font-size: 42px; font-weight: 900; margin: 0 0 40px; background: linear-gradient(to right, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-transform: uppercase; letter-spacing: 2px; filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.5)); }
        .wheel-container { position: relative; width: 320px; height: 320px; margin: 0 auto 50px; }
        .wheel-marker { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 40px; height: 40px; z-index: 20; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
        .wheel-marker::after { content: ''; position: absolute; top: 0; left: 0; border-left: 20px solid transparent; border-right: 20px solid transparent; border-top: 35px solid #ef4444; }
        .the-wheel { width: 100%; height: 100%; border-radius: 50%; border: 8px solid #1e293b; box-shadow: 0 0 0 4px #fbbf24, 0 0 50px rgba(251, 191, 36, 0.2); position: relative; overflow: hidden; transition: transform 4s cubic-bezier(0.1, 0.7, 0.1, 1); }
        .wheel-segments { width: 100%; height: 100%; background: conic-gradient(#ef4444 0deg 60deg, #f59e0b 60deg 120deg, #3b82f6 120deg 180deg, #10b981 180deg 240deg, #8b5cf6 240deg 300deg, #ec4899 300deg 360deg); border-radius: 50%; }
        .wheel-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: white; border-radius: 50%; border: 4px solid #fbbf24; z-index: 5; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0,0,0,0.2); }
        .btn-spin { background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); border: none; width: 200px; padding: 18px; border-radius: 50px; color: #451a03; font-size: 20px; font-weight: 800; text-transform: uppercase; cursor: pointer; transition: 0.2s; box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); position: relative; overflow: hidden; }
        .btn-spin:hover { transform: scale(1.05); filter: brightness(1.1); }
        .btn-spin:active { transform: scale(0.95); }
        .btn-spin:disabled { filter: grayscale(1); cursor: not-allowed; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s; }
        .modal-content { background: #1e293b; border: 1px solid #334155; padding: 40px; border-radius: 24px; text-align: center; max-width: 400px; width: 90%; position: relative; animation: popUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #64748b; cursor: pointer; }
        .prize-icon { width: 80px; height: 80px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #fbbf24; box-shadow: 0 0 20px rgba(251, 191, 36, 0.2); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Nút thoát */}
      <button className="exit-button" onClick={() => navigate('/')}>
        <ArrowLeft size={20} /> Thoát
      </button>

      <div className="glow"></div>

      <div className="game-content">
        <div className="header-badge">
           <Sparkles size={16}/> Săn Voucher FoodNest
        </div>
        <h1 className="game-title">VÒNG QUAY MAY MẮN</h1>
        
        <div className="wheel-container">
            <div className="wheel-marker"></div>
            <div className="the-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
                <div className="wheel-segments"></div>
            </div>
            <div className="wheel-center">
                <Gift size={24} color="#d97706"/>
            </div>
        </div>

        <button className="btn-spin" onClick={handleSpin} disabled={isSpinning}>
            {isSpinning ? 'ĐANG QUAY...' : 'QUAY NGAY'}
        </button>

        <p style={{marginTop: 20, color: '#94a3b8', fontSize: 14}}>
           *Mỗi lượt quay tốn 500 điểm tích lũy
        </p>
      </div>

      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={() => setShowModal(false)}><X size={24}/></button>
                <div className="prize-icon">
                    {result.isWin ? <Trophy size={40}/> : <X size={40}/>}
                </div>
                <h2 style={{color: result.isWin ? '#4ade80' : '#f87171', margin: '0 0 10px', fontSize: 24}}>
                    {result.isWin ? 'CHÚC MỪNG!' : 'RẤT TIẾC!'}
                </h2>
                <p style={{color: '#e2e8f0', fontSize: 16, lineHeight: 1.5, marginBottom: 25}}>
                    {result.message}
                </p>
                <button className="btn-spin" style={{width: '100%', fontSize: 16, padding: 14}} onClick={() => setShowModal(false)}>
                    Xác nhận
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default GameZone;
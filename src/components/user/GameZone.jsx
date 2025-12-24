import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Gamepad2, Gift, XCircle, LogIn } from 'lucide-react';

const GameZone = () => {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null); // null | { message, isWin }
  
  // Lấy thông tin user từ LocalStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // --- 1. KIỂM TRA ĐĂNG NHẬP ---
  if (!user) {
    return (
      <div className="game-container">
        <style>{`
            .game-container { max-width: 600px; margin: 60px auto; text-align: center; font-family: 'Inter', sans-serif; }
            .login-box { background: #fff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .btn-login { background: #0f172a; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; }
            .btn-login:hover { background: #334155; }
        `}</style>
        <div className="login-box">
            <LogIn size={48} color="#94a3b8" style={{marginBottom: '16px'}}/>
            <h2 style={{color: '#1e293b'}}>Vui lòng đăng nhập</h2>
            <p style={{color: '#64748b'}}>Bạn cần đăng nhập để tham gia vòng quay may mắn và nhận quà.</p>
            <button className="btn-login" onClick={() => navigate('/login')}>
                Đăng nhập ngay
            </button>
        </div>
      </div>
    );
  }

  // --- 2. XỬ LÝ QUAY THƯỞNG ---
  const handlePlay = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);

    // Giả lập hiệu ứng chờ 2 giây cho hồi hộp
    setTimeout(async () => {
      try {
        // Gọi API Backend
        const res = await api.post(`/user-vouchers/play-game/${user.id}`);
        const msg = res.data; 
        
        setResult({
            message: msg,
            isWin: msg.toLowerCase().includes("chúc mừng") || msg.includes("trúng"), // Kiểm tra từ khóa thắng
        });
      } catch (error) {
        console.error(error);
        setResult({ message: "Lỗi kết nối server! Vui lòng thử lại.", isWin: false });
      } finally {
        setIsSpinning(false);
      }
    }, 2000);
  };

  return (
    <div className="game-container">
      <style>{`
        .game-container { max-width: 600px; margin: 40px auto; text-align: center; font-family: 'Inter', sans-serif; padding: 0 20px; }
        .game-box { background: #fff; padding: 40px; border-radius: 24px; box-shadow: 0 20px 50px -10px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
        
        .game-title { font-size: 28px; font-weight: 900; color: #1e293b; margin-bottom: 8px; }
        .game-desc { color: #64748b; margin-bottom: 32px; }
        
        /* Vòng quay */
        .spin-wheel { width: 120px; height: 120px; background: #f43f5e; border-radius: 50%; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 8px #fecdd3; transition: 0.5s; }
        .spin-wheel.spinning { animation: spin 0.5s linear infinite; }
        
        /* Nút bấm */
        .btn-play { background: #0f172a; color: #fff; border: none; padding: 16px 40px; font-size: 18px; font-weight: 700; border-radius: 50px; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.3); outline: none; }
        .btn-play:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.4); }
        .btn-play:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Kết quả */
        .result-box { margin-top: 30px; padding: 24px; background: #f0fdf4; border: 2px dashed #4ade80; border-radius: 16px; color: #166534; animation: popIn 0.3s; }
        .result-box.lose { background: #fef2f2; border-color: #fca5a5; color: #991b1b; }
        .result-title { font-size: 18px; font-weight: 700; margin: 8px 0; }
        
        .btn-replay { margin-top: 16px; background: none; border: none; color: #3b82f6; font-weight: 600; cursor: pointer; text-decoration: underline; font-size: 15px; }
        .btn-replay:hover { color: #1d4ed8; }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <div className="game-box">
        <h1 className="game-title">Vòng Quay May Mắn</h1>
        <p className="game-desc">Chào <b>{user.fullName}</b>! Thử vận may - Nhận Voucher ngay!</p>
        
        <div className={`spin-wheel ${isSpinning ? 'spinning' : ''}`}>
            <Gamepad2 size={48} color="#fff"/>
        </div>

        {!result ? (
            <button className="btn-play" onClick={handlePlay} disabled={isSpinning}>
                {isSpinning ? 'Đang quay...' : 'QUAY NGAY'}
            </button>
        ) : (
            <div>
                <div className={`result-box ${result.isWin ? '' : 'lose'}`}>
                    {result.isWin ? <Gift size={40} className="animate-bounce" /> : <XCircle size={40} />}
                    <div className="result-title">{result.isWin ? 'XIN CHÚC MỪNG!' : 'RẤT TIẾC!'}</div>
                    <p style={{margin:0}}>{result.message}</p>
                </div>
                <button className="btn-replay" onClick={() => setResult(null)}>
                    Chơi lại lần nữa
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default GameZone;
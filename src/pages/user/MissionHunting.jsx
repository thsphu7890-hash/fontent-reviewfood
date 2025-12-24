import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Gift, CheckCircle, Lock, Trophy, Target, Zap } from 'lucide-react';

const MissionHunting = () => {
  const [missions, setMissions] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      // ✅ SỬA LỖI: Xóa chữ /api ở đầu
      const res = await api.get(`/missions/user/${user.id}`);
      setMissions(res.data);
    } catch (err) {
      console.error("Lỗi tải nhiệm vụ", err);
    }
  };

  const handleClaim = async (missionId) => {
    try {
      // ✅ SỬA LỖI: Xóa chữ /api ở đầu
      await api.post(`/missions/${missionId}/claim?userId=${user.id}`);
      alert("🎉 Chúc mừng! Bạn đã nhận được Voucher.");
      fetchMissions(); // Tải lại để cập nhật nút "Đã nhận"
    } catch (err) {
      alert(err.response?.data || "Lỗi nhận quà");
    }
  };

  // Tính phần trăm tiến độ (Max 100%)
  const getProgress = (current, target) => Math.min((current / target) * 100, 100);

  return (
    <div className="mission-container">
      <style>{`
        .mission-container { padding: 20px; font-family: 'Inter', sans-serif; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .m-header { text-align: center; margin-bottom: 30px; }
        .m-title { font-size: 24px; font-weight: 800; color: #111827; display: flex; align-items: center; justify-content: center; gap: 10px; }
        
        .mission-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .mission-card { border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; position: relative; overflow: hidden; transition: 0.3s; background: #fff; }
        .mission-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); border-color: #3b82f6; }
        
        .card-top { display: flex; gap: 15px; margin-bottom: 15px; }
        .m-icon-box { width: 50px; height: 50px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3b82f6; }
        
        .progress-bg { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; margin: 15px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); transition: width 0.5s ease; }
        
        .btn-claim { width: 100%; padding: 10px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .btn-ready { background: #10b981; color: white; animation: pulse 2s infinite; }
        .btn-done { background: #e5e7eb; color: #9ca3af; cursor: default; }
        .btn-lock { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }

        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
      `}</style>

      <div className="m-header">
        <h2 className="m-title"><Trophy size={28} color="#eab308" /> Săn Thưởng & Nhận Quà</h2>
        <p style={{color: '#6b7280'}}>Hoàn thành các thử thách bên dưới để nhận Voucher giảm giá cực sốc!</p>
      </div>

      <div className="mission-grid">
        {missions.length > 0 ? missions.map(m => (
          <div key={m.id} className="mission-card">
            <div className="card-top">
                <div className="m-icon-box">
                    {m.icon === 'zap' ? <Zap /> : m.icon === 'target' ? <Target /> : <Gift />}
                </div>
                <div>
                    <h3 style={{fontSize: 16, fontWeight: 700, margin: 0}}>{m.title}</h3>
                    <p style={{fontSize: 13, color: '#6b7280', margin: '4px 0'}}>{m.description}</p>
                    <div style={{fontSize: 12, fontWeight: 600, color: '#3b82f6'}}>
                        Phần thưởng: Voucher {m.rewardVoucherCode || '???'}
                    </div>
                </div>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:600}}>
                <span>Tiến độ</span>
                <span>{m.currentValue} / {m.targetValue}</span>
            </div>
            
            <div className="progress-bg">
                <div className="progress-fill" style={{width: `${getProgress(m.currentValue, m.targetValue)}%`}}></div>
            </div>

            {m.claimed ? (
                <button className="btn-claim btn-done">
                    <CheckCircle size={18}/> Đã nhận quà
                </button>
            ) : m.completed ? (
                <button className="btn-claim btn-ready" onClick={() => handleClaim(m.id)}>
                    <Gift size={18}/> NHẬN NGAY
                </button>
            ) : (
                <button className="btn-claim btn-lock">
                    <Lock size={18}/> Chưa hoàn thành
                </button>
            )}
          </div>
        )) : (
            <p style={{textAlign: 'center', width: '100%', gridColumn: '1/-1', color: '#9ca3af'}}>
                Chưa có nhiệm vụ nào.
            </p>
        )}
      </div>
    </div>
  );
};

export default MissionHunting;
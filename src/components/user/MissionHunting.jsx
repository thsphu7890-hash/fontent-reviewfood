import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Circle, Gift, Loader2, ArrowLeft, Ticket, RefreshCcw, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const MissionHunting = () => {
  const navigate = useNavigate();
  
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
  
  // Dữ liệu User & Game
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(1); // Chuỗi điểm danh
  const [isCheckedIn, setIsCheckedIn] = useState(false); // Hôm nay đã điểm danh chưa?
  const [missions, setMissions] = useState([]);

  // --- 1. KHỞI TẠO DỮ LIỆU ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Gọi song song các API cần thiết
      const [userRes, missionRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/missions') // Backend trả về danh sách nhiệm vụ + trạng thái điểm danh
      ]);

      setTotalPoints(userRes.data.points || 0);
      setMissions(missionRes.data);
      
      // Giả lập lấy thông tin điểm danh từ API (Nếu backend có trả về)
      // setStreak(missionRes.data.streak || 1);
      // setIsCheckedIn(missionRes.data.isCheckedIn || false);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      loadMockData(); // Fallback về dữ liệu giả nếu lỗi
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // --- 2. DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
  const loadMockData = () => {
    setMissions([
      { id: 1, title: 'Đăng nhập mỗi ngày', points: 10, current: 1, target: 1, done: false },
      { id: 2, title: 'Đặt đơn hàng đầu tiên', points: 50, current: 0, target: 1, done: false },
      { id: 3, title: 'Đánh giá 5 sao', points: 20, current: 3, target: 5, done: false },
      { id: 4, title: 'Chia sẻ ứng dụng', points: 100, current: 1, target: 1, done: true }, // Nhiệm vụ đã xong
    ]);
    setTotalPoints(1250);
    setStreak(3); // Giả sử đã điểm danh 3 ngày liên tiếp
    setIsCheckedIn(false); // Hôm nay chưa điểm danh
    
    if (!refreshing) toast("Chế độ xem thử (Mock Data)", { icon: '🎮', duration: 2000 });
  };

  // --- 3. XỬ LÝ ĐIỂM DANH HÀNG NGÀY ---
  const handleDailyCheckIn = async () => {
    if (isCheckedIn) return;

    try {
        // Gọi API điểm danh: await api.post('/missions/check-in');
        await new Promise(r => setTimeout(r, 600)); // Fake delay

        setIsCheckedIn(true);
        setStreak(prev => prev + 1);
        setTotalPoints(prev => prev + 100); // Tặng 100 xu khi điểm danh
        
        toast.success(
            <div className="text-center">
                <p className="font-bold">Điểm danh thành công!</p>
                <p className="text-sm">Bạn nhận được +100 xu</p>
            </div>
        );
    } catch (error) {
        toast.error("Lỗi kết nối, thử lại sau!");
    }
  };

  // --- 4. XỬ LÝ NHẬN THƯỞNG NHIỆM VỤ ---
  const handleClaim = async (id, points) => {
    try {
      // await api.post(`/missions/${id}/claim`);
      await new Promise(r => setTimeout(r, 500)); 

      // Optimistic Update (Cập nhật giao diện trước khi reload)
      setMissions(prev => prev.map(m => 
        m.id === id ? { ...m, done: true } : m
      ));
      setTotalPoints(prev => prev + points);
      
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Gift className="h-10 w-10 text-yellow-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Nhiệm vụ hoàn thành!</p>
                <p className="mt-1 text-sm text-gray-500">Cộng ngay +{points} xu vào ví.</p>
              </div>
            </div>
          </div>
        </div>
      ));
      
    } catch (error) {
      toast.error("Không thể nhận thưởng lúc này.");
    }
  };

  // --- 5. LỌC NHIỆM VỤ THEO TAB ---
  const filteredMissions = missions.filter(m => 
    activeTab === 'active' ? !m.done : m.done
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="mission-container">
      {/* --- HEADER BANNER --- */}
      <div className="mission-banner">
        <div className="banner-top-actions">
            <button className="btn-icon-glass" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
            </button>
            <button className="btn-icon-glass" onClick={handleRefresh}>
                <RefreshCcw size={20} className={refreshing ? "animate-spin" : ""} />
            </button>
        </div>

        <div className="banner-content">
          <div className="trophy-wrapper">
             <Trophy size={40} className="text-yellow-300 drop-shadow-lg animate-bounce" />
          </div>
          <h1>Săn Xu Đổi Quà</h1>
          <div className="points-display">
            <span className="text-sm opacity-90">Số dư hiện tại</span>
            <strong className="text-2xl">{totalPoints.toLocaleString()} xu</strong>
          </div>
          
          <button className="btn-exchange" onClick={() => navigate('/vouchers')}>
            <Ticket size={16} /> Đổi Voucher ngay
          </button>
        </div>
      </div>

      {/* --- ĐIỂM DANH (DAILY CHECK-IN) --- */}
      <div className="section-container">
        <div className="section-header">
            <h3><Calendar size={18} className="text-orange-500"/> Điểm danh nhận quà</h3>
            <span className="streak-badge">Chuỗi {streak} ngày 🔥</span>
        </div>
        
        <div className="daily-scroll">
            {[1, 2, 3, 4, 5, 6, 7].map(day => {
                const isPast = day <= streak;
                const isToday = day === streak + 1;
                
                return (
                    <div 
                        key={day} 
                        onClick={() => isToday && !isCheckedIn ? handleDailyCheckIn() : null}
                        className={`day-box ${isPast ? 'past' : ''} ${isToday && !isCheckedIn ? 'today-active' : ''}`}
                    >
                        <span className="day-label">Ngày {day}</span>
                        <div className="gift-icon">
                            {isPast ? <CheckCircle size={20} /> : <Gift size={20} />}
                        </div>
                        <small className="coin-value">+{day * 10}</small>
                    </div>
                );
            })}
        </div>
      </div>

      {/* --- DANH SÁCH NHIỆM VỤ --- */}
      <div className="section-container" style={{paddingBottom: 40}}>
        <div className="tabs">
            <button 
                className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
            >
                Đang thực hiện ({missions.filter(m => !m.done).length})
            </button>
            <button 
                className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
            >
                Đã xong ({missions.filter(m => m.done).length})
            </button>
        </div>

        <div className="mission-list">
            {filteredMissions.length === 0 ? (
                <div className="empty-state">
                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="Empty" width="60" className="opacity-50 grayscale"/>
                    <p>Không có nhiệm vụ nào ở đây</p>
                </div>
            ) : (
                filteredMissions.map(mission => (
                    <div key={mission.id} className={`mission-card ${mission.done ? 'card-done' : ''}`}>
                        <div className="mission-left">
                            <div className="mission-icon-box">
                                {mission.done ? <CheckCircle className="text-green-500" /> : <Circle className="text-gray-300" />}
                            </div>
                            <div className="mission-info">
                                <h4>{mission.title}</h4>
                                {!mission.done && (
                                    <div className="progress-wrapper">
                                        <div className="progress-track">
                                            <div className="progress-fill" style={{width: `${Math.min((mission.current/mission.target)*100, 100)}%`}}></div>
                                        </div>
                                        <span className="progress-text">{mission.current}/{mission.target}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mission-action">
                            {mission.done ? (
                                <span className="text-green-600 font-bold text-sm">Đã nhận</span>
                            ) : (
                                mission.current >= mission.target ? (
                                    <button className="btn-claim" onClick={() => handleClaim(mission.id, mission.points)}>
                                        Nhận {mission.points}
                                    </button>
                                ) : (
                                    <span className="points-badge">+{mission.points}</span>
                                )
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* --- CSS STYLES --- */}
      <style>{`
        .mission-container { max-width: 600px; margin: 0 auto; min-height: 100vh; background: #f8fafc; }
        
        /* Banner */
        .mission-banner { 
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
            padding: 20px; color: white; border-radius: 0 0 30px 30px; 
            box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.4);
        }
        .banner-top-actions { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .btn-icon-glass { background: rgba(255,255,255,0.2); border: none; padding: 10px; border-radius: 50%; color: white; cursor: pointer; transition: 0.2s; }
        .btn-icon-glass:hover { background: rgba(255,255,255,0.3); }
        
        .banner-content { text-align: center; }
        .banner-content h1 { font-size: 22px; margin: 10px 0 5px; font-weight: 800; }
        .points-display { display: flex; flex-direction: column; align-items: center; margin-bottom: 15px; }
        .btn-exchange { 
            background: white; color: #ea580c; border: none; padding: 8px 16px; 
            border-radius: 20px; font-weight: 700; font-size: 14px; 
            display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;
        }
        .btn-exchange:active { transform: scale(0.95); }

        /* Section Global */
        .section-container { padding: 20px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .section-header h3 { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #334155; margin: 0; }
        .streak-badge { background: #fee2e2; color: #ef4444; font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 10px; }

        /* Daily Check-in */
        .daily-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
        .day-box { 
            background: white; border: 1px solid #e2e8f0; border-radius: 12px; 
            min-width: 70px; padding: 10px 5px; display: flex; flex-direction: column; 
            align-items: center; gap: 8px; transition: 0.2s; cursor: default;
        }
        .day-box.past { background: #dcfce7; border-color: #86efac; color: #166534; }
        .day-box.today-active { 
            background: #fff7ed; border-color: #f97316; cursor: pointer; 
            animation: pulse-border 1.5s infinite; transform: scale(1.05); 
        }
        .day-label { font-size: 11px; font-weight: 600; }
        .coin-value { font-size: 10px; font-weight: 700; color: #f59e0b; }
        
        /* Tabs */
        .tabs { display: flex; background: #e2e8f0; padding: 4px; border-radius: 12px; margin-bottom: 20px; }
        .tab-btn { flex: 1; padding: 8px; border: none; background: transparent; border-radius: 10px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; transition: 0.2s; }
        .tab-btn.active { background: white; color: #0f172a; shadow: 0 2px 4px rgba(0,0,0,0.05); }

        /* Mission List */
        .empty-state { text-align: center; padding: 40px 0; color: #94a3b8; font-size: 14px; }
        .mission-card { background: white; border-radius: 16px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }
        .card-done { opacity: 0.7; background: #f8fafc; }
        
        .mission-left { display: flex; align-items: center; gap: 12px; flex: 1; }
        .mission-info h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1e293b; }
        
        .progress-wrapper { display: flex; align-items: center; gap: 8px; }
        .progress-track { flex: 1; width: 80px; height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: #22c55e; transition: width 0.5s ease; }
        .progress-text { font-size: 10px; color: #64748b; font-weight: 600; }

        .btn-claim { background: #f97316; color: white; border: none; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3); transition: 0.2s; }
        .btn-claim:active { transform: scale(0.95); }
        .points-badge { background: #fffbeb; color: #f59e0b; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid #fef3c7; }

        @keyframes pulse-border { 0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); } 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); } }
      `}</style>
    </div>
  );
};

export default MissionHunting;
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Trophy, Trash2, Plus, Gift, Target, Zap, 
  LayoutList, CheckCircle, Calendar, DollarSign, ShoppingBag 
} from 'lucide-react';

const MissionManager = () => {
  const [missions, setMissions] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newMission, setNewMission] = useState({
    title: '', description: '', type: 'ORDER_COUNT', targetValue: 1, 
    rewardVoucherId: '', icon: 'gift', frequency: 'ONCE'
  });

  useEffect(() => { fetchMissions(); fetchVouchers(); }, []);

  // 1. Lấy danh sách nhiệm vụ (ADMIN VIEW)
  const fetchMissions = async () => {
    try {
        setLoading(true);
        // Gọi API lấy toàn bộ danh sách nhiệm vụ hệ thống
        const res = await api.get('/api/missions'); 
        setMissions(Array.isArray(res.data) ? res.data : []);
    } catch(e) { 
        console.error("Lỗi lấy danh sách:", e);
    } finally {
        setLoading(false);
    }
  };

  const fetchVouchers = async () => {
      try { const res = await api.get('/api/vouchers'); setVouchers(res.data); } 
      catch(e) { console.error(e); }
  };

  const handleCreate = async () => {
    if(!newMission.title || !newMission.rewardVoucherId) return alert("Vui lòng điền đủ thông tin bắt buộc!");
    
    try {
        await api.post('/api/missions', newMission); // API chuẩn RESTful thường là POST /missions
        fetchMissions();
        setNewMission({ 
            title: '', description: '', type: 'ORDER_COUNT', targetValue: 1, 
            rewardVoucherId: '', icon: 'gift', frequency: 'ONCE' 
        });
        alert("Thêm nhiệm vụ mới thành công!");
    } catch(e) { 
        console.error(e);
        alert("Lỗi khi thêm nhiệm vụ."); 
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này không?")) {
          try {
              await api.delete(`/api/missions/${id}`);
              setMissions(missions.filter(m => m.id !== id));
          } catch (e) {
              alert("Không thể xóa nhiệm vụ này.");
          }
      }
  };

  // Helper render Icon
  const renderIcon = (iconName) => {
      switch(iconName) {
          case 'zap': return <Zap size={24} color="#3b82f6" />;
          case 'target': return <Target size={24} color="#ef4444" />;
          default: return <Gift size={24} color="#eab308" />;
      }
  };

  return (
    <div className="mission-page">
      <style>{`
        .mission-page { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; color: #1e293b; }
        
        /* Header */
        .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; }
        .page-header h2 { font-size: 28px; fontWeight: 800; margin: 0; background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        /* Card Layout */
        .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        
        /* Form Inputs */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group label { display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 8px; }
        .inp { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; outline: none; transition: 0.2s; background: #f8fafc; }
        .inp:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        
        /* Button */
        .btn-add { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; margin-top: 20px; }
        .btn-add:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }

        /* List Item */
        .mission-list { display: grid; gap: 16px; margin-top: 30px; }
        .mission-item { background: white; padding: 20px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #e2e8f0; transition: 0.2s; }
        .mission-item:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #3b82f6; }
        
        .m-icon-box { width: 56px; height: 56px; border-radius: 14px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0; }
        
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-daily { background: #dbeafe; color: #2563eb; }
        .badge-once { background: #f3f4f6; color: #4b5563; }
        
        .badge-type { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #64748b; margin-top: 5px; }
        
        .btn-del { background: #fee2e2; color: #ef4444; border: none; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; opacity: 0; }
        .mission-item:hover .btn-del { opacity: 1; }
        .btn-del:hover { background: #ef4444; color: white; }
      `}</style>

      <div className="page-header">
        <Trophy size={32} color="#eab308" />
        <h2>Hệ Thống Nhiệm Vụ & Thưởng</h2>
      </div>

      {/* FORM THÊM NHIỆM VỤ */}
      <div className="card">
        <h3 style={{marginTop:0, marginBottom: 20, fontSize: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 15}}>
            <Plus size={18} style={{display:'inline', marginBottom: -3, marginRight: 5}}/> Tạo Nhiệm Vụ Mới
        </h3>
        
        <div className="form-grid">
            <div className="form-group">
                <label>Tên nhiệm vụ</label>
                <input placeholder="VD: Khách hàng thân thiết" className="inp" 
                    value={newMission.title} onChange={e=>setNewMission({...newMission, title: e.target.value})} />
            </div>
            
            <div className="form-group">
                <label>Mô tả chi tiết</label>
                <input placeholder="VD: Đặt thành công 5 đơn hàng..." className="inp"
                    value={newMission.description} onChange={e=>setNewMission({...newMission, description: e.target.value})} />
            </div>
            
            <div className="form-group">
                <label>Loại mục tiêu</label>
                <select className="inp" value={newMission.type} onChange={e=>setNewMission({...newMission, type: e.target.value})}>
                    <option value="ORDER_COUNT">📦 Số lượng đơn hàng</option>
                    <option value="SPEND_TOTAL">💰 Tổng tiền chi tiêu</option>
                </select>
            </div>

            <div className="form-group">
                <label>Giá trị mục tiêu (Số lượng hoặc VNĐ)</label>
                <input type="number" placeholder="VD: 5" className="inp"
                    value={newMission.targetValue} onChange={e=>setNewMission({...newMission, targetValue: parseInt(e.target.value) || 0})} />
            </div>

            <div className="form-group">
                <label>Tần suất lặp lại</label>
                <select className="inp" value={newMission.frequency} onChange={e=>setNewMission({...newMission, frequency: e.target.value})}>
                    <option value="ONCE">1️⃣ Một lần duy nhất</option>
                    <option value="DAILY">🔄 Hằng ngày (Reset 00:00)</option>
                </select>
            </div>

            <div className="form-group">
                <label>Phần thưởng (Voucher)</label>
                <select className="inp" value={newMission.rewardVoucherId} onChange={e=>setNewMission({...newMission, rewardVoucherId: e.target.value})}>
                    <option value="">-- Chọn Voucher --</option>
                    {vouchers.map(v => <option key={v.id} value={v.id}>🎫 {v.code} (-{v.percent}%)</option>)}
                </select>
            </div>

            <div className="form-group">
                <label>Biểu tượng hiển thị</label>
                <select className="inp" value={newMission.icon} onChange={e=>setNewMission({...newMission, icon: e.target.value})}>
                    <option value="gift">🎁 Hộp quà</option>
                    <option value="zap">⚡ Tia sét</option>
                    <option value="target">🎯 Mục tiêu</option>
                </select>
            </div>
        </div>

        <button className="btn-add" onClick={handleCreate}>
            <CheckCircle size={20}/> Xác Nhận Thêm
        </button>
      </div>

      {/* DANH SÁCH NHIỆM VỤ */}
      <h3 style={{margin: '30px 0 15px', color: '#64748b', fontSize: 16, display:'flex', alignItems:'center', gap: 10}}>
          <LayoutList size={20}/> Danh sách đang hoạt động ({missions.length})
      </h3>

      <div className="mission-list">
        {loading ? (
             <div style={{textAlign:'center', padding: 40, color: '#94a3b8'}}>Đang tải dữ liệu...</div>
        ) : missions.length === 0 ? (
             <div style={{textAlign:'center', padding: 50, background:'white', borderRadius: 16, border: '1px dashed #cbd5e1', color: '#94a3b8'}}>
                 Chưa có nhiệm vụ nào được tạo.
             </div>
        ) : (
            missions.map(m => (
                <div key={m.id} className="mission-item">
                    <div style={{display:'flex', alignItems:'center'}}>
                        <div className="m-icon-box">
                            {renderIcon(m.icon)}
                        </div>
                        <div>
                            <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 4}}>
                                <span style={{fontSize: 16, fontWeight: 700, color: '#1e293b'}}>{m.title}</span>
                                <span className={`badge ${m.frequency === 'DAILY' ? 'badge-daily' : 'badge-once'}`}>
                                    {m.frequency === 'DAILY' ? 'DAILY' : 'ONE-TIME'}
                                </span>
                            </div>
                            <div style={{fontSize: 14, color: '#64748b'}}>{m.description}</div>
                            
                            <div className="badge-type">
                                {m.type === 'ORDER_COUNT' ? <ShoppingBag size={14}/> : <DollarSign size={14}/>}
                                <span>Mục tiêu: <b>{m.targetValue}</b> {m.type === 'ORDER_COUNT' ? 'đơn hàng' : 'VNĐ'}</span>
                            </div>
                        </div>
                    </div>

                    <button className="btn-del" onClick={() => handleDelete(m.id)} title="Xóa nhiệm vụ">
                        <Trash2 size={20} />
                    </button>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default MissionManager;
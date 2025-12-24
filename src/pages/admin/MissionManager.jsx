import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trophy, Trash2, Plus, Gift, Target, Zap } from 'lucide-react';

const MissionManager = () => {
  const [missions, setMissions] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  
  // Form State
  const [newMission, setNewMission] = useState({
    title: '', description: '', type: 'ORDER_COUNT', targetValue: 1, 
    rewardVoucherId: '', icon: 'gift', frequency: 'ONCE'
  });

  useEffect(() => { fetchMissions(); fetchVouchers(); }, []);

  const fetchMissions = async () => {
    // Để tiện, ta dùng api get của user (hoặc tạo api get all riêng cho admin)
    // Ở đây ta giả sử admin có id=1 để test list
    try {
        const res = await api.get('/missions/user/1'); 
        setMissions(res.data);
    } catch(e) { console.log(e); }
  };

  const fetchVouchers = async () => {
      try { const res = await api.get('/vouchers'); setVouchers(res.data); } 
      catch(e) {}
  };

  const handleCreate = async () => {
    if(!newMission.title || !newMission.rewardVoucherId) return alert("Điền đủ thông tin!");
    try {
        await api.post('/missions/create', newMission);
        alert("Thêm nhiệm vụ thành công!");
        fetchMissions();
        setNewMission({ ...newMission, title: '', description: '' });
    } catch(e) { alert("Lỗi thêm"); }
  };

  const handleDelete = async (id) => {
      if(confirm("Xóa nhiệm vụ này?")) {
          await api.delete(`/missions/${id}`);
          fetchMissions();
      }
  };

  return (
    <div style={{padding: 20}}>
      <h2 style={{fontSize: 24, fontWeight: 800, marginBottom: 20}}>Quản Lý Nhiệm Vụ</h2>

      {/* FORM THÊM NHIỆM VỤ */}
      <div style={{background: 'white', padding: 20, borderRadius: 12, marginBottom: 30, boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        <h3 style={{marginTop:0}}>Thêm Nhiệm Vụ Mới</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15}}>
            <input placeholder="Tên nhiệm vụ (VD: Săn Deal Sáng)" className="inp" 
                value={newMission.title} onChange={e=>setNewMission({...newMission, title: e.target.value})} />
            
            <input placeholder="Mô tả (VD: Đặt 3 đơn trước 10h)" className="inp"
                value={newMission.description} onChange={e=>setNewMission({...newMission, description: e.target.value})} />
            
            <select className="inp" value={newMission.type} onChange={e=>setNewMission({...newMission, type: e.target.value})}>
                <option value="ORDER_COUNT">Đếm số đơn hàng</option>
                <option value="SPEND_TOTAL">Tổng tiền chi tiêu</option>
            </select>

            <input type="number" placeholder="Mục tiêu (VD: 3 đơn hoặc 500000đ)" className="inp"
                value={newMission.targetValue} onChange={e=>setNewMission({...newMission, targetValue: parseInt(e.target.value)})} />

            <select className="inp" value={newMission.frequency} onChange={e=>setNewMission({...newMission, frequency: e.target.value})}>
                <option value="ONCE">Làm 1 lần duy nhất</option>
                <option value="DAILY">Làm lại hằng ngày (Reset 00:00)</option>
            </select>

            <select className="inp" value={newMission.rewardVoucherId} onChange={e=>setNewMission({...newMission, rewardVoucherId: e.target.value})}>
                <option value="">-- Chọn Voucher Thưởng --</option>
                {vouchers.map(v => <option key={v.id} value={v.id}>{v.code} (Giảm {v.percent}%)</option>)}
            </select>

            <select className="inp" value={newMission.icon} onChange={e=>setNewMission({...newMission, icon: e.target.value})}>
                <option value="gift">Icon Hộp Quà</option>
                <option value="zap">Icon Tia Sét</option>
                <option value="target">Icon Mục Tiêu</option>
            </select>
        </div>
        <button onClick={handleCreate} style={{marginTop: 15, background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold'}}>
            <Plus size={16} style={{marginBottom: -3}}/> Thêm Nhiệm Vụ
        </button>
      </div>

      {/* DANH SÁCH NHIỆM VỤ */}
      <div style={{display: 'grid', gap: 15}}>
        {missions.map(m => (
            <div key={m.id} style={{background: 'white', padding: 15, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb'}}>
                <div style={{display:'flex', gap: 15, alignItems:'center'}}>
                    <div style={{width: 40, height: 40, background: '#eff6ff', borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        {m.icon === 'zap' ? <Zap size={20} color="#3b82f6"/> : <Trophy size={20} color="#eab308"/>}
                    </div>
                    <div>
                        <div style={{fontWeight: 700}}>{m.title} <span style={{fontSize: 10, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4}}>{m.frequency === 'DAILY' ? 'HẰNG NGÀY' : '1 LẦN'}</span></div>
                        <div style={{fontSize: 13, color: '#6b7280'}}>{m.description} • Mục tiêu: {m.targetValue}</div>
                    </div>
                </div>
                <button onClick={() => handleDelete(m.id)} style={{background: '#fee2e2', color: '#ef4444', border: 'none', padding: 8, borderRadius: 6, cursor: 'pointer'}}>
                    <Trash2 size={18} />
                </button>
            </div>
        ))}
      </div>

      <style>{`
        .inp { padding: 10px; border: 1px solid #d1d5db; borderRadius: 6px; width: 100%; box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default MissionManager;
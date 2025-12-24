import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import AddVoucherModal from './AddVoucherModal';
import { Ticket, Plus, Calendar, Trash2, Edit, Loader, Clock, Tag, Gift, Gamepad2, Coins, ShoppingCart } from 'lucide-react';

const VoucherManager = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vouchers');
      setVouchers(res.data);
    } catch (error) {
      console.error("Lỗi tải voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa mã này?")) {
      try { await api.delete(`/vouchers/${id}`); fetchVouchers(); } 
      catch (error) { alert("Lỗi xóa voucher!"); }
    }
  };

  const handleEdit = (voucher) => { setEditingVoucher(voucher); setIsModalOpen(true); };
  const handleAddNew = () => { setEditingVoucher(null); setIsModalOpen(true); };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';
  const formatK = (val) => val ? (val >= 1000 ? (val/1000) + 'k' : val) : '0';

  // Helper: Hiển thị Badge loại Voucher
  const getTypeBadge = (v) => {
    switch (v.type) {
        case 'REWARD_ORDER': return { icon: <ShoppingCart size={14}/>, text: `Tặng đơn > ${formatK(v.conditionValue)}`, bg: '#dbeafe', color: '#1e40af' };
        case 'POINT_EXCHANGE': return { icon: <Coins size={14}/>, text: `Đổi ${v.conditionValue} điểm`, bg: '#ffedd5', color: '#9a3412' };
        case 'GAME_REWARD': return { icon: <Gamepad2 size={14}/>, text: 'Quà Game', bg: '#f3e8ff', color: '#6b21a8' };
        case 'EVENT': return { icon: <Gift size={14}/>, text: 'Sự kiện', bg: '#fce7f3', color: '#9d174d' };
        default: return { icon: <Ticket size={14}/>, text: 'Công khai', bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div className="mgr-container">
      <style>{`
        .voucher-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .voucher-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        
        .voucher-card { background: #fff; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; transition: 0.3s; }
        .voucher-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1); }

        .ticket-header { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); padding: 20px; color: #fff; text-align: center; position: relative; }
        .ticket-code { font-size: 24px; font-weight: 800; letter-spacing: 2px; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 8px; border: 2px dashed rgba(255,255,255,0.6); display: inline-block; margin-bottom: 8px; }
        .ticket-percent { font-size: 15px; font-weight: 600; opacity: 0.95; }
        
        .ticket-rip { height: 16px; background-image: radial-gradient(circle, transparent 60%, #fff 65%); background-size: 16px 16px; background-position: bottom center; background-repeat: repeat-x; margin-top: -8px; position: relative; z-index: 10; }

        .ticket-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
        .info-item { display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: #475569; }
        .info-label { display: flex; align-items: center; gap: 8px; font-weight: 500; }
        
        .type-badge { font-size: 12px; padding: 6px 12px; border-radius: 20px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; width: fit-content; }

        .ticket-footer { padding: 12px 20px; background: #f8fafc; border-top: 1px dashed #cbd5e1; display: flex; gap: 12px; }
        .btn-action { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #fff; transition: 0.2s; }
        .btn-edit:hover { background: #eff6ff; color: #3b82f6; } .btn-delete:hover { background: #fef2f2; color: #ef4444; }
        .mgr-btn-add { background: #0f172a; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; }
      `}</style>

      <div className="voucher-header">
        <h2 style={{fontSize: '24px', fontWeight: '900', color: '#1f2937'}}>Quản lý <span style={{color: '#f43f5e'}}>Voucher</span></h2>
        <button className="mgr-btn-add" onClick={handleAddNew}><Plus size={20} /> Tạo mã mới</button>
      </div>

      {loading ? <div style={{textAlign:'center', padding:'80px'}}><Loader className="animate-spin" color="#f43f5e"/></div> : (
        <div className="voucher-grid">
          {vouchers.map((v) => {
            const badge = getTypeBadge(v);
            return (
              <div key={v.id} className="voucher-card">
                <div className="ticket-header">
                    <div className="ticket-code">{v.code}</div>
                    <div className="ticket-percent"><Tag size={14}/> Giảm {v.percent}% (Max {formatK(v.maxDiscount)})</div>
                </div>
                <div className="ticket-rip"></div>
                <div className="ticket-body">
                    <div className="type-badge" style={{background: badge.bg, color: badge.color}}>
                        {badge.icon} {badge.text}
                    </div>
                    <div className="info-item">
                        <span className="info-label"><Calendar size={16}/> Hạn:</span>
                        <span>{formatDate(v.endDate)}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label"><Clock size={16}/> Trạng thái:</span>
                        <span style={{fontWeight:'700', color: new Date(v.endDate) < new Date() ? '#ef4444' : '#16a34a'}}>
                            {new Date(v.endDate) < new Date() ? 'Hết hạn' : 'Đang chạy'}
                        </span>
                    </div>
                </div>
                <div className="ticket-footer">
                    <button className="btn-action btn-edit" onClick={() => handleEdit(v)}><Edit size={16}/> Sửa</button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(v.id)}><Trash2 size={16}/> Xóa</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddVoucherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchVouchers} editingVoucher={editingVoucher} />
    </div>
  );
};

export default VoucherManager;
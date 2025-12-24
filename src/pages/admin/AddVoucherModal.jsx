import React, { useState, useEffect } from 'react';
import { X, Save, Ticket, Calendar, Percent, DollarSign, Loader, ListFilter, Target } from 'lucide-react';
import api from '../../api/axios';

const AddVoucherModal = ({ isOpen, onClose, onRefresh, editingVoucher }) => {
  const [formData, setFormData] = useState({
    code: '',
    percent: '',
    maxDiscount: '', 
    startDate: '',
    endDate: '',
    type: 'PUBLIC', // Mặc định là công khai
    conditionValue: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingVoucher) {
      const formatDateInput = (dateStr) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
      setFormData({
        code: editingVoucher.code,
        percent: editingVoucher.percent,
        maxDiscount: editingVoucher.maxDiscount,
        startDate: formatDateInput(editingVoucher.startDate),
        endDate: formatDateInput(editingVoucher.endDate),
        type: editingVoucher.type || 'PUBLIC',
        conditionValue: editingVoucher.conditionValue || 0
      });
    } else {
      setFormData({ 
        code: '', percent: '', maxDiscount: '', startDate: '', endDate: '', 
        type: 'PUBLIC', conditionValue: 0 
      });
    }
  }, [editingVoucher, isOpen]);

  // Danh sách loại Voucher
  const voucherTypes = [
    { value: 'PUBLIC', label: 'Công khai (Ai cũng dùng được)' },
    { value: 'REWARD_ORDER', label: 'Tặng theo đơn hàng (Min Order)' },
    { value: 'POINT_EXCHANGE', label: 'Đổi bằng điểm tích lũy' },
    { value: 'GAME_REWARD', label: 'Phần thưởng Game' },
    { value: 'EVENT', label: 'Sự kiện đặc biệt' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate Logic phía Client
      if ((formData.type === 'REWARD_ORDER' || formData.type === 'POINT_EXCHANGE') && Number(formData.conditionValue) <= 0) {
        alert("Với loại voucher này, bạn phải nhập 'Giá trị điều kiện' lớn hơn 0!");
        setIsLoading(false);
        return;
      }

      if (editingVoucher) {
        await api.put(`/vouchers/${editingVoucher.id}`, formData);
        alert("Cập nhật thành công!");
      } else {
        await api.post('/vouchers', formData);
        alert("Tạo voucher mới thành công!");
      }
      onRefresh();
      onClose();
    } catch (error) {
        const msg = error.response?.data || "Lỗi khi lưu voucher!";
        alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Render ô nhập điều kiện dựa theo loại
  const renderConditionInput = () => {
    switch (formData.type) {
      case 'REWARD_ORDER':
        return (
          <div className="form-group highlight-box">
            <label className="form-label text-blue"><DollarSign size={16}/> Đơn hàng tối thiểu (VNĐ)</label>
            <input 
              type="number" className="form-input" placeholder="VD: 500000"
              value={formData.conditionValue} onChange={e => setFormData({...formData, conditionValue: e.target.value})}
            />
            <small>Khách mua đơn trên mức này sẽ được tặng voucher.</small>
          </div>
        );
      case 'POINT_EXCHANGE':
        return (
          <div className="form-group highlight-box">
            <label className="form-label text-orange"><Target size={16}/> Số điểm cần đổi</label>
            <input 
              type="number" className="form-input" placeholder="VD: 200"
              value={formData.conditionValue} onChange={e => setFormData({...formData, conditionValue: e.target.value})}
            />
            <small>Khách cần dùng số điểm này để đổi lấy voucher.</small>
          </div>
        );
      default:
        return null; // Các loại khác không cần nhập điều kiện
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-container { background: #fff; width: 100%; max-width: 550px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; animation: slideUp 0.3s ease; }
        .modal-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .modal-title { font-size: 18px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 8px; }
        .modal-body { padding: 24px; max-height: 80vh; overflow-y: auto; }
        
        .form-group { margin-bottom: 16px; }
        .form-label { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
        .form-input, .form-select { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; transition: 0.2s; font-family: inherit; font-size: 14px; }
        .form-input:focus, .form-select:focus { border-color: #f43f5e; box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        .highlight-box { background: #f0f9ff; padding: 12px; border-radius: 8px; border: 1px dashed #bae6fd; }
        .text-blue { color: #0284c7; } .text-orange { color: #ea580c; }
        small { display: block; margin-top: 4px; color: #64748b; font-size: 12px; }

        .modal-footer { padding: 20px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; background: #f8fafc; }
        .btn-cancel { padding: 10px 20px; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-save { padding: 10px 24px; background: #f43f5e; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title"><Ticket size={20} color="#f43f5e"/> {editingVoucher ? 'Sửa Voucher' : 'Tạo Voucher'}</h3>
          <button onClick={onClose} style={{border:'none', background:'none', cursor:'pointer'}}><X size={24} color="#64748b"/></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
            {/* Loại Voucher */}
            <div className="form-group">
                <label className="form-label"><ListFilter size={16}/> Loại chương trình</label>
                <select 
                    className="form-select" 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value, conditionValue: 0})}
                >
                    {voucherTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            {/* Ô nhập điều kiện động (Chỉ hiện khi cần) */}
            {renderConditionInput()}

            <div className="form-group">
                <label className="form-label">Mã Code (In hoa)</label>
                <input 
                    type="text" className="form-input" placeholder="VD: SALE50" 
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '')})}
                    required style={{textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px'}}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label"><Percent size={16}/> Giảm (%)</label>
                    <input type="number" min="1" max="100" className="form-input" value={formData.percent} onChange={e => setFormData({...formData, percent: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label className="form-label"><DollarSign size={16}/> Giảm tối đa (k)</label>
                    <input type="number" className="form-input" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} required />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label"><Calendar size={16}/> Ngày bắt đầu</label>
                    <input type="date" className="form-input" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label className="form-label"><Calendar size={16}/> Ngày kết thúc</label>
                    <input type="date" className="form-input" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                </div>
            </div>
        </form>

        <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-save" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader className="animate-spin" size={18}/> : <Save size={18}/>} Lưu
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddVoucherModal;
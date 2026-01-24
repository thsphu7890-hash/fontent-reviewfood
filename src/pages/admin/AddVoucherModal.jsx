import React, { useState, useEffect } from 'react';
import { X, Save, Ticket, Calendar, Percent, DollarSign, Loader, ListFilter, Target } from 'lucide-react';
import api from '../../api/axios'; // Đảm bảo import đúng file axiosClient đã cấu hình
import toast from 'react-hot-toast';

const AddVoucherModal = ({ isOpen, onClose, onRefresh, editingVoucher }) => {
  const [formData, setFormData] = useState({
    code: '',
    percent: '',
    maxDiscount: '', 
    startDate: '',
    endDate: '',
    type: 'PUBLIC',
    conditionValue: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Effect: Điền dữ liệu khi mở modal (Edit hoặc Create)
  useEffect(() => {
    if (isOpen) {
      if (editingVoucher) {
        // Format ngày từ ISO string sang YYYY-MM-DD cho input type="date"
        const formatDateForInput = (dateStr) => dateStr ? dateStr.split('T')[0] : '';
        setFormData({
          code: editingVoucher.code || '',
          percent: editingVoucher.percent || '',
          maxDiscount: editingVoucher.maxDiscount || '',
          startDate: formatDateForInput(editingVoucher.startDate),
          endDate: formatDateForInput(editingVoucher.endDate),
          type: editingVoucher.type || 'PUBLIC',
          conditionValue: editingVoucher.conditionValue || 0
        });
      } else {
        // Reset form khi tạo mới
        setFormData({ 
          code: '', percent: '', maxDiscount: '', startDate: '', endDate: '', 
          type: 'PUBLIC', conditionValue: 0 
        });
      }
    }
  }, [editingVoucher, isOpen]);

  const voucherTypes = [
    { value: 'PUBLIC', label: 'Công khai (Ai cũng dùng được)' },
    { value: 'REWARD_ORDER', label: 'Tặng theo đơn hàng (Min Order)' },
    { value: 'POINT_EXCHANGE', label: 'Đổi bằng điểm tích lũy' },
    { value: 'GAME_REWARD', label: 'Phần thưởng Game' },
    { value: 'EVENT', label: 'Sự kiện đặc biệt' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn reload trang
    
    // Validate dữ liệu
    if (!formData.code || !formData.percent || !formData.endDate) {
      toast.error("Vui lòng điền các thông tin bắt buộc!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        // Nếu không nhập ngày bắt đầu, lấy ngày hiện tại
        startDate: formData.startDate ? `${formData.startDate}T00:00:00` : `${new Date().toISOString().split('T')[0]}T00:00:00`,
        endDate: `${formData.endDate}T23:59:59`
      };

      if (editingVoucher) {
        await api.put(`/api/vouchers/${editingVoucher.id}`, payload);
        toast.success("Cập nhật voucher thành công!");
      } else {
        await api.post('/api/vouchers', payload);
        toast.success("Đã tạo voucher mới!");
      }
      
      onRefresh(); // Load lại danh sách bên ngoài
      onClose();   // Đóng modal
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể lưu dữ liệu, vui lòng thử lại!";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConditionInput = () => {
    switch (formData.type) {
      case 'REWARD_ORDER':
        return (
          <div className="form-group highlight-box">
            <label className="form-label" style={{color: '#2563eb'}}>
              <DollarSign size={16}/> Đơn hàng tối thiểu (VNĐ)
            </label>
            <input type="number" className="form-input" value={formData.conditionValue} onChange={e => setFormData({...formData, conditionValue: e.target.value})} placeholder="VD: 100000" />
          </div>
        );
      case 'POINT_EXCHANGE':
        return (
          <div className="form-group highlight-box">
            <label className="form-label" style={{color: '#ea580c'}}>
              <Target size={16}/> Số điểm cần đổi
            </label>
            <input type="number" className="form-input" value={formData.conditionValue} onChange={e => setFormData({...formData, conditionValue: e.target.value})} placeholder="VD: 50" />
          </div>
        );
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {/* Giữ nguyên phần Style của bạn */}
       <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
        .modal-container { background: #fff; width: 95%; max-width: 550px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; max-height: 90vh; }
        .modal-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fff; flex-shrink: 0; }
        .modal-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; margin: 0; }
        
        .modal-body { 
          padding: 24px; 
          overflow-y: auto; 
          scrollbar-width: thin;
        }
        
        .form-label { font-size: 0.875rem; font-weight: 700; color: #475569; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .form-input, .form-select { width: 100%; padding: 12px 16px; border: 2px solid #f1f5f9; border-radius: 12px; transition: 0.3s; font-size: 0.95rem; box-sizing: border-box; }
        .form-input:focus, .form-select:focus { border-color: #f43f5e; outline: none; box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.1); }
        .form-group { margin-bottom: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .highlight-box { background: #f8fafc; padding: 16px; border-radius: 16px; border: 2px dashed #e2e8f0; animation: fadeIn 0.3s ease-in; }
        
        .modal-footer { padding: 20px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; background: #fff; flex-shrink: 0; }
        .btn-cancel { padding: 12px 24px; background: #f1f5f9; color: #475569; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-cancel:hover { background: #e2e8f0; }
        .btn-save { padding: 12px 28px; background: #0f172a; color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
        .btn-save:hover { background: #f43f5e; transform: translateY(-2px); }
        .btn-save:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            <Ticket size={24} className="text-rose-500"/> 
            {editingVoucher ? 'Cập nhật chiến dịch' : 'Tạo mã Voucher mới'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-all border-none bg-transparent cursor-pointer">
            <X size={24} color="#64748b"/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label"><ListFilter size={18}/> Loại hình ưu đãi</label>
            <select className="form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value, conditionValue: 0})}>
              {voucherTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          
          {renderConditionInput()}
          
          <div className="form-group">
            <label className="form-label">Mã Code Niêm Yết <span style={{color:'#f43f5e'}}>*</span></label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '')})} 
              required 
              placeholder="VD: SALE50"
              style={{textTransform: 'uppercase', fontWeight: '900', letterSpacing: '2px', color: '#f43f5e'}} 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><Percent size={18}/> Mức giảm (%) <span style={{color:'#f43f5e'}}>*</span></label>
              <input type="number" min="1" max="100" className="form-input" value={formData.percent} onChange={e => setFormData({...formData, percent: e.target.value})} required placeholder="1-100"/>
            </div>
            <div className="form-group">
              <label className="form-label"><DollarSign size={18}/> Giảm tối đa <span style={{color:'#f43f5e'}}>*</span></label>
              <input type="number" className="form-input" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} required placeholder="VNĐ"/>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><Calendar size={18}/> Bắt đầu từ</label>
              <input type="date" className="form-input" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label"><Calendar size={18}/> Ngày hết hạn <span style={{color:'#f43f5e'}}>*</span></label>
              <input type="date" className="form-input" style={{borderColor: '#fecdd3'}} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Hủy bỏ</button>
          <button type="button" className="btn-save" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader className="animate-spin" size={18}/> : <Save size={18}/>} 
            {editingVoucher ? 'Cập nhật ngay' : 'Kích hoạt ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVoucherModal;
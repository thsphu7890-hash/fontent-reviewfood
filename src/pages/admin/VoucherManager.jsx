import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import AddVoucherModal from './AddVoucherModal';
import { 
  Ticket, Plus, Calendar, Trash2, Edit, Loader, Clock, Tag, 
  Gift, Gamepad2, Coins, ShoppingCart, Search, AlertCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const VoucherManager = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL'); 
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/vouchers');
      // Sắp xếp voucher mới nhất lên đầu
      const sortedData = res.data.sort((a, b) => b.id - a.id);
      setVouchers(sortedData);
    } catch (error) {
      toast.error("Không thể tải danh sách voucher!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  // Xác nhận xóa bằng Toast thay vì Window Confirm để đồng bộ giao diện
  const confirmDelete = (id) => {
    toast((t) => (
      <span className="flex items-center gap-3">
        <b>Xóa voucher này?</b>
        <button 
          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/vouchers/${id}`);
              toast.success("Đã xóa mã giảm giá");
              fetchVouchers();
            } catch (err) {
              toast.error("Lỗi khi xóa!");
            }
          }}
        >
          Xóa
        </button>
      </span>
    ));
  };

  const handleEdit = (voucher) => { setEditingVoucher(voucher); setIsModalOpen(true); };
  const handleAddNew = () => { setEditingVoucher(null); setIsModalOpen(true); };

  // Format ngày tháng từ chuỗi ISO (LocalDateTime) của Java
  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatK = (val) => {
    if (!val) return '0đ';
    return val >= 1000 ? `${(val / 1000).toLocaleString()}k` : `${val}đ`;
  };

  const getTypeBadge = (type, condition) => {
    const config = {
      'REWARD_ORDER': { icon: <ShoppingCart size={14}/>, text: `Đơn > ${formatK(condition)}`, bg: '#eff6ff', color: '#1d4ed8' },
      'POINT_EXCHANGE': { icon: <Coins size={14}/>, text: `${condition} điểm`, bg: '#fff7ed', color: '#c2410c' },
      'GAME_REWARD': { icon: <Gamepad2 size={14}/>, text: 'Quà Game', bg: '#f5f3ff', color: '#6d28d9' },
      'EVENT': { icon: <Gift size={14}/>, text: 'Sự kiện', bg: '#fdf2f8', color: '#be185d' },
      'DEFAULT': { icon: <Ticket size={14}/>, text: 'Công khai', bg: '#f8fafc', color: '#475569' }
    };
    return config[type] || config['DEFAULT'];
  };

  // Sử dụng useMemo để tối ưu lọc dữ liệu khi searchTerm hoặc filterTab thay đổi
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const isExpired = new Date(v.endDate) < new Date();
      const matchSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterTab === 'ACTIVE') return !isExpired && matchSearch;
      if (filterTab === 'EXPIRED') return isExpired && matchSearch;
      return matchSearch;
    });
  }, [vouchers, filterTab, searchTerm]);

  return (
    <div className="mgr-container animate-in fade-in duration-500">
      <style>{`
        .voucher-header { display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px; }
        .header-top { display: flex; justify-content: space-between; align-items: center; }
        
        .search-box { position: relative; flex: 1; max-width: 400px; }
        .search-input { width: 100%; padding: 10px 15px 10px 40px; border: 1px solid #e2e8f0; border-radius: 12px; transition: 0.3s; }
        .search-input:focus { border-color: #f43f5e; box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.1); outline: none; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

        .tabs-container { display: flex; background: #f1f5f9; padding: 4px; border-radius: 14px; width: fit-content; }
        .tab-item { padding: 8px 20px; font-size: 13px; font-weight: 700; color: #64748b; border-radius: 10px; cursor: pointer; transition: 0.2s; border: none; }
        .tab-item.active { background: #fff; color: #f43f5e; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

        .voucher-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .voucher-card { background: #fff; border-radius: 24px; border: 1px solid #f1f5f9; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
        .voucher-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
        .voucher-card.expired { opacity: 0.7; }
        
        .ticket-header { background: #1e293b; padding: 30px 20px; color: #fff; text-align: center; border-radius: 24px 24px 0 0; }
        .ticket-code { font-size: 28px; font-weight: 900; letter-spacing: 4px; background: rgba(255,255,255,0.1); padding: 8px 24px; border-radius: 12px; border: 2px dashed rgba(255,255,255,0.3); display: inline-block; }
        
        .ticket-rip { height: 20px; background-image: radial-gradient(circle at 10px 20px, transparent 10px, #fff 10px); background-size: 20px 20px; margin-top: -10px; }

        .ticket-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .status-badge { font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }

        .btn-footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; border-radius: 0 0 24px 24px; display: flex; gap: 12px; }
        .btn-action { flex: 1; padding: 10px; border-radius: 12px; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; border: 1px solid #e2e8f0; background: #fff; }
        .btn-edit:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .btn-delete:hover { border-color: #f43f5e; color: #f43f5e; background: #fff1f2; }
      `}</style>

      <div className="voucher-header">
        <div className="header-top">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Kho <span className="text-rose-500">Voucher</span></h2>
            <p className="text-slate-400 text-sm font-medium">Quản lý chiến dịch ưu đãi cửa hàng</p>
          </div>
          <div className="flex gap-3">
             <button onClick={fetchVouchers} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>
             <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-rose-500 transition-all shadow-lg" onClick={handleAddNew}>
                <Plus size={20} /> Tạo mới
             </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="tabs-container">
            {['ALL', 'ACTIVE', 'EXPIRED'].map(tab => (
              <button 
                key={tab}
                className={`tab-item ${filterTab === tab ? 'active' : ''}`}
                onClick={() => setFilterTab(tab)}
              >
                {tab === 'ALL' ? 'Tất cả' : tab === 'ACTIVE' ? 'Đang chạy' : 'Hết hạn'}
              </button>
            ))}
          </div>
          
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Tìm theo mã code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative">
            <Loader className="animate-spin text-rose-500" size={48} />
            <Ticket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-200" size={20} />
          </div>
          <p className="text-slate-400 font-bold animate-pulse">Đang tải dữ liệu voucher...</p>
        </div>
      ) : (
        <>
          {filteredVouchers.length > 0 ? (
            <div className="voucher-grid">
              {filteredVouchers.map((v) => {
                const badge = getTypeBadge(v.type, v.conditionValue);
                const isExpired = new Date(v.endDate) < new Date();
                const isExpiringSoon = !isExpired && (new Date(v.endDate) - new Date() < 3 * 24 * 60 * 60 * 1000);

                return (
                  <div key={v.id} className={`voucher-card ${isExpired ? 'expired' : ''}`}>
                    <div className="ticket-header" style={{ background: isExpired ? '#64748b' : '' }}>
                      <div className="ticket-code">{v.code}</div>
                      <div className="mt-3 font-bold text-rose-200 text-sm">
                        GIẢM {v.percent}% <span className="mx-1 opacity-50">|</span> TỐI ĐA {formatK(v.maxDiscount)}
                      </div>
                    </div>
                    
                    <div className="ticket-rip"></div>
                    
                    <div className="ticket-body">
                      <div className="flex justify-between items-center">
                        <div style={{ background: badge.bg, color: badge.color }} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black">
                          {badge.icon} {badge.text}
                        </div>
                        <span className={`status-badge ${isExpired ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isExpired ? 'Hết hạn' : 'Đang chạy'}
                        </span>
                      </div>

                      <div className="space-y-3 mt-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400 flex items-center gap-2"><Calendar size={14}/> Hiệu lực:</span>
                          <span className="text-slate-600">{formatDate(v.startDate)} - {formatDate(v.endDate)}</span>
                        </div>
                        
                        {isExpiringSoon && (
                          <div className="flex items-center gap-2 text-amber-500 text-[11px] font-bold bg-amber-50 p-2 rounded-lg">
                            <AlertCircle size={14} /> Voucher sắp hết hạn trong 3 ngày tới!
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="btn-footer">
                      <button className="btn-action btn-edit" onClick={() => handleEdit(v)}>
                        <Edit size={16}/> Sửa
                      </button>
                      <button className="btn-action btn-delete" onClick={() => confirmDelete(v.id)}>
                        <Trash2 size={16}/> Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50 rounded-[40px] border-4 border-dashed border-white">
              <Ticket size={64} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-400">Không tìm thấy voucher nào</h3>
              <p className="text-slate-300 text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo mã mới ngay</p>
            </div>
          )}
        </>
      )}

      <AddVoucherModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchVouchers} 
        editingVoucher={editingVoucher} 
      />
    </div>
  );
};

export default VoucherManager;
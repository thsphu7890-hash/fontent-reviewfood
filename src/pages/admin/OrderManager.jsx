import React, { useEffect, useState, useMemo, useRef } from 'react';
import api from '../../api/axios'; // Đảm bảo đường dẫn này đúng
import { 
  Eye, CheckCircle, XCircle, Truck, Clock, 
  Search, Package, Calendar, Download, 
  ChevronLeft, ChevronRight, DollarSign, RefreshCw, 
  MoreVertical, Printer, CheckSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

// --- CSS STYLES (Đã tách ra để gọn code) ---
const STYLES = `
  .om-container { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; padding: 24px; background-color: #f8fafc; min-height: 100vh; }
  
  /* Stats Grid */
  .om-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
  .om-stat-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: 0.2s; }
  .om-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .om-icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .om-stat-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .om-stat-val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px; }

  /* Toolbar */
  .om-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; background: white; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; }
  .om-search-group { display: flex; align-items: center; gap: 12px; flex: 1; flex-wrap: wrap; }
  
  .om-input-wrapper { position: relative; width: 320px; max-width: 100%; }
  .om-input { width: 100%; height: 42px; padding: 0 10px 0 40px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-size: 14px; transition: 0.2s; background: #fff; box-sizing: border-box; }
  .om-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  .om-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }

  .om-date-group { display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 0 12px; border-radius: 8px; border: 1px solid #e2e8f0; height: 42px; }
  .om-date-input { background: transparent; border: none; outline: none; font-size: 13px; color: #475569; font-family: inherit; }
  
  .om-btn-export { background: white; border: 1px solid #e2e8f0; padding: 0 16px; height: 42px; border-radius: 8px; cursor: pointer; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: 0.2s; white-space: nowrap; }
  .om-btn-export:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }

  /* Tabs */
  .om-tabs { display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px; }
  .om-tab-btn { padding: 8px 16px; border-radius: 20px; border: 1px solid transparent; background: white; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; white-space: nowrap; }
  .om-tab-btn.active { background: #0f172a; color: white; border-color: #0f172a; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  .om-tab-btn:hover:not(.active) { background: #e2e8f0; }

  /* Bulk Actions */
  .om-bulk { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; animation: fadeIn 0.3s; flex-wrap: wrap; gap: 10px; }
  .om-bulk-btn { background: white; border: 1px solid #bfdbfe; color: #2563eb; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; margin-left: 8px; transition: 0.2s; }
  .om-bulk-btn:hover { background: #dbeafe; transform: translateY(-1px); }

  /* Table */
  .om-table-wrapper { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .om-table { width: 100%; border-collapse: collapse; min-width: 800px; }
  .om-th { text-align: left; padding: 14px 20px; background: #f8fafc; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
  .om-td { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; vertical-align: middle; }
  .om-tr:hover { background: #f8fafc; }
  .om-tr.selected { background: #eff6ff; }
  
  /* Pagination */
  .om-pagination { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-top: 1px solid #e2e8f0; background: #fff; }
  .om-page-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; transition: 0.2s; }
  .om-page-btn:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
  .om-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Modal & Dropdown */
  .om-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
  .om-modal { background: white; width: 750px; max-width: 95%; max-height: 90vh; border-radius: 16px; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
  
  .om-menu-btn { border: none; background: transparent; cursor: pointer; padding: 6px; border-radius: 6px; transition: 0.2s; color: #94a3b8; }
  .om-menu-btn:hover { background: #f1f5f9; color: #475569; }
  .om-dropdown { position: absolute; right: 40px; top: 10px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 15px rgba(0,0,0,0.1); z-index: 50; width: 160px; overflow: hidden; }
  .om-menu-item { padding: 10px 16px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; color: #334155; }
  .om-menu-item:hover { background: #f8fafc; color: #0f172a; }

  .animate-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  @media print { .print-hide { display: none !important; } }
`;

const OrderManager = () => {
  // --- STATE ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Pagination
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk Actions
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Modal & Print
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  const invoiceRef = useRef();

  // --- API CALLS ---
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders'); 
      setOrders(Array.isArray(res.data) ? res.data : []);
      setSelectedOrderIds([]); 
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      toast.error("Không thể tải danh sách đơn hàng.");
      setOrders([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const handleClickOutside = (event) => {
      if (!event.target.closest('.om-menu-btn') && !event.target.closest('.om-dropdown')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // --- ACTIONS ---
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}/status`, null, { params: { status: newStatus } });
      toast.success(`Đã cập nhật đơn #${id}`);
      
      // Optimistic Update
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      setActiveMenuId(null); // Đóng menu sau khi thao tác
    } catch (error) {
      toast.error("Lỗi cập nhật: " + (error.response?.data || error.message));
    }
  };

  const handleBulkUpdate = async (newStatus) => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`Xác nhận cập nhật ${selectedOrderIds.length} đơn hàng?`)) return;

    try {
      await Promise.all(selectedOrderIds.map(id => 
        api.put(`/orders/${id}/status`, null, { params: { status: newStatus } })
      ));
      toast.success(`Đã cập nhật ${selectedOrderIds.length} đơn hàng!`);
      fetchOrders();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật hàng loạt.");
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(oId => oId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (currentData) => {
    const allSelected = currentData.length > 0 && currentData.every(o => selectedOrderIds.includes(o.id));
    if (allSelected) {
      // Bỏ chọn tất cả trong trang hiện tại
      const idsToUnselect = currentData.map(o => o.id);
      setSelectedOrderIds(prev => prev.filter(id => !idsToUnselect.includes(id)));
    } else {
      // Chọn tất cả trong trang hiện tại
      const idsToSelect = currentData.map(o => o.id);
      setSelectedOrderIds(prev => [...new Set([...prev, ...idsToSelect])]);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `HoaDon_${selectedOrder?.id}`,
  });

  const handleExport = () => {
    if (processedData.allFilteredData.length === 0) {
      toast.error("Không có dữ liệu để xuất!");
      return;
    }
    const dataToExport = processedData.allFilteredData.map(order => ({
      "Mã đơn": order.id,
      "Khách hàng": order.customerName,
      "SĐT": order.phone,
      "Địa chỉ": order.address,
      "Ngày đặt": order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A',
      "Tổng tiền": order.totalAmount,
      "Trạng thái": order.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `Orders_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Xuất báo cáo thành công!");
  };

  // --- DATA PROCESSING ---
  const processedData = useMemo(() => {
    let data = [...orders]; // Clone array to avoid mutating state directly during sort
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(o => 
        o.id.toString().includes(lower) || 
        (o.customerName && o.customerName.toLowerCase().includes(lower)) ||
        (o.phone && o.phone.includes(lower))
      );
    }
    
    if (filterStatus !== 'ALL') {
      data = data.filter(o => o.status === filterStatus);
    }
    
    if (dateRange.start) {
      data = data.filter(o => new Date(o.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      data = data.filter(o => new Date(o.createdAt) <= endDate);
    }
    
    // Sort an toàn
    data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });

    const totalRevenue = data.reduce((sum, o) => o.status === 'COMPLETED' ? sum + (Number(o.totalAmount) || 0) : sum, 0);
    const pendingCount = data.filter(o => o.status === 'PENDING').length;

    const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    
    // Xử lý trường hợp filter làm giảm số trang nhưng currentPage vẫn ở trang cao
    const validCurrentPage = Math.min(currentPage, totalPages);
    if (validCurrentPage !== currentPage && validCurrentPage > 0) setCurrentPage(validCurrentPage);

    const currentData = data.slice((validCurrentPage - 1) * itemsPerPage, ((validCurrentPage - 1) * itemsPerPage) + itemsPerPage);

    return { total: data.length, totalPages, currentData, totalRevenue, pendingCount, allFilteredData: data };
  }, [orders, searchTerm, filterStatus, dateRange, currentPage]);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : 'N/A';

  const getStatusBadge = (status) => {
    const configs = {
      PENDING:   { bg: '#fffbeb', color: '#d97706', label: 'Chờ xử lý', icon: Clock },
      CONFIRMED: { bg: '#eff6ff', color: '#2563eb', label: 'Đã duyệt', icon: CheckCircle },
      SHIPPING:  { bg: '#f3e8ff', color: '#9333ea', label: 'Đang giao', icon: Truck },
      COMPLETED: { bg: '#dcfce7', color: '#16a34a', label: 'Hoàn thành', icon: Package },
      CANCELLED: { bg: '#fef2f2', color: '#dc2626', label: 'Đã hủy', icon: XCircle },
    };
    return configs[status] || configs.PENDING;
  };

  return (
    <div className="om-container">
      <style>{STYLES}</style>

      {/* 1. DASHBOARD THỐNG KÊ */}
      <div className="om-grid-4">
        <div className="om-stat-card">
          <div className="om-icon-box" style={{background: '#eff6ff', color: '#2563eb'}}><Package /></div>
          <div><div className="om-stat-label">Tổng đơn hàng</div><div className="om-stat-val">{processedData.total}</div></div>
        </div>
        <div className="om-stat-card">
          <div className="om-icon-box" style={{background: '#dcfce7', color: '#16a34a'}}><DollarSign /></div>
          <div><div className="om-stat-label">Doanh thu</div><div className="om-stat-val" style={{color: '#16a34a'}}>{formatPrice(processedData.totalRevenue)}</div></div>
        </div>
        <div className="om-stat-card">
          <div className="om-icon-box" style={{background: '#fffbeb', color: '#d97706'}}><Clock /></div>
          <div><div className="om-stat-label">Chờ xử lý</div><div className="om-stat-val">{processedData.pendingCount}</div></div>
        </div>
        <div className="om-stat-card" style={{cursor: 'pointer', border: '1px dashed #2563eb'}} onClick={fetchOrders}>
          <div className="om-icon-box" style={{background: '#f1f5f9', color: '#475569'}}><RefreshCw className={loading ? "animate-spin" : ""} /></div>
          <div><div className="om-stat-label">Cập nhật</div><div style={{fontSize: '14px', fontWeight: '600', color: '#2563eb', marginTop: '4px'}}>Làm mới dữ liệu</div></div>
        </div>
      </div>

      {/* 2. THANH CÔNG CỤ */}
      <div className="om-toolbar">
        <div className="om-search-group">
          <div className="om-input-wrapper">
            <Search size={18} className="om-search-icon" />
            <input 
              className="om-input" 
              placeholder="Tìm kiếm theo Mã đơn, Tên, SĐT..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="om-date-group">
            <Calendar size={16} color="#64748b"/>
            <input type="date" className="om-date-input" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
            <span style={{color:'#cbd5e1'}}>|</span>
            <input type="date" className="om-date-input" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
          </div>
        </div>
        <button className="om-btn-export" onClick={handleExport}><Download size={16}/> Xuất Excel</button>
      </div>

      {/* 3. BULK ACTIONS */}
      {selectedOrderIds.length > 0 && (
        <div className="om-bulk">
          <div style={{display:'flex', alignItems:'center', gap:'10px', color:'#1e40af', fontWeight:'600'}}>
            <CheckSquare size={20}/> Đã chọn {selectedOrderIds.length} đơn hàng
          </div>
          <div>
            <button className="om-bulk-btn" onClick={() => handleBulkUpdate('CONFIRMED')}>Duyệt đơn</button>
            <button className="om-bulk-btn" style={{color: '#9333ea', borderColor: '#d8b4fe'}} onClick={() => handleBulkUpdate('SHIPPING')}>Giao hàng</button>
            <button className="om-bulk-btn" style={{color: '#16a34a', borderColor: '#86efac'}} onClick={() => handleBulkUpdate('COMPLETED')}>Hoàn thành</button>
            <button className="om-bulk-btn" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => handleBulkUpdate('CANCELLED')}>Hủy đơn</button>
          </div>
        </div>
      )}

      {/* 4. TABS */}
      <div className="om-tabs">
        {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map(status => (
          <button 
            key={status} 
            className={`om-tab-btn ${filterStatus === status ? 'active' : ''}`}
            onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
          >
            {{ALL: 'Tất cả', PENDING: 'Chờ xử lý', CONFIRMED: 'Đã duyệt', SHIPPING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy'}[status]}
          </button>
        ))}
      </div>

      {/* 5. TABLE */}
      <div className="om-table-wrapper">
        <table className="om-table">
          <thead>
            <tr>
              <th className="om-th" style={{width: '50px', paddingLeft: '20px'}}>
                <input type="checkbox" 
                  onChange={() => toggleSelectAll(processedData.currentData)}
                  checked={processedData.currentData.length > 0 && processedData.currentData.every(o => selectedOrderIds.includes(o.id))}
                  style={{cursor:'pointer', width: 16, height: 16}}
                />
              </th>
              <th className="om-th">Mã đơn</th>
              <th className="om-th">Khách hàng</th>
              <th className="om-th">Thời gian</th>
              <th className="om-th">Tổng tiền</th>
              <th className="om-th">Trạng thái</th>
              <th className="om-th" style={{textAlign: 'right', paddingRight: '20px'}}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {processedData.currentData.map(order => {
              const statusCfg = getStatusBadge(order.status);
              const StatusIcon = statusCfg.icon;
              return (
                <tr key={order.id} className={`om-tr ${selectedOrderIds.includes(order.id) ? 'selected' : ''}`}>
                  <td className="om-td" style={{paddingLeft: '20px'}}>
                    <input type="checkbox" 
                      checked={selectedOrderIds.includes(order.id)} 
                      onChange={() => toggleSelectOrder(order.id)}
                      style={{cursor:'pointer', width: 16, height: 16}}
                    />
                  </td>
                  <td className="om-td"><span style={{fontWeight:'700', background:'#f1f5f9', padding:'4px 8px', borderRadius:'6px'}}>#{order.id}</span></td>
                  <td className="om-td">
                    <div style={{fontWeight:'600'}}>{order.customerName}</div>
                    <div style={{fontSize:'12px', color:'#64748b'}}>{order.phone}</div>
                  </td>
                  <td className="om-td">{formatDate(order.createdAt)}</td>
                  <td className="om-td"><span style={{fontWeight:'bold', color:'#0f172a'}}>{formatPrice(order.totalAmount)}</span></td>
                  <td className="om-td">
                    <span style={{background: statusCfg.bg, color: statusCfg.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                      <StatusIcon size={12}/> {statusCfg.label}
                    </span>
                  </td>
                  <td className="om-td" style={{textAlign:'right', position:'relative', paddingRight: '20px'}}>
                    <button className="om-menu-btn" onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === order.id ? null : order.id); }}>
                      <MoreVertical size={20} color="#94a3b8"/>
                    </button>
                    {activeMenuId === order.id && (
                      <div className="om-dropdown">
                        <div className="om-menu-item" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}><Eye size={14}/> Xem chi tiết</div>
                        {order.status === 'PENDING' && <div className="om-menu-item" style={{color:'#2563eb'}} onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}><CheckCircle size={14}/> Duyệt đơn</div>}
                        {order.status === 'CONFIRMED' && <div className="om-menu-item" style={{color:'#9333ea'}} onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}><Truck size={14}/> Giao hàng</div>}
                        {order.status === 'SHIPPING' && <div className="om-menu-item" style={{color:'#16a34a'}} onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}><Package size={14}/> Hoàn thành</div>}
                        {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && <div className="om-menu-item" style={{color:'#dc2626'}} onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}><XCircle size={14}/> Hủy đơn</div>}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {processedData.currentData.length === 0 && <tr><td colSpan="7" style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>Không tìm thấy đơn hàng nào.</td></tr>}
          </tbody>
        </table>
        
        {/* Pagination */}
        {processedData.totalPages > 1 && (
            <div className="om-pagination">
                <div style={{fontSize:'13px', color:'#64748b'}}>Trang <b>{currentPage}</b> / <b>{processedData.totalPages}</b></div>
                <div style={{display:'flex', gap:'5px'}}>
                    <button className="om-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/></button>
                    <button className="om-page-btn" disabled={currentPage === processedData.totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16}/></button>
                </div>
            </div>
        )}
      </div>

      {/* --- MODAL INVOICE (HÓA ĐƠN) --- */}
      {isModalOpen && selectedOrder && (
        <div className="om-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="om-modal om-invoice-content" onClick={e => e.stopPropagation()}>
            <div ref={invoiceRef} style={{background: 'white', paddingBottom: '20px'}}>
                {/* Header */}
                <div style={{padding:'20px 30px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc'}}>
                  <div>
                    <h3 style={{fontSize:'20px', fontWeight:'800', margin:'0 0 5px'}}>Đơn hàng <span style={{color:'#2563eb'}}>#{selectedOrder.id}</span></h3>
                    <div style={{fontSize:'13px', color:'#64748b', display:'flex', alignItems:'center', gap:'5px'}}><Clock size={14}/> {formatDate(selectedOrder.createdAt)}</div>
                  </div>
                  {/* Nút ẩn khi in */}
                  <div className="print-hide">
                    <button onClick={handlePrint} style={{border:'none', background:'white', border:'1px solid #cbd5e1', padding:'8px', borderRadius:'6px', cursor:'pointer', marginRight:'10px'}} title="In"><Printer size={18}/></button>
                    <button onClick={() => setIsModalOpen(false)} style={{border:'none', background:'#fee2e2', color:'#dc2626', padding:'8px', borderRadius:'6px', cursor:'pointer'}}><XCircle size={18}/></button>
                  </div>
                </div>

                {/* Body */}
                <div style={{padding:'30px'}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px', marginBottom:'30px'}}>
                    <div>
                      <div style={{fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', marginBottom:'8px'}}>Thông tin khách hàng</div>
                      <div style={{fontWeight:'700', fontSize:'16px'}}>{selectedOrder.customerName}</div>
                      <div style={{fontSize:'14px', color:'#475569', marginTop:'4px'}}>{selectedOrder.phone}</div>
                      <div style={{fontSize:'14px', color:'#94a3b8'}}>{selectedOrder.email || 'No email'}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', marginBottom:'8px'}}>Giao đến</div>
                      <div style={{fontWeight:'600', fontSize:'15px'}}>{selectedOrder.address}</div>
                      <div style={{marginTop:'10px'}}>
                        {(() => {
                          const s = getStatusBadge(selectedOrder.status);
                          return <span style={{background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px'}}>{s.label}</span>
                        })()}
                      </div>
                    </div>
                  </div>

                  <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
                    <thead>
                      <tr style={{borderBottom:'2px solid #e2e8f0'}}>
                        <th style={{textAlign:'left', padding:'10px 0', color:'#64748b'}}>Món ăn</th>
                        <th style={{textAlign:'center', width:'60px', color:'#64748b'}}>SL</th>
                        <th style={{textAlign:'right', width:'100px', color:'#64748b'}}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} style={{borderBottom:'1px solid #f1f5f9'}}>
                          <td style={{padding:'12px 0'}}>
                            <div style={{fontWeight:'600'}}>{item.foodName}</div>
                            {item.note && <div style={{fontSize:'12px', color:'#94a3b8', fontStyle:'italic'}}>Note: {item.note}</div>}
                          </td>
                          <td style={{textAlign:'center'}}>x{item.quantity}</td>
                          {/* Giả sử item có price, nếu không thì hiển thị --- */}
                          <td style={{textAlign:'right'}}>{item.price ? formatPrice(item.price * item.quantity) : '---'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{marginTop:'30px', paddingTop:'20px', borderTop:'2px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{fontSize:'14px', color:'#64748b'}}>Thanh toán khi nhận hàng (COD)</div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'12px', fontWeight:'700', color:'#64748b', textTransform:'uppercase'}}>Tổng thanh toán</div>
                      <div style={{fontSize:'28px', fontWeight:'800', color:'#0f172a'}}>{formatPrice(selectedOrder.totalAmount)}</div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
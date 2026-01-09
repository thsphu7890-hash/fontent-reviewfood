import React, { useEffect, useState, useMemo, useRef } from 'react';
import api from '../../api/axios';
import { 
  Eye, CheckCircle, XCircle, Truck, Clock, 
  Search, Package, Calendar, Download, 
  ChevronLeft, ChevronRight, DollarSign, RefreshCw, 
  MoreVertical, Printer, CheckSquare, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

// Cấu hình Badge trạng thái
const STATUS_CONFIG = {
  PENDING:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xử lý', icon: Clock },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã duyệt', icon: CheckCircle },
  SHIPPING:  { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang giao', icon: Truck },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành', icon: Package },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy', icon: XCircle },
};

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

  // Actions
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  const invoiceRef = useRef();
  const dropdownRef = useRef(null);

  // --- API ---
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders'); 
      setOrders(Array.isArray(res.data) ? res.data : []);
      setSelectedOrderIds([]); 
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Không thể tải danh sách đơn hàng.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Click outside handler for dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleUpdateStatus = async (id, newStatus) => {
    const previousOrders = [...orders]; // Backup for rollback
    // Optimistic UI Update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === id) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    setActiveMenuId(null);

    try {
      await api.put(`/orders/${id}/status`, null, { params: { status: newStatus } });
      toast.success(`Đơn #${id}: ${STATUS_CONFIG[newStatus].label}`);
    } catch (error) {
      setOrders(previousOrders); // Rollback
      toast.error("Lỗi cập nhật trạng thái!");
    }
  };

  const handleBulkUpdate = async (newStatus) => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`Xác nhận cập nhật ${selectedOrderIds.length} đơn hàng sang trạng thái: ${STATUS_CONFIG[newStatus].label}?`)) return;

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

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `HoaDon_${selectedOrder?.id || 'In'}`,
  });

  const handleExport = () => {
    if (processedData.allFilteredData.length === 0) return toast.error("Không có dữ liệu!");
    
    const dataToExport = processedData.allFilteredData.map(order => ({
      "Mã đơn": order.id,
      "Khách hàng": order.customerName,
      "SĐT": order.phone,
      "Địa chỉ": order.address,
      "Ngày đặt": formatDate(order.createdAt),
      "Tổng tiền": order.totalAmount,
      "Trạng thái": STATUS_CONFIG[order.status]?.label || order.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `BaoCao_DonHang_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Xuất file thành công!");
  };

  // --- HELPERS ---
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(p) || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : 'N/A';

  // --- DATA PROCESSING ---
  const processedData = useMemo(() => {
    let data = [...orders];

    // 1. Filter Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(o => 
        String(o.id).includes(lower) || 
        o.customerName?.toLowerCase().includes(lower) ||
        o.phone?.includes(lower)
      );
    }

    // 2. Filter Status
    if (filterStatus !== 'ALL') {
      data = data.filter(o => o.status === filterStatus);
    }

    // 3. Filter Date
    if (dateRange.start) {
      data = data.filter(o => new Date(o.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      data = data.filter(o => new Date(o.createdAt) <= endDate);
    }

    // 4. Sort (Mới nhất lên đầu)
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 5. Pagination
    const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
    const validPage = Math.min(currentPage, totalPages);
    if (validPage !== currentPage && validPage > 0) setCurrentPage(validPage);
    
    const currentData = data.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);
    
    // Stats
    const totalRevenue = data.reduce((sum, o) => o.status === 'COMPLETED' ? sum + (Number(o.totalAmount) || 0) : sum, 0);

    return { total: data.length, totalPages, currentData, totalRevenue, pendingCount: orders.filter(o => o.status === 'PENDING').length, allFilteredData: data };
  }, [orders, searchTerm, filterStatus, dateRange, currentPage]);

  // Checkbox logic
  const toggleSelectAll = () => {
    const currentIds = processedData.currentData.map(o => o.id);
    const allSelected = currentIds.every(id => selectedOrderIds.includes(id));
    
    if (allSelected) {
      setSelectedOrderIds(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      setSelectedOrderIds(prev => [...new Set([...prev, ...currentIds])]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* 1. DASHBOARD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard 
          icon={<Package />} color="bg-blue-50 text-blue-600" 
          label="Tổng đơn hàng" value={processedData.total} 
        />
        <StatCard 
          icon={<DollarSign />} color="bg-green-50 text-green-600" 
          label="Doanh thu thực tế" value={formatPrice(processedData.totalRevenue)} 
        />
        <StatCard 
          icon={<Clock />} color="bg-yellow-50 text-yellow-600" 
          label="Đơn chờ xử lý" value={processedData.pendingCount} 
        />
        <div 
          onClick={fetchOrders}
          className="bg-white p-5 rounded-xl border border-dashed border-blue-300 cursor-pointer hover:bg-blue-50 transition-colors flex items-center gap-4 group"
        >
          <div className={`w-12 h-12 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:text-blue-600 ${loading ? 'animate-spin' : ''}`}>
            <RefreshCw size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">Cập nhật</div>
            <div className="text-sm font-semibold text-blue-600 mt-1">Làm mới dữ liệu</div>
          </div>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
              placeholder="Tìm theo Mã đơn, Tên, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 h-[42px]">
            <Calendar size={16} className="text-slate-500" />
            <input type="date" className="bg-transparent border-none outline-none text-xs text-slate-600 font-medium" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
            <span className="text-slate-300">|</span>
            <input type="date" className="bg-transparent border-none outline-none text-xs text-slate-600 font-medium" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
          </div>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <Download size={16} /> Xuất Excel
        </button>
      </div>

      {/* 3. BULK ACTIONS */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-blue-800 font-semibold px-2">
            <CheckSquare size={20}/> Đã chọn {selectedOrderIds.length} đơn
          </div>
          <div className="flex gap-2">
            <BulkBtn label="Duyệt" color="text-blue-600 border-blue-200 hover:bg-blue-100" onClick={() => handleBulkUpdate('CONFIRMED')} />
            <BulkBtn label="Giao hàng" color="text-purple-600 border-purple-200 hover:bg-purple-100" onClick={() => handleBulkUpdate('SHIPPING')} />
            <BulkBtn label="Hoàn thành" color="text-green-600 border-green-200 hover:bg-green-100" onClick={() => handleBulkUpdate('COMPLETED')} />
            <BulkBtn label="Hủy" color="text-red-600 border-red-200 hover:bg-red-100" onClick={() => handleBulkUpdate('CANCELLED')} />
          </div>
        </div>
      )}

      {/* 4. TABS & TABLE */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map(status => (
          <button 
            key={status} 
            onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              filterStatus === status 
                ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-500 border-transparent hover:bg-slate-100'
            }`}
          >
            {{ALL: 'Tất cả', PENDING: 'Chờ xử lý', CONFIRMED: 'Đã duyệt', SHIPPING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy'}[status]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" 
                    onChange={toggleSelectAll}
                    checked={processedData.currentData.length > 0 && processedData.currentData.every(o => selectedOrderIds.includes(o.id))}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Ngày đặt</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedData.currentData.length > 0 ? processedData.currentData.map(order => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusCfg.icon;
                return (
                  <tr key={order.id} className={`hover:bg-slate-50 transition-colors ${selectedOrderIds.includes(order.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="p-4 text-center">
                      <input type="checkbox" 
                        checked={selectedOrderIds.includes(order.id)} 
                        onChange={() => setSelectedOrderIds(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id])}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">#{order.id}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700">{order.customerName}</div>
                      <div className="text-xs text-slate-500">{order.phone}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{formatDate(order.createdAt)}</td>
                    <td className="p-4 font-bold text-slate-800">{formatPrice(order.totalAmount)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                        <StatusIcon size={12} /> {statusCfg.label}
                      </span>
                    </td>
                    <td className="p-4 text-right relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === order.id ? null : order.id); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {activeMenuId === order.id && (
                        <div ref={dropdownRef} className="absolute right-10 top-2 w-40 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                          <MenuItem icon={<Eye size={14}/>} label="Xem chi tiết" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); setActiveMenuId(null); }} />
                          <div className="h-px bg-slate-100 my-1"></div>
                          {order.status === 'PENDING' && <MenuItem icon={<CheckCircle size={14}/>} label="Duyệt đơn" color="text-blue-600" onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')} />}
                          {order.status === 'CONFIRMED' && <MenuItem icon={<Truck size={14}/>} label="Giao hàng" color="text-purple-600" onClick={() => handleUpdateStatus(order.id, 'SHIPPING')} />}
                          {order.status === 'SHIPPING' && <MenuItem icon={<Package size={14}/>} label="Hoàn thành" color="text-green-600" onClick={() => handleUpdateStatus(order.id, 'COMPLETED')} />}
                          {!['CANCELLED', 'COMPLETED'].includes(order.status) && <MenuItem icon={<XCircle size={14}/>} label="Hủy đơn" color="text-red-600" onClick={() => handleUpdateStatus(order.id, 'CANCELLED')} />}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Package size={48} className="mb-2 opacity-20" />
                      <p>Không tìm thấy đơn hàng nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {processedData.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
            <span className="text-sm text-slate-500">Trang <b>{currentPage}</b> / <b>{processedData.totalPages}</b></span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={16}/></button>
              <button disabled={currentPage === processedData.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>

      {/* --- INVOICE MODAL --- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-[800px] max-w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div ref={invoiceRef} className="bg-white p-0">
              {/* Header Invoice */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Đơn hàng <span className="text-blue-600">#{selectedOrder.id}</span></h3>
                  <div className="text-sm text-slate-500 mt-1 flex items-center gap-2"><Clock size={14}/> {formatDate(selectedOrder.createdAt)}</div>
                </div>
                <div className="print-hide flex gap-2">
                  <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm"><Printer size={16}/> In</button>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><XCircle size={20}/></button>
                </div>
              </div>

              {/* Body Invoice */}
              <div className="p-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Khách hàng</h4>
                    <p className="text-lg font-bold text-slate-800">{selectedOrder.customerName}</p>
                    <p className="text-slate-600">{selectedOrder.phone}</p>
                    <p className="text-slate-400 text-sm">{selectedOrder.email || 'Không có email'}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Địa chỉ giao hàng</h4>
                    <p className="font-medium text-slate-800">{selectedOrder.address}</p>
                    <div className="mt-3">
                      {(() => {
                        const s = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.PENDING;
                        return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>
                      })()}
                    </div>
                  </div>
                </div>

                <table className="w-full border-collapse mb-8">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="text-left py-3 text-sm font-semibold text-slate-500">Món ăn</th>
                      <th className="text-center py-3 text-sm font-semibold text-slate-500 w-20">SL</th>
                      <th className="text-right py-3 text-sm font-semibold text-slate-500 w-32">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-4">
                          <p className="font-bold text-slate-700">{item.foodName}</p>
                          {item.note && <p className="text-xs text-slate-400 italic mt-1">Ghi chú: {item.note}</p>}
                        </td>
                        <td className="py-4 text-center text-slate-600">x{item.quantity}</td>
                        <td className="py-4 text-right font-medium text-slate-800">
                          {item.price ? formatPrice(item.price * item.quantity) : '---'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-center pt-6 border-t-2 border-slate-100">
                  <div className="text-sm text-slate-500">Phương thức: <span className="font-semibold text-slate-700">Thanh toán khi nhận hàng (COD)</span></div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Tổng thanh toán</p>
                    <p className="text-3xl font-extrabold text-blue-600 mt-1">{formatPrice(selectedOrder.totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Style Inject */}
      <style>{`
        @media print {
          .print-hide { display: none !important; }
          body { background: white; }
          .om-modal { box-shadow: none; border: none; }
        }
      `}</style>
    </div>
  );
};

// --- SUB COMPONENTS (Để code gọn hơn) ---
const StatCard = ({ icon, color, label, value }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-xl font-extrabold text-slate-800 mt-1">{value}</div>
    </div>
  </div>
);

const BulkBtn = ({ label, color, onClick }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-lg border text-xs font-bold bg-white transition-all ${color}`}>
    {label}
  </button>
);

const MenuItem = ({ icon, label, color = "text-slate-600", onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${color}`}>
    {icon} {label}
  </button>
);

export default OrderManager;
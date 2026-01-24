import React, { useEffect, useState, useMemo, useRef } from 'react';
import api from '../../api/axios';
import { 
  CheckCircle, XCircle, Truck, Clock, 
  Search, Package, Calendar, Download, 
  ChevronLeft, ChevronRight, RefreshCw, 
  Printer, CheckSquare, MoreVertical, Eye, MapPin, Phone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

// Cấu hình hiển thị trạng thái (Màu sắc & Label)
const STATUS_CONFIG = {
  PENDING:   { color: '#f59e0b', label: 'Chờ xử lý', icon: Clock, bg: '#fef3c7' },
  CONFIRMED: { color: '#3b82f6', label: 'Đã duyệt', icon: CheckCircle, bg: '#dbeafe' },
  SHIPPING:  { color: '#8b5cf6', label: 'Đang giao', icon: Truck, bg: '#ede9fe' },
  COMPLETED: { color: '#10b981', label: 'Hoàn thành', icon: Package, bg: '#d1fae5' },
  CANCELLED: { color: '#ef4444', label: 'Đã hủy', icon: XCircle, bg: '#fee2e2' },
};

const OrderManager = () => {
  // --- STATE ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Actions
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const invoiceRef = useRef();

  // --- API ---
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders'); 
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // --- HANDLERS ---
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      // Optimistic Update
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === id) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      
      await api.put(`/api/orders/${id}/status`, null, { params: { status: newStatus } });
      toast.success(`Đã cập nhật trạng thái đơn #${id}`);
    } catch (error) {
      fetchOrders(); // Revert nếu lỗi
      toast.error("Lỗi cập nhật trạng thái!");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `HoaDon_${selectedOrder?.id || 'In'}`,
  });

  const handleExport = () => {
    if (processedData.currentData.length === 0) return toast.error("Không có dữ liệu!");
    const dataToExport = processedData.allFilteredData.map(order => ({
      "Mã đơn": order.id,
      "Khách hàng": order.customerName,
      "Tổng tiền": order.totalAmount,
      "Trạng thái": STATUS_CONFIG[order.status]?.label || order.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `DonHang_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Xuất file thành công!");
  };

  // --- HELPERS ---
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(p) || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : 'N/A';

  // --- DATA PROCESSING ---
  const processedData = useMemo(() => {
    let data = [...orders];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(o => String(o.id).includes(lower) || o.customerName?.toLowerCase().includes(lower) || o.phone?.includes(lower));
    }
    if (filterStatus !== 'ALL') data = data.filter(o => o.status === filterStatus);
    if (dateRange.start) data = data.filter(o => new Date(o.createdAt) >= new Date(dateRange.start));
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      data = data.filter(o => new Date(o.createdAt) <= endDate);
    }
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
    const validPage = Math.min(currentPage, totalPages);
    if (validPage !== currentPage && validPage > 0) setCurrentPage(validPage);
    
    const currentData = data.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);
    return { total: data.length, totalPages, currentData, allFilteredData: data };
  }, [orders, searchTerm, filterStatus, dateRange, currentPage]);


  return (
    <div className="mgr-container">
      {/* --- INJECT CSS STYLE CỦA BẠN --- */}
      <style>{`
        .mgr-container { padding: 30px; font-family: 'Inter', sans-serif; color: #1f2937; background: #f3f4f6; min-height: 100vh; }
        
        /* HEADER */
        .mgr-header { margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
        .mgr-title h2 { font-size: 28px; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.5px; }
        .mgr-title p { color: #6b7280; font-size: 15px; margin-top: 6px; }

        /* TOOLBAR */
        .mgr-toolbar { 
            display: flex; gap: 15px; align-items: center; background: white; flex-wrap: wrap;
            padding: 15px 20px; border-radius: 16px; margin-bottom: 30px; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border: 1px solid rgba(229, 231, 235, 0.5);
        }
        .search-box { position: relative; flex: 1; min-width: 200px; }
        .search-input { width: 100%; padding: 12px 12px 12px 45px; border: 1px solid #e5e7eb; border-radius: 12px; outline: none; font-size: 14px; transition: 0.2s; background: #f9fafb; box-sizing: border-box; }
        .search-input:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        
        .filter-select { padding: 11px 15px; border: 1px solid #e5e7eb; border-radius: 12px; outline: none; background: white; cursor: pointer; font-size: 14px; color: #4b5563; font-weight: 500; min-width: 140px; }
        
        .btn-tool { background: white; color: #374151; border: 1px solid #e5e7eb; padding: 11px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-size: 14px; }
        .btn-tool:hover { background: #f3f4f6; border-color: #d1d5db; }
        .btn-primary { background: #111827; color: white; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); }

        /* --- CARD STYLE (CUSTOM FOR ORDERS) --- */
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
        
        .food-card { 
            background: white; border-radius: 20px; overflow: hidden; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            display: flex; flex-direction: column; position: relative;
            border: 1px solid rgba(0,0,0,0.04);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            height: 100%;
        }
        .food-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-color: #e5e7eb;
        }

        /* HEADER CARD (Thay cho ảnh món ăn) */
        .card-img-wrapper { 
            position: relative; width: 100%; height: 100px; 
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; 
        }
        .status-bg-icon { opacity: 0.15; transform: scale(3) rotate(-15deg); }
        
        .price-badge { 
            position: absolute; top: 15px; right: 15px; 
            background: rgba(255, 255, 255, 0.95); 
            padding: 6px 12px; border-radius: 30px; 
            font-weight: 800; color: #111827; font-size: 14px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            backdrop-filter: blur(4px);
        }

        /* Nội dung card */
        .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
        
        .card-tags { display: flex; gap: 8px; margin-bottom: 12px; }
        .cat-pill { 
            font-size: 11px; font-weight: 700; 
            padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;
            display: inline-flex; align-items: center; gap: 4px;
        }

        .card-title { font-weight: 800; color: #111827; margin-bottom: 4px; font-size: 18px; line-height: 1.4; }
        .card-subtitle { font-size: 13px; color: #6b7280; font-family: monospace; margin-bottom: 12px; }
        
        .card-info-row { font-size: 13px; color: #4b5563; display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        
        /* Nút hành động */
        .card-actions { margin-top: auto; padding-top: 15px; border-top: 1px dashed #e5e7eb; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .btn-action { 
            padding: 10px; border-radius: 10px; border: none; cursor: pointer; 
            display: flex; align-items: center; justify-content: center; gap: 6px; 
            font-size: 13px; font-weight: 600; transition: 0.2s; 
        }
        .btn-view { background: #f3f4f6; color: #374151; }
        .btn-view:hover { background: #e5e7eb; color: #111827; }
        
        /* PAGINATION */
        .pagination { display: flex; justify-content: center; margin-top: 40px; gap: 8px; }
        .page-btn { width: 40px; height: 40px; border: 1px solid #e5e7eb; background: white; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-weight: 600; color: #4b5563; }
        .page-btn.active { background: #111827; color: white; border-color: #111827; }
        .page-btn:hover:not(.active):not(:disabled) { border-color: #6366f1; color: #6366f1; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* MODAL (GIỮ NGUYÊN) */
        .modal-overlay { fixed inset-0 bg-black/50 z-50 flex items-center justify-center; }
      `}</style>

      {/* HEADER */}
      <div className="mgr-header">
        <div className="mgr-title">
            <h2>Quản lý đơn hàng</h2>
            <p>Theo dõi và cập nhật trạng thái đơn hàng của cửa hàng</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="mgr-toolbar">
        <div className="search-box">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                className="search-input" 
                placeholder="Tìm Mã đơn, Tên, SĐT..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
        >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã duyệt</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
        </select>

        <button onClick={fetchOrders} className="btn-tool" title="Làm mới"><RefreshCw size={18}/></button>
        <button onClick={handleExport} className="btn-tool btn-primary"><Download size={18}/> Xuất Excel</button>
      </div>

      {/* CARD GRID (THAY CHO TABLE) */}
      <div className="card-grid">
        {processedData.currentData.length > 0 ? (
            processedData.currentData.map(order => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusCfg.icon;

                return (
                    <div key={order.id} className="food-card">
                        {/* Header màu sắc thay cho Ảnh */}
                        <div className="card-img-wrapper" style={{background: statusCfg.bg}}>
                            <StatusIcon size={80} color={statusCfg.color} className="status-bg-icon"/>
                            <div className="price-badge">{formatPrice(order.totalAmount)}</div>
                            <div style={{position: 'absolute', bottom: 10, left: 15, fontWeight: 700, color: statusCfg.color, display: 'flex', alignItems: 'center', gap: 5}}>
                                <StatusIcon size={16}/> {statusCfg.label}
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="card-tags">
                                <span className="cat-pill" style={{background: '#f3f4f6', color: '#6b7280'}}>
                                    COD
                                </span>
                                <span className="cat-pill" style={{background: '#f3f4f6', color: '#6b7280'}}>
                                    {order.items?.length || 0} món
                                </span>
                            </div>

                            <div className="card-title">{order.customerName}</div>
                            <div className="card-subtitle">#{order.id} • {formatDate(order.createdAt)}</div>

                            <div className="card-info-row"><Phone size={14}/> {order.phone}</div>
                            <div className="card-info-row" style={{alignItems: 'flex-start'}}>
                                <MapPin size={14} style={{marginTop: 2, flexShrink: 0}}/> 
                                <span style={{display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{order.address}</span>
                            </div>

                            <div className="card-actions">
                                <button className="btn-action btn-view" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>
                                    <Eye size={16}/> Chi tiết
                                </button>
                                
                                {/* Nút thao tác nhanh dựa trên trạng thái */}
                                {order.status === 'PENDING' && (
                                    <button className="btn-action" style={{background: '#dbeafe', color: '#2563eb'}} onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}>
                                        <CheckCircle size={16}/> Duyệt
                                    </button>
                                )}
                                {order.status === 'CONFIRMED' && (
                                    <button className="btn-action" style={{background: '#ede9fe', color: '#7c3aed'}} onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}>
                                        <Truck size={16}/> Giao
                                    </button>
                                )}
                                {order.status === 'SHIPPING' && (
                                    <button className="btn-action" style={{background: '#d1fae5', color: '#059669'}} onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}>
                                        <Package size={16}/> Xong
                                    </button>
                                )}
                                {['COMPLETED', 'CANCELLED'].includes(order.status) && (
                                    <button className="btn-action" disabled style={{opacity: 0.5, cursor: 'default'}}>
                                        <CheckSquare size={16}/> Đã xong
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })
        ) : (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: 50, color: '#9ca3af'}}>
                <Package size={48} style={{margin: '0 auto 10px', opacity: 0.3}}/>
                <p>Không tìm thấy đơn hàng nào</p>
            </div>
        )}
      </div>

      {/* PAGINATION */}
      {processedData.totalPages > 1 && (
        <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="page-btn"><ChevronLeft size={18}/></button>
            {Array.from({length: processedData.totalPages}, (_, i) => i + 1).map(page => (
                <button key={page} className={`page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>
                    {page}
                </button>
            ))}
            <button disabled={currentPage === processedData.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="page-btn"><ChevronRight size={18}/></button>
        </div>
      )}

      {/* --- MODAL CHI TIẾT ĐƠN HÀNG (Style cũ nhưng clean lại) --- */}
      {isModalOpen && selectedOrder && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Phần nội dung Modal giữ nguyên logic hiển thị chi tiết của bạn, chỉ bọc style cho gọn */}
                <div ref={invoiceRef} className="p-10">
                    <div className="flex justify-between items-start mb-8 border-b pb-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 uppercase">Hóa đơn</h2>
                            <p className="text-gray-500 text-sm mt-1">#{selectedOrder.id} • {formatDate(selectedOrder.createdAt)}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-blue-600">FOOD NEST</h3>
                            <p className="text-xs text-gray-400">Hotline: 1900 1234</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Khách hàng</p>
                            <p className="font-bold text-lg">{selectedOrder.customerName}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.phone}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs font-bold text-gray-400 uppercase">Giao tới</p>
                             <p className="font-medium text-sm">{selectedOrder.address}</p>
                        </div>
                    </div>

                    <table className="w-full mb-8 text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                            <tr><th className="py-2 text-left pl-2">Món</th><th className="py-2 text-center">SL</th><th className="py-2 text-right pr-2">Tổng</th></tr>
                        </thead>
                        <tbody className="divide-y">
                            {selectedOrder.items?.map((item, i) => (
                                <tr key={i}>
                                    <td className="py-3 pl-2 font-medium">{item.foodName}</td>
                                    <td className="py-3 text-center">x{item.quantity}</td>
                                    <td className="py-3 text-right pr-2 font-bold">{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="flex justify-end border-t pt-4">
                        <div className="w-1/2 flex justify-between items-center">
                            <span className="font-bold text-gray-800">Tổng thanh toán</span>
                            <span className="text-2xl font-black text-blue-600">{formatPrice(selectedOrder.totalAmount)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-4 border-t flex justify-end gap-3 print:hidden">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200">Đóng</button>
                    <button onClick={handlePrint} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-800 text-white hover:bg-black flex items-center gap-2"><Printer size={16}/> In hóa đơn</button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default OrderManager;
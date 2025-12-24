import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Eye, CheckCircle, XCircle, Truck, Clock, 
  Search, Filter, Package, AlertCircle 
} from 'lucide-react';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // State cho Modal chi tiết
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 1. LẤY DỮ LIỆU ĐƠN HÀNG ---
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Backend cần có API trả về tất cả đơn hàng (cho Admin)
      // Ví dụ: GET /api/orders (hoặc /api/admin/orders)
      const res = await api.get('/orders'); 
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- 2. XỬ LÝ TRẠNG THÁI ĐƠN HÀNG ---
  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Bạn chắc chắn muốn chuyển trạng thái sang "${newStatus}"?`)) return;

    try {
      // Backend cần API cập nhật trạng thái: PUT /api/orders/{id}/status?status=...
      await api.put(`/orders/${id}/status`, null, { params: { status: newStatus } });
      alert("Cập nhật thành công!");
      fetchOrders(); // Load lại
    } catch (error) {
      alert("Lỗi cập nhật: " + (error.response?.data || error.message));
    }
  };

  // --- HELPER: LỌC & TÌM KIẾM ---
  const filteredOrders = orders.filter(order => {
    const matchStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchSearch = order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        order.id.toString().includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
  const formatDate = (d) => new Date(d).toLocaleString('vi-VN');

  // Helper hiển thị Badge trạng thái đẹp
  const getStatusBadge = (status) => {
    const styles = {
      PENDING:   { bg: '#fef3c7', color: '#d97706', label: 'Chờ xử lý', icon: <Clock size={14}/> },
      CONFIRMED: { bg: '#dbeafe', color: '#2563eb', label: 'Đã duyệt', icon: <CheckCircle size={14}/> },
      SHIPPING:  { bg: '#f3e8ff', color: '#9333ea', label: 'Đang giao', icon: <Truck size={14}/> },
      COMPLETED: { bg: '#dcfce7', color: '#16a34a', label: 'Hoàn thành', icon: <Package size={14}/> },
      CANCELLED: { bg: '#fee2e2', color: '#dc2626', label: 'Đã hủy', icon: <XCircle size={14}/> },
    };
    const s = styles[status] || styles.PENDING;
    return (
      <span style={{background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div className="mgr-container">
      <style>{`
        .mgr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .filter-bar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        
        .search-box { position: relative; width: 300px; }
        .search-inp { width: 100%; padding: 10px 10px 10px 36px; border: 1px solid #ddd; border-radius: 8px; outline: none; }
        .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        
        .filter-btn { padding: 8px 16px; border: 1px solid #e5e7eb; background: white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: 0.2s; }
        .filter-btn.active { background: #111827; color: white; border-color: #111827; }
        
        .order-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .order-table th { background: #f9fafb; text-align: left; padding: 16px; font-size: 13px; color: #6b7280; text-transform: uppercase; font-weight: 700; }
        .order-table td { padding: 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
        .order-table tr:last-child td { border-bottom: none; }
        .order-table tr:hover { background: #f9fafb; }

        .action-btn { padding: 6px; border-radius: 6px; border: none; cursor: pointer; margin-right: 6px; transition: 0.2s; }
        .btn-view { background: #eff6ff; color: #3b82f6; }
        .btn-approve { background: #ecfdf5; color: #059669; }
        .btn-cancel { background: #fef2f2; color: #ef4444; }
        .action-btn:hover { filter: brightness(0.95); }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .modal-box { background: white; width: 600px; padding: 30px; border-radius: 16px; position: relative; max-height: 90vh; overflow-y: auto; }
        .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
      `}</style>

      <div className="mgr-header">
        <h2 style={{fontSize: '24px', fontWeight: '900'}}>Quản lý <span style={{color: '#ef4444'}}>Đơn hàng</span></h2>
      </div>

      <div className="filter-bar">
        <div className="search-box">
           <Search size={18} className="search-icon" />
           <input 
             className="search-inp" 
             placeholder="Tìm tên khách hoặc Mã đơn..." 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        
        {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map(status => (
          <button 
            key={status}
            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status === 'ALL' ? 'Tất cả' : status}
          </button>
        ))}
      </div>

      {loading ? <div style={{textAlign:'center', padding:40}}>Đang tải...</div> : (
        <table className="order-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? filteredOrders.map(order => (
              <tr key={order.id}>
                <td><b>#{order.id}</b></td>
                <td>
                    <div>{order.customerName}</div>
                    <div style={{fontSize: 12, color:'#9ca3af'}}>{order.phone}</div>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td style={{fontWeight:'bold', color:'#ef4444'}}>{formatPrice(order.totalAmount)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <button className="action-btn btn-view" title="Xem chi tiết" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>
                    <Eye size={18} />
                  </button>

                  {/* Logic nút bấm dựa trên trạng thái */}
                  {order.status === 'PENDING' && (
                    <>
                      <button className="action-btn btn-approve" title="Duyệt đơn" onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}>
                        <CheckCircle size={18} />
                      </button>
                      <button className="action-btn btn-cancel" title="Hủy đơn" onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}>
                        <XCircle size={18} />
                      </button>
                    </>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <button className="action-btn btn-view" style={{background:'#f3e8ff', color:'#9333ea'}} title="Giao hàng" onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}>
                        <Truck size={18} />
                    </button>
                  )}

                  {order.status === 'SHIPPING' && (
                    <button className="action-btn btn-approve" title="Hoàn thành" onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}>
                        <Package size={18} />
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{textAlign:'center', padding: 40, color:'#9ca3af'}}>
                   Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
             <h3 style={{fontSize: 22, fontWeight: 800, marginBottom: 20, borderBottom:'1px solid #eee', paddingBottom: 15}}>
                Chi tiết đơn hàng #{selectedOrder.id}
             </h3>
             
             <div style={{marginBottom: 20, background:'#f9fafb', padding: 15, borderRadius: 8}}>
                <p><strong>Khách hàng:</strong> {selectedOrder.customerName}</p>
                <p><strong>SĐT:</strong> {selectedOrder.phone}</p>
                <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
                <p><strong>Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}</p>
             </div>

             <h4 style={{marginBottom: 10}}>Danh sách món:</h4>
             <div style={{maxHeight: 300, overflowY:'auto'}}>
                {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="item-row">
                        <div>
                            <div style={{fontWeight:'bold'}}>{item.foodName}</div>
                            {/* Nếu backend có trả về size/note thì hiện ở đây */}
                            {/* <div style={{fontSize:12, color:'#666'}}>Note: ...</div> */}
                        </div>
                        <div style={{textAlign:'right'}}>
                            <div>x{item.quantity}</div>
                            {/* Nếu muốn tính giá từng món thì backend cần trả về price của item */}
                        </div>
                    </div>
                ))}
             </div>

             <div style={{marginTop: 20, borderTop:'1px solid #eee', paddingTop: 15, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                 <span style={{fontSize: 16, fontWeight: 600}}>Tổng cộng:</span>
                 <span style={{fontSize: 24, fontWeight: 900, color:'#ef4444'}}>{formatPrice(selectedOrder.totalAmount)}</span>
             </div>

             <button 
                onClick={() => setIsModalOpen(false)}
                style={{width:'100%', marginTop: 20, padding: 12, background:'#111', color:'white', border:'none', borderRadius: 8, fontWeight:'bold', cursor:'pointer'}}
             >
                Đóng
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
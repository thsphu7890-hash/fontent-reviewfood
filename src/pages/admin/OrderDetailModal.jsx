import React, { useRef } from 'react';
import { 
  X, Printer, Clock, MapPin, User, Mail, Phone, 
  CheckCircle, Truck, Package, CreditCard, ShoppingBag 
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const OrderDetailModal = ({ order, onClose, onUpdateStatus }) => {
  const invoiceRef = useRef();

  // Xử lý in ấn
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `HoaDon_${order.id}`,
  });

  // Helper định dạng tiền & ngày
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  const formatDate = (d) => new Date(d).toLocaleString('vi-VN');

  // Helper hiển thị Timeline trạng thái
  const renderTimeline = (status) => {
    const steps = [
      { key: 'PENDING', label: 'Chờ xử lý', icon: Clock },
      { key: 'CONFIRMED', label: 'Đã duyệt', icon: CheckCircle },
      { key: 'SHIPPING', label: 'Đang giao', icon: Truck },
      { key: 'COMPLETED', label: 'Hoàn thành', icon: Package },
    ];

    // Tìm vị trí trạng thái hiện tại
    const currentIndex = steps.findIndex(s => s.key === status);
    const isCancelled = status === 'CANCELLED';

    if (isCancelled) {
      return (
        <div style={{background: '#fef2f2', color: '#dc2626', padding: '15px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #fecaca'}}>
          ĐƠN HÀNG ĐÃ BỊ HỦY
        </div>
      );
    }

    return (
      <div style={{display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '30px', marginTop: '10px'}}>
        {/* Line connector */}
        <div style={{position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: 0}}></div>
        
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const Icon = step.icon;
          return (
            <div key={step.key} style={{position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', 
                background: isActive ? '#2563eb' : 'white', 
                border: isActive ? 'none' : '2px solid #e2e8f0',
                color: isActive ? 'white' : '#cbd5e1',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={16} />
              </div>
              <span style={{fontSize: '12px', fontWeight: isActive ? '700' : '500', color: isActive ? '#1e293b' : '#94a3b8'}}>{step.label}</span>
            </div>
          )
        })}
      </div>
    );
  };

  // --- STYLES ---
  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
    modal: { background: '#f8fafc', width: '800px', maxWidth: '95%', maxHeight: '95vh', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' },
    header: { background: 'white', padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    body: { padding: '30px', overflowY: 'auto', flex: 1 },
    paper: { background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' },
    sectionTitle: { fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' },
    infoBox: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', color: '#64748b' },
    value: { fontSize: '15px', fontWeight: '600', color: '#1e293b' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { textAlign: 'left', padding: '12px 0', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' },
    td: { padding: '16px 0', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '14px' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #f1f5f9' },
    btnGroup: { display: 'flex', gap: '10px' },
    btn: { border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' },
    btnClose: { background: '#f1f5f9', color: '#64748b' },
    btnPrint: { background: '#eff6ff', color: '#2563eb' }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        
        {/* Header Modal (Không in) */}
        <div style={s.header}>
          <div>
            <h2 style={{margin: 0, fontSize: '20px', fontWeight: '800', color: '#1e293b'}}>Chi tiết đơn hàng</h2>
            <span style={{fontSize: '13px', color: '#64748b'}}>ID: #{order.id}</span>
          </div>
          <div style={s.btnGroup}>
            <button style={{...s.btn, ...s.btnPrint}} onClick={handlePrint}><Printer size={18}/> In hóa đơn</button>
            <button style={{...s.btn, ...s.btnClose}} onClick={onClose}><X size={20}/></button>
          </div>
        </div>

        {/* Body (Phần này sẽ cuộn) */}
        <div style={s.body}>
          
          {/* Thanh trạng thái */}
          <div style={{marginBottom: '30px', padding: '0 20px'}}>
            {renderTimeline(order.status)}
          </div>

          {/* Vùng giấy in (Invoice) */}
          <div ref={invoiceRef} style={s.paper}>
            {/* Invoice Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '2px solid #f8fafc', paddingBottom: '20px'}}>
              <div>
                <div style={{fontSize: '24px', fontWeight: '900', color: '#2563eb', display:'flex', alignItems:'center', gap:'10px'}}>
                  <ShoppingBag /> FOOD REVIEW
                </div>
                <div style={{fontSize: '13px', color: '#64748b', marginTop: '5px'}}>Hóa đơn điện tử</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '16px', fontWeight: 'bold'}}>#{order.id}</div>
                <div style={{fontSize: '13px', color: '#64748b'}}>{formatDate(order.createdAt)}</div>
              </div>
            </div>

            {/* Info Grid */}
            <div style={s.infoGrid}>
              <div style={s.infoBox}>
                <div style={s.sectionTitle}><User size={16}/> Khách hàng</div>
                <div style={s.value}>{order.customerName}</div>
                <div style={{...s.label, display:'flex', alignItems:'center', gap:'6px'}}><Phone size={14}/> {order.phone}</div>
                <div style={{...s.label, display:'flex', alignItems:'center', gap:'6px'}}><Mail size={14}/> {order.email || 'Chưa cập nhật'}</div>
              </div>
              <div style={{...s.infoBox, textAlign: 'right', alignItems: 'flex-end'}}>
                <div style={s.sectionTitle}>Giao đến <MapPin size={16}/></div>
                <div style={s.value}>{order.address}</div>
                <div style={{...s.label, marginTop: '5px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', display: 'inline-block'}}>
                  Thanh toán khi nhận hàng (COD)
                </div>
              </div>
            </div>

            {/* Table Items */}
            <div>
              <div style={s.sectionTitle}><Package size={16}/> Chi tiết đơn hàng</div>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Tên món</th>
                    <th style={{...s.th, textAlign: 'center'}}>SL</th>
                    <th style={{...s.th, textAlign: 'right'}}>Đơn giá</th>
                    <th style={{...s.th, textAlign: 'right'}}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td style={s.td}>
                        <div style={{fontWeight: '600'}}>{item.foodName}</div>
                        {item.note && <div style={{fontSize: '12px', color: '#94a3b8', fontStyle: 'italic'}}>Ghi chú: {item.note}</div>}
                      </td>
                      <td style={{...s.td, textAlign: 'center'}}>x{item.quantity}</td>
                      <td style={{...s.td, textAlign: 'right'}}>---</td>
                      <td style={{...s.td, textAlign: 'right', fontWeight: '600'}}>---</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div style={s.totalRow}>
              <div style={{fontSize: '13px', color: '#64748b'}}>Cảm ơn quý khách đã đặt hàng!</div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '13px', color: '#64748b', marginBottom: '5px'}}>Tổng thanh toán</div>
                <div style={{fontSize: '28px', fontWeight: '800', color: '#2563eb'}}>{formatPrice(order.totalAmount)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Quick Update Status) */}
        {order.status === 'PENDING' && (
          <div style={{padding: '20px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
             <button 
                onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                style={{padding: '12px 24px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}
             >
                Từ chối đơn
             </button>
             <button 
                onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}
                style={{padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'}}
             >
                Duyệt đơn ngay
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal;
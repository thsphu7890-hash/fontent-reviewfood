import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import Header from '../components/Header';
import { 
  Banknote, CreditCard, CheckCircle, 
  MapPin, ShoppingBag, XCircle, 
  Ticket, Truck, ChevronRight, X, Trash2, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Order = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Dùng useMemo để tránh user bị reset khi render lại
  const user = useMemo(() => JSON.parse(localStorage.getItem('user')), []);

  const [customerInfo, setCustomerInfo] = useState({ 
    phone: user?.phone || '', 
    address: user?.address || '' 
  });
  
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [note, setNote] = useState('');
  
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [myVouchers, setMyVouchers] = useState([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrImage, setQrImage] = useState('');

  const SHIP_FEE = 15000; 
  const BANK_ID = "MB"; 
  const ACCOUNT_NO = "0333333333"; 
  const ACCOUNT_NAME = "NGUYEN VAN A"; 

  // --- 1. ĐỊNH NGHĨA 3 PHƯƠNG THỨC THANH TOÁN ---
  const paymentOptions = [
    { 
        id: 'CASH', 
        title: 'Tiền mặt (COD)', 
        icon: <Banknote size={24}/>, 
        desc: 'Thanh toán khi nhận hàng' 
    },
    { 
        id: 'BANK', 
        title: 'Chuyển khoản QR', 
        icon: <CreditCard size={24}/>, 
        desc: 'Quét mã tự động qua App Ngân hàng' 
    },
    { 
        id: 'VNPAY', 
        title: 'Ví VNPAY / Momo', 
        icon: <Wallet size={24}/>, 
        desc: 'Thanh toán qua cổng điện tử' 
    },
  ];

  useEffect(() => {
    if(user) {
        setMyVouchers([
            {id: 1, code: 'WELCOME', percent: 20, maxDiscount: 20000},
            {id: 2, code: 'FREESHIP', percent: 100, maxDiscount: 15000},
        ]);
    }
  }, [user]); 

  const applyVoucher = (v) => {
      const rawDiscount = (totalPrice * v.percent) / 100;
      const finalDiscount = Math.min(rawDiscount, v.maxDiscount);
      setVoucherCode(v.code);
      setDiscount(finalDiscount);
      setShowVoucherModal(false);
  };

  const handleManualApply = () => {
      if (voucherCode.toUpperCase() === 'FREESHIP') {
          setDiscount(SHIP_FEE);
          alert("Áp dụng mã FreeShip thành công!");
      } else {
          const found = myVouchers.find(v => v.code === voucherCode);
          if (found) applyVoucher(found);
          else {
              alert("Mã không hợp lệ!");
              setDiscount(0);
          }
      }
  };

  const finalTotal = totalPrice + SHIP_FEE - discount;

  const validatePhone = (phone) => {
      const re = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
      return re.test(phone);
  };

  // --- HÀM ĐẶT HÀNG ---
  const handleCheckout = async () => {
    if (!user) return alert("Vui lòng đăng nhập!");
    if (!validatePhone(customerInfo.phone)) return alert("Số điện thoại không đúng định dạng!");
    if (!customerInfo.address) return alert("Vui lòng nhập địa chỉ!");
    if (cartItems.length === 0) return alert("Giỏ hàng trống!");

    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        customerName: user.fullName || user.username,
        phone: customerInfo.phone,
        address: customerInfo.address,
        totalAmount: finalTotal, 
        paymentMethod: paymentMethod, 
        note: note,
        voucherCode: voucherCode || null,
        items: cartItems.map(item => ({ 
          foodId: item.id, 
          quantity: item.quantity, 
          price: item.price
        }))
      };

      const res = await api.post('/orders', orderData);
      const newOrderId = res.data.id || Date.now();

      // --- 2. XỬ LÝ LOGIC RIÊNG CHO TỪNG LOẠI ---
      
      if (paymentMethod === 'BANK') {
          // LOGIC QR: Phải hiện Modal và KHÔNG ĐƯỢC chuyển trang ngay
          const content = `THANHTOAN DON ${newOrderId}`;
          const qrLink = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact.jpg?amount=${finalTotal}&addInfo=${content}&accountName=${ACCOUNT_NAME}`;
          
          setQrImage(qrLink);
          setShowQRModal(true); // Bật Modal QR lên
          clearCart(); // Xóa giỏ hàng nhưng vẫn ở lại trang này
          
          // LƯU Ý: Không navigate() ở đây, để khách quét mã xong tự bấm nút

      } else if (paymentMethod === 'VNPAY') {
          // LOGIC VÍ: Chuyển hướng sang trang thanh toán
          alert("Hệ thống đang chuyển hướng sang cổng thanh toán VNPAY...");
          clearCart();
          navigate('/history');

      } else {
          // LOGIC TIỀN MẶT: Xong luôn
          alert("Đặt hàng thành công!");
          clearCart();
          navigate('/history');
      }

    } catch (err) {
      console.error("Order Error:", err);
      
      // Fix lỗi lệch pha
      if (err.response && (err.response.status === 400 || err.response.status === 500)) {
          alert("⚠️ Dữ liệu thực đơn đã thay đổi. Hệ thống sẽ tự động làm mới để bạn chọn lại.");
          clearCart(); 
          window.location.href = '/'; 
      } else {
          alert("Lỗi: " + (err.response?.data?.message || err.response?.data || "Vui lòng thử lại sau"));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  const handleEmergencyReset = () => {
      if(window.confirm("Bạn chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
          clearCart();
          window.location.href = '/'; 
      }
  }

  return (
    <>
    <Header />
    <div className="checkout-container">
      <style>{`
        .checkout-container { max-width: 1100px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; }
        .checkout-grid { display: grid; grid-template-columns: 1fr; gap: 30px; }
        @media (min-width: 1024px) { .checkout-grid { grid-template-columns: 1.8fr 1.2fr; } }

        .card-box { background: white; border: 1px solid #e5e7eb; border-radius: 20px; padding: 24px; margin-bottom: 24px; position: relative; }
        .card-title { font-size: 18px; font-weight: 800; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }

        .input-field, .textarea-field { width: 100%; padding: 12px; border: 1.5px solid #e5e7eb; border-radius: 10px; margin-bottom: 15px; outline: none; }
        .input-field:focus, .textarea-field:focus { border-color: #ef4444; }
        .textarea-field { resize: vertical; min-height: 80px; }

        .method-item { display: flex; align-items: center; padding: 16px; border: 2px solid #f3f4f6; border-radius: 15px; cursor: pointer; transition: 0.2s; margin-bottom: 10px;}
        .method-item.active { border-color: #ef4444; background: #fef2f2; }
        .method-icon { width: 45px; height: 45px; border-radius: 12px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-right: 15px; }
        
        .item-row { display: flex; gap: 12px; align-items: center; margin-bottom: 15px; }
        .item-img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; }

        .btn-order { width: 100%; background: #111827; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 800; cursor: pointer; margin-bottom: 10px; }
        .btn-order:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .btn-cancel { width: 100%; background: white; color: #ef4444; border: 1.5px solid #ef4444; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        
        /* Nút Reset màu đỏ nhạt */
        .btn-reset { width: 100%; background: #fee2e2; color: #991b1b; border: none; padding: 10px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; font-size: 13px; transition: 0.2s; }
        .btn-reset:hover { background: #fecaca; }

        .voucher-input-group { display: flex; gap: 10px; margin-bottom: 20px; }
        .btn-apply { background: #ef4444; color: white; border: none; padding: 0 20px; border-radius: 10px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .select-voucher-btn { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 12px; border: 1px dashed #ef4444; background: #fff1f2; color: #ef4444; border-radius: 10px; font-weight: 600; cursor: pointer; margin-bottom: 15px; }
        
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #4b5563; font-size: 14px; }
        .summary-total { display: flex; justify-content: space-between; font-size: 18px; fontWeight: 900; color: #111827; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e5e7eb; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-content { background: white; width: 90%; max-width: 400px; border-radius: 16px; padding: 20px; max-height: 80vh; overflow-y: auto; animation: popIn 0.3s ease; }
        .v-item { border: 1px solid #e5e7eb; padding: 12px; border-radius: 10px; margin-bottom: 10px; cursor: pointer; transition: 0.2s; display: flex; justify-content: space-between; align-items: center; }
        .v-item.active { border-color: #ef4444; background: #fef2f2; }
        .qr-container { text-align: center; margin: 15px 0; }
        .qr-img { width: 100%; max-width: 250px; border-radius: 10px; border: 1px solid #e5e7eb; }
        @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <div className="checkout-grid">
        <div className="info-side">
          {/* Form thông tin */}
          <div className="card-box">
            <h3 className="card-title"><MapPin size={22} color="#ef4444"/> 1. Thông tin giao hàng</h3>
            <label style={{display:'block', marginBottom:5, fontWeight:600, fontSize:13}}>Số điện thoại</label>
            <input className="input-field" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} placeholder="VD: 0901234567" />
            <label style={{display:'block', marginBottom:5, fontWeight:600, fontSize:13}}>Địa chỉ nhận hàng</label>
            <input className="input-field" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} placeholder="Số nhà, tên đường, phường..." />
            <label style={{display:'block', marginBottom:5, fontWeight:600, fontSize:13}}>Ghi chú</label>
            <textarea className="textarea-field" placeholder="Ghi chú cho tài xế..." value={note} onChange={e => setNote(e.target.value)} />
          </div>

          {/* Chọn thanh toán */}
          <div className="card-box">
            <h3 className="card-title"><CreditCard size={22} color="#ef4444"/> 2. Phương thức thanh toán</h3>
            {/* Lặp qua 3 phương thức thanh toán */}
            {paymentOptions.map(opt => (
              <div key={opt.id} className={`method-item ${paymentMethod === opt.id ? 'active' : ''}`} onClick={() => setPaymentMethod(opt.id)}>
                <div className="method-icon">{opt.icon}</div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 700}}>{opt.title}</div>
                  <div style={{fontSize: 12, color: '#6b7280'}}>{opt.desc}</div>
                </div>
                {paymentMethod === opt.id && <CheckCircle size={20} color="#ef4444" />}
              </div>
            ))}
          </div>
        </div>

        <div className="summary-side">
          <div className="card-box" style={{position: 'sticky', top: '100px'}}>
            <h3 className="card-title"><ShoppingBag size={22} color="#ef4444"/> Đơn hàng</h3>
            
            <div style={{maxHeight: '200px', overflowY: 'auto', marginBottom: 20}}>
              {cartItems.map(item => (
                <div key={item.cartItemId} className="item-row">
                  <img src={item.image || 'https://via.placeholder.com/50'} className="item-img" alt={item.name} />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 14, fontWeight: 700}}>{item.name}</div>
                    <div style={{fontSize: 12, color: '#6b7280'}}>SL: {item.quantity}</div>
                  </div>
                  <div style={{fontWeight: 700, fontSize: 14}}>{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <button className="select-voucher-btn" onClick={() => setShowVoucherModal(true)}>
                <span><Ticket size={16} style={{marginRight: 6}}/> {voucherCode ? `Mã: ${voucherCode}` : `Chọn Voucher`}</span>
                <ChevronRight size={16}/>
            </button>
            <div className="voucher-input-group">
                <input className="input-field" style={{marginBottom:0}} placeholder="Nhập mã" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
                <button className="btn-apply" onClick={handleManualApply}>Áp dụng</button>
            </div>

            <div style={{background: '#f9fafb', padding: 15, borderRadius: 12}}>
                <div className="summary-row"><span>Tạm tính</span><span>{formatPrice(totalPrice)}</span></div>
                <div className="summary-row"><span><Truck size={14}/> Phí ship</span><span>{formatPrice(SHIP_FEE)}</span></div>
                {discount > 0 && (
                    <div className="summary-row" style={{color: '#10b981'}}>
                        <span>Giảm giá</span><span>-{formatPrice(discount)}</span>
                    </div>
                )}
                <div className="summary-total"><span>Tổng cộng</span><span style={{color:'#ef4444', fontSize: 20}}>{formatPrice(finalTotal)}</span></div>
            </div>

            <div style={{margin: '20px 0'}}>
                <button className="btn-order" onClick={handleCheckout} disabled={loading}>{loading ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG NGAY"}</button>
                <button className="btn-cancel" onClick={() => navigate('/')}><XCircle size={18}/> HỦY BỎ</button>
                
                <button className="btn-reset" onClick={handleEmergencyReset}>
                    <Trash2 size={16}/> Làm mới giỏ hàng (Nếu bị lỗi)
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL VOUCHER */}
      {showVoucherModal && (
        <div className="modal-overlay" onClick={() => setShowVoucherModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}>
                    <h3 style={{fontSize:18, fontWeight:700}}>Chọn Voucher</h3>
                    <X style={{cursor:'pointer'}} onClick={() => setShowVoucherModal(false)}/>
                </div>
                {myVouchers.map(v => (
                    <div key={v.id} className={`v-item ${voucherCode === v.code ? 'active' : ''}`} onClick={() => applyVoucher(v)}>
                        <div><strong style={{color:'#ef4444'}}>{v.code}</strong> - Giảm {v.percent}%</div>
                        {voucherCode === v.code && <CheckCircle size={20} color="#ef4444"/>}
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* MODAL QR CODE: CHỈ HIỆN KHI CHỌN BANK */}
      {showQRModal && (
        <div className="modal-overlay">
            <div className="modal-content" style={{textAlign:'center'}}>
                <div style={{color:'#10b981', marginBottom:10}}><CheckCircle size={40} style={{margin:'0 auto'}}/></div>
                <h3 style={{fontSize:20, fontWeight:800}}>Đặt hàng thành công!</h3>
                <p style={{color:'#6b7280', fontSize:14}}>Quét mã để thanh toán:</p>
                <div className="qr-container"><img src={qrImage} className="qr-img" alt="QR Code" /></div>
                <div style={{background:'#f3f4f6', padding:10, borderRadius:8, fontSize:13, marginBottom:20}}>
                    <b>{formatPrice(finalTotal)}</b> <br/> Nội dung: Giữ nguyên
                </div>
                {/* NÚT XÁC NHẬN ĐÃ THANH TOÁN */}
                <button className="btn-order" onClick={() => navigate('/history')}>ĐÃ CHUYỂN KHOẢN</button>
            </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Order;
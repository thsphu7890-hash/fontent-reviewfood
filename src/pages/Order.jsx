import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import Header from '../components/Header';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Banknote, CreditCard, CheckCircle, MapPin, Ticket, 
  ArrowLeft, Clock, ShieldCheck, Zap, Wallet, User, 
  Phone, FileText, Loader, Home as HomeIcon, Map, X
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix lỗi icon Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Dữ liệu mẫu Voucher (Thực tế nên lấy từ API)
const MOCK_VOUCHERS = [
    { id: 1, code: 'WELCOME', desc: 'Giảm 20k cho đơn 0đ', value: 20000, minOrder: 0 },
    { id: 2, code: 'FREESHIP', desc: 'Giảm 15k phí vận chuyển', value: 15000, minOrder: 50000 },
    { id: 3, code: 'FOODNEST50', desc: 'Giảm 50k cho đơn 200k', value: 50000, minOrder: 200000 },
];

// Component chọn vị trí trên bản đồ
const LocationMarker = ({ position, setPosition, setTempAddress, setIsFetchingAddress }) => {
    const map = useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            setPosition(e.latlng);
            setIsFetchingAddress(true);
            setTempAddress("Đang tìm tên đường...");
            
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`
                );
                const data = await response.json();
                
                if (data && data.display_name) {
                    const shortAddress = data.display_name.split(',').slice(0, 5).join(',');
                    setTempAddress(shortAddress);
                } else {
                    setTempAddress(`Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                }
            } catch (error) {
                console.error("Lỗi lấy địa chỉ:", error);
                setTempAddress("Không thể lấy tên đường, vui lòng nhập tay.");
            } finally {
                setIsFetchingAddress(false);
            }
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Vị trí bạn chọn</Popup>
        </Marker>
    );
};

const Order = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  
  // --- LẤY THÔNG TIN USER TỪ LOCALSTORAGE ---
  const [customerInfo, setCustomerInfo] = useState(() => {
      try {
          const stored = localStorage.getItem('user');
          if (!stored) return { phone: '', address: '', name: '' };

          const parsedData = JSON.parse(stored);
          // Hỗ trợ cả 2 cấu trúc dữ liệu: { user: {...} } hoặc {...}
          const userData = parsedData.user || parsedData;

          return { 
            phone: userData.phone || '', 
            address: userData.address || '',
            // Tìm tên theo nhiều trường có thể có
            name: userData.fullName || userData.name || userData.username || ''
          };
      } catch (e) {
          return { phone: '', address: '', name: '' };
      }
  });
  
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [deliveryTime, setDeliveryTime] = useState('NOW');
  const [note, setNote] = useState('');
  
  // Voucher State
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null); 
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Map State
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapPosition, setMapPosition] = useState({ lat: 10.762622, lng: 106.660172 });
  const [tempAddress, setTempAddress] = useState("");
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  // QR Payment State
  const [qrImage, setQrImage] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  const SHIP_FEE = 15000;
  // Tính tổng tiền cuối cùng (không âm)
  const finalTotal = Math.max(0, totalPrice + SHIP_FEE - discountAmount);

  // --- XỬ LÝ VOUCHER ---
  const handleApplyVoucher = (codeInput = voucherCode) => {
    const codeToCheck = typeof codeInput === 'string' ? codeInput : voucherCode;
    
    if (!codeToCheck.trim()) return toast.error("Vui lòng nhập mã!");
    setLoading(true);
    
    // Giả lập check voucher (Thực tế nên gọi API check mã)
    setTimeout(() => {
        const foundVoucher = MOCK_VOUCHERS.find(v => v.code === codeToCheck.toUpperCase());

        if (foundVoucher) {
            if (totalPrice < foundVoucher.minOrder) {
                toast.error(`Đơn hàng cần tối thiểu ${new Intl.NumberFormat('vi-VN').format(foundVoucher.minOrder)}đ`);
                setAppliedVoucher(null);
                setDiscountAmount(0);
            } else {
                setDiscountAmount(foundVoucher.value);
                setAppliedVoucher(foundVoucher);
                setVoucherCode(foundVoucher.code);
                toast.success("Áp dụng mã thành công!");
                setShowVoucherModal(false);
            }
        } else {
            toast.error("Mã không hợp lệ hoặc đã hết hạn!");
            setAppliedVoucher(null);
            setDiscountAmount(0);
        }
        setLoading(false);
    }, 600);
  };

  const handleSelectVoucher = (voucher) => {
      setVoucherCode(voucher.code);
      handleApplyVoucher(voucher.code);
  };

  // --- XỬ LÝ BẢN ĐỒ ---
  const handleOpenMap = () => {
      setTempAddress(customerInfo.address || "Chưa chọn vị trí");
      setShowMapModal(true);
  };

  const handleConfirmLocation = () => {
      if (!tempAddress || tempAddress === "Đang tìm tên đường...") {
          return toast.error("Vui lòng đợi lấy tên đường hoặc chọn vị trí khác!");
      }
      setCustomerInfo({...customerInfo, address: tempAddress});
      setShowMapModal(false);
      toast.success("Đã cập nhật vị trí giao hàng!");
  };

  // --- XỬ LÝ THANH TOÁN (FIX CHÍNH) ---
  const handleCheckout = async () => {
    // 1. Kiểm tra đăng nhập
    const stored = localStorage.getItem('user');
    if (!stored) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
        return navigate('/login');
    }
    
    const parsedData = JSON.parse(stored);
    const user = parsedData.user || parsedData;

    // 2. Validate thông tin nhập
    if (!customerInfo.name?.trim()) return toast.error("Vui lòng điền tên người nhận!");
    if (!customerInfo.phone?.trim()) return toast.error("Vui lòng điền số điện thoại!");
    if (!customerInfo.address?.trim()) return toast.error("Vui lòng nhập địa chỉ giao hàng!");
    
    const loadId = toast.loading("Đang tạo đơn hàng...");
    setLoading(true);

    try {
      // 3. Chuẩn bị dữ liệu gửi lên Server
      const orderData = {
        userId: user.id, // Đảm bảo ID chính xác
        customerName: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        totalAmount: finalTotal, 
        paymentMethod: paymentMethod, 
        note: note || '',
        deliveryTime: deliveryTime,
        voucherCode: appliedVoucher?.code || null,
        // Map cart items sang format backend cần
        items: cartItems.map(item => ({ 
            foodId: item.id, 
            quantity: item.quantity, 
            price: item.price,
            options: item.options || {} // Gửi kèm options nếu có (size, topping...)
        }))
      };

      console.log("Sending Order Data:", orderData); // Debug log

      // 4. Gọi API tạo đơn
      const res = await api.post('/api/orders', orderData);

      // 5. Xử lý kết quả thành công
      if (res.status === 200 || res.status === 201) {
          const newOrderId = res.data.id || res.data.orderId || Date.now(); 

          // Nếu chọn chuyển khoản -> Hiện QR
          if (paymentMethod === 'BANK') {
              // Tạo link VietQR động
              // Cấu trúc: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
              // Thay MB và số tài khoản bên dưới bằng của bạn
              const qrUrl = `https://img.vietqr.io/image/MB-0333333333-compact.jpg?amount=${finalTotal}&addInfo=ORDER ${newOrderId}&accountName=FOODNEST`;
              
              setQrImage(qrUrl);
              setShowQRModal(true);
              toast.success("Đơn hàng đã tạo! Vui lòng quét mã để thanh toán.", { id: loadId });
              
              // KHÔNG clear giỏ hàng ngay để user còn đối chiếu, chỉ clear khi họ bấm "Tôi đã thanh toán"
          } else {
              // Thanh toán tiền mặt (COD) -> Xong luôn
              toast.success("Đặt hàng thành công!", { id: loadId });
              clearCart(); // Xóa giỏ hàng
              navigate('/history'); // Chuyển sang trang lịch sử
          }
      } else {
          throw new Error("Server trả về lỗi không xác định");
      }

    } catch (err) {
      console.error("Checkout Error:", err);
      // Hiển thị lỗi chi tiết từ backend nếu có
      const errMsg = err.response?.data?.message || err.response?.data || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(typeof errMsg === 'string' ? errMsg : "Đặt hàng thất bại!", { id: loadId });
    } finally { 
        setLoading(false); 
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + '₫';

  const paymentOptions = [
    { id: 'CASH', title: 'Tiền mặt (COD)', icon: <Banknote size={24}/>, sub: 'Thanh toán khi nhận hàng' },
    { id: 'BANK', title: 'Chuyển khoản QR', icon: <CreditCard size={24}/>, sub: 'Quét mã VietQR nhanh chóng' },
    { id: 'WALLET', title: 'Ví điện tử', icon: <Wallet size={24}/>, sub: 'Momo / ZaloPay / VNPAY' },
  ];

  // Nếu giỏ hàng rỗng, chuyển về trang chủ
  if (cartItems.length === 0 && !showQRModal) {
      return (
          <div className="order-page flex items-center justify-center" style={{height:'100vh', flexDirection:'column', gap: 20}}>
              <Header />
              <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty" width={150}/>
              <h2 style={{fontSize: 24, fontWeight: 700, color: '#374151'}}>Giỏ hàng đang trống!</h2>
              <button 
                onClick={() => navigate('/')}
                style={{background:'#ef4444', color:'white', padding:'12px 24px', borderRadius: 8, fontWeight: 600, border:'none', cursor:'pointer'}}
              >
                  Quay lại đặt món
              </button>
          </div>
      )
  }

  return (
    <div className="order-page">
      <Toaster position="top-center" />
      <Header />
      
      <style>{`
        .order-page { background-color: #F3F4F6; min-height: 100vh; font-family: 'Inter', sans-serif; color: #1f2937; padding-bottom: 50px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 30px 20px; }
        .order-grid { display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 24px; }
        @media (max-width: 960px) { .order-grid { grid-template-columns: 1fr; } }
        .card-box { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; margin-bottom: 20px; }
        .section-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #111827; }
        .section-icon { color: #ef4444; }
        .input-group { margin-bottom: 16px; }
        .input-label { display: block; font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 6px; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-field { width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; transition: 0.2s; background: #f9fafb; outline: none; box-sizing: border-box; }
        .input-field:focus { border-color: #ef4444; background: white; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
        .input-btn-right { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #fff; border: 1px solid #e5e7eb; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #4b5563; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .input-btn-right:hover { background: #f3f4f6; color: #ef4444; border-color: #ef4444; }
        .time-toggle { display: flex; gap: 12px; margin-bottom: 20px; }
        .time-btn { flex: 1; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; color: #4b5563; transition: 0.2s; }
        .time-btn.active { border-color: #ef4444; background: #fef2f2; color: #ef4444; }
        .payment-option { display: flex; align-items: center; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: 0.2s; }
        .payment-option:hover { background: #f9fafb; }
        .payment-option.active { border-color: #ef4444; background: #fef2f2; box-shadow: 0 2px 5px rgba(239, 68, 68, 0.1); }
        .radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #d1d5db; margin-right: 16px; position: relative; flex-shrink: 0; }
        .payment-option.active .radio-circle { border-color: #ef4444; }
        .payment-option.active .radio-circle::after { content: ''; position: absolute; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .cart-item-row { display: flex; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed #e5e7eb; }
        .item-thumb { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; background: #f3f4f6; flex-shrink: 0; }
        .voucher-box { display: flex; gap: 10px; margin-bottom: 20px; align-items: stretch; }
        .voucher-input-wrapper { position: relative; flex: 1; min-width: 0; }
        .btn-apply { background: #1f2937; color: white; padding: 0 20px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; white-space: nowrap; flex-shrink: 0; }
        .btn-apply:hover { background: #374151; }
        .btn-apply:disabled { opacity: 0.6; cursor: not-allowed; }
        .bill-row { display: flex; justify-content: space-between; font-size: 14px; color: #6b7280; margin-bottom: 10px; }
        .bill-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #111827; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
        .btn-checkout { width: 100%; background: #ef4444; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); transition: 0.2s; }
        .btn-checkout:hover { background: #dc2626; transform: translateY(-2px); }
        .btn-checkout:disabled { background: #9ca3af; cursor: not-allowed; box-shadow: none; transform: none; }
        
        /* MODAL STYLES */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.3s; }
        .modal-content { background: white; padding: 24px; border-radius: 20px; max-width: 450px; width: 90%; position: relative; animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; max-height: 85vh; }
        .modal-close { position: absolute; top: 16px; right: 16px; background: #f3f4f6; border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .voucher-list { overflow-y: auto; padding-right: 4px; margin-top: 10px; }
        .voucher-item { border: 1px solid #e5e7eb; padding: 12px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; }
        .voucher-item:hover { border-color: #ef4444; background: #fef2f2; }
        .voucher-tag { background: #fee2e2; color: #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-bottom: 4px; display: inline-block; }
        
        .map-wrapper { height: 350px; width: 100%; margin-bottom: 16px; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; position: relative; }
        .leaflet-container { height: 100%; width: 100%; }
        .map-address-box { position: absolute; bottom: 10px; left: 10px; right: 10px; z-index: 1000; background: white; padding: 12px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 4px; }
        .map-address-label { font-size: 11px; color: #6b7280; font-weight: 700; text-transform: uppercase; }
        .map-address-text { font-size: 13px; font-weight: 600; color: #1f2937; line-height: 1.4; }
        .btn-done { width: 100%; background: #10b981; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-done:hover { background: #059669; }
        
        @keyframes fadeIn { from {opacity:0} to {opacity:1} }
        @keyframes slideUp { from {transform: translateY(20px); opacity: 0} to {transform: translateY(0); opacity: 1} }
      `}</style>

      <div className="container">
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#6b7280' }} onClick={() => navigate(-1)}>
            <ArrowLeft size={18}/> Quay lại mua sắm
        </div>

        <div className="order-grid">
            {/* CỘT TRÁI: THÔNG TIN */}
            <div>
                <div className="card-box">
                    <div className="section-title">
                        <MapPin className="section-icon"/> Thông tin giao hàng
                    </div>
                    
                    <div className="time-toggle">
                        <div className={`time-btn ${deliveryTime === 'NOW' ? 'active' : ''}`} onClick={() => setDeliveryTime('NOW')}>
                            <Zap size={16}/> Giao ngay
                        </div>
                        <div className={`time-btn ${deliveryTime === 'LATER' ? 'active' : ''}`} onClick={() => setDeliveryTime('LATER')}>
                            <Clock size={16}/> Hẹn giờ
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label"><User size={14} style={{display:'inline', marginBottom:-2}}/> Người nhận</label>
                        <input 
                            className="input-field" 
                            value={customerInfo.name} 
                            onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                            placeholder="Tên người nhận"
                        />
                    </div>
                    
                    <div className="input-group">
                        <label className="input-label"><Phone size={14} style={{display:'inline', marginBottom:-2}}/> Số điện thoại</label>
                        <input 
                            className="input-field" 
                            value={customerInfo.phone} 
                            onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                            placeholder="Nhập SĐT..."
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label"><HomeIcon size={14} style={{display:'inline', marginBottom:-2}}/> Địa chỉ giao hàng</label>
                        <div className="input-wrapper">
                            <input 
                                className="input-field" 
                                value={customerInfo.address} 
                                onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                                placeholder="Vui lòng chọn trên bản đồ..."
                                style={{paddingRight: 110}}
                            />
                            <button className="input-btn-right" onClick={handleOpenMap}>
                                <Map size={14} /> Chọn bản đồ
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label"><FileText size={14} style={{display:'inline', marginBottom:-2}}/> Ghi chú</label>
                        <textarea 
                            className="input-field" rows="2"
                            value={note} 
                            onChange={e => setNote(e.target.value)}
                            placeholder="Ví dụ: Không hành, nhiều ớt..."
                        ></textarea>
                    </div>
                </div>

                <div className="card-box">
                    <div className="section-title">
                        <CreditCard className="section-icon"/> Phương thức thanh toán
                    </div>
                    <div>
                        {paymentOptions.map(opt => (
                            <div key={opt.id} className={`payment-option ${paymentMethod === opt.id ? 'active' : ''}`} onClick={() => setPaymentMethod(opt.id)}>
                                <div className="radio-circle"></div>
                                <div style={{marginRight: 16, color: paymentMethod === opt.id ? '#ef4444' : '#6b7280'}}>
                                    {opt.icon}
                                </div>
                                <div>
                                    <div style={{fontWeight: 600, fontSize: 15}}>{opt.title}</div>
                                    <div style={{fontSize: 12, color: '#9ca3af'}}>{opt.sub}</div>
                                </div>
                                {paymentMethod === opt.id && <CheckCircle size={20} color="#ef4444" style={{marginLeft:'auto'}}/>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: TỔNG KẾT ĐƠN */}
            <div>
                <div className="card-box" style={{position: 'sticky', top: 20}}>
                    <div className="section-title" style={{justifyContent:'space-between'}}>
                        <span>Đơn hàng ({cartItems.length} món)</span>
                        <span style={{fontSize: 13, color: '#ef4444', fontWeight: 500, cursor: 'pointer'}} onClick={() => navigate('/')}>Thêm món</span>
                    </div>

                    <div style={{maxHeight: 300, overflowY: 'auto', marginBottom: 20}} className="custom-scroll">
                        {cartItems.map((item, idx) => (
                            <div key={idx} className="cart-item-row">
                                <img src={item.image || "https://placehold.co/100"} className="item-thumb" alt={item.name}/>
                                <div style={{flex: 1}}>
                                    <div style={{fontWeight: 600, fontSize: 14, marginBottom: 4}}>{item.name}</div>
                                    <div style={{fontSize: 12, color: '#6b7280'}}>x{item.quantity} {item.options?.size && `• ${item.options.size}`}</div>
                                </div>
                                <div style={{fontWeight: 600, fontSize: 14}}>{formatPrice(item.price * item.quantity)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Ô NHẬP VOUCHER */}
                    <div className="voucher-box">
                          <div className="voucher-input-wrapper">
                             <Ticket size={16} style={{position:'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color:'#9ca3af', zIndex: 1}}/>
                             <input 
                                className="input-field" 
                                style={{paddingLeft: 38, paddingRight: 80}}
                                placeholder="Mã giảm giá"
                                value={voucherCode}
                                onChange={e => setVoucherCode(e.target.value)}
                             />
                             <span 
                                style={{position:'absolute', right: 12, top:'50%', transform:'translateY(-50%)', fontSize: 12, color:'#ef4444', fontWeight:600, cursor:'pointer'}}
                                onClick={() => setShowVoucherModal(true)}
                             >
                                 Chọn mã
                             </span>
                          </div>
                          <button className="btn-apply" onClick={() => handleApplyVoucher()} disabled={loading}>
                            {loading ? '...' : 'Áp dụng'}
                          </button>
                    </div>

                    {appliedVoucher && (
                        <div style={{background:'#ecfdf5', color:'#059669', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 16, display:'flex', justifyContent:'space-between'}}>
                            <span><CheckCircle size={12} style={{display:'inline'}}/> {appliedVoucher.desc}</span>
                            <span style={{fontWeight:700}}>-{formatPrice(discountAmount)}</span>
                        </div>
                    )}

                    <div>
                        <div className="bill-row"><span>Tạm tính</span> <span>{formatPrice(totalPrice)}</span></div>
                        <div className="bill-row"><span>Phí giao hàng</span> <span>{formatPrice(SHIP_FEE)}</span></div>
                        {discountAmount > 0 && <div className="bill-row" style={{color:'#10b981'}}><span>Khuyến mãi</span> <span>-{formatPrice(discountAmount)}</span></div>}
                        <div className="bill-total">
                            <span>Tổng thanh toán</span>
                            <span style={{color: '#ef4444', fontSize: 22}}>{formatPrice(finalTotal)}</span>
                        </div>
                    </div>

                    <button className="btn-checkout" onClick={handleCheckout} disabled={loading || cartItems.length === 0}>
                        {loading ? <Loader className="animate-spin" /> : 'ĐẶT HÀNG NGAY'}
                    </button>
                    
                    <div style={{display:'flex', justifyContent:'center', gap: 6, fontSize: 11, color: '#9ca3af', marginTop: 12}}>
                        <ShieldCheck size={14}/> Thông tin thanh toán được bảo mật 100%
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* MODALS GIỮ NGUYÊN */}
      {showVoucherModal && (
          <div className="modal-overlay" onClick={() => setShowVoucherModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setShowVoucherModal(false)}><X size={18}/></button>
                  <h3 style={{fontSize: 20, fontWeight: 700, marginBottom: 16}}>Chọn Voucher</h3>
                  <div className="voucher-list custom-scroll" style={{maxHeight: 400}}>
                      {MOCK_VOUCHERS.map(v => (
                          <div key={v.id} className="voucher-item" onClick={() => handleSelectVoucher(v)}>
                              <div>
                                  <span className="voucher-tag">{v.code}</span>
                                  <div style={{fontSize: 14, fontWeight: 600}}>{v.desc}</div>
                                  <div style={{fontSize: 12, color: '#6b7280'}}>HSD: 31/12/2024</div>
                              </div>
                              <div style={{width: 20, height: 20, borderRadius:'50%', border:'2px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                  {voucherCode === v.code && <div style={{width: 10, height: 10, background:'#ef4444', borderRadius:'50%'}}></div>}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {showMapModal && (
          <div className="modal-overlay" onClick={() => setShowMapModal(false)}>
              <div className="modal-content" style={{maxWidth: 600}} onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setShowMapModal(false)}><X size={18}/></button>
                  <h3 style={{fontSize: 20, fontWeight: 700, marginBottom: 8}}>Chọn vị trí</h3>
                  <p style={{fontSize: 13, color:'#6b7280', marginBottom: 16}}>Click vào bản đồ để lấy chính xác tên đường</p>
                  
                  <div className="map-wrapper">
                      <MapContainer center={[mapPosition.lat, mapPosition.lng]} zoom={15} scrollWheelZoom={true}>
                          <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <LocationMarker 
                            position={mapPosition}
                            setPosition={setMapPosition} 
                            setTempAddress={setTempAddress}
                            setIsFetchingAddress={setIsFetchingAddress}
                           />
                      </MapContainer>
                      <div className="map-address-box">
                          <span className="map-address-label">Địa điểm đã chọn:</span>
                          <span className="map-address-text">
                            {isFetchingAddress ? (
                                <span style={{display:'flex', alignItems:'center', gap:6, color:'#ef4444'}}>
                                    <Loader size={14} className="animate-spin"/> Đang lấy tên đường...
                                </span>
                            ) : (
                                tempAddress || "Vui lòng click vào bản đồ"
                            )}
                          </span>
                      </div>
                  </div>

                  <button className="btn-checkout" style={{marginTop: 0, padding: 12}} onClick={handleConfirmLocation}>
                      Xác nhận vị trí này
                  </button>
              </div>
          </div>
      )}

      {/* MODAL QR PAYMENT - Chỉ hiện khi chọn BANK và tạo đơn thành công */}
      {showQRModal && (
          <div className="modal-overlay">
              <div className="modal-content" style={{textAlign:'center'}}>
                  <div style={{background:'#d1fae5', width: 60, height: 60, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px'}}>
                      <CheckCircle size={32} color="#059669"/>
                  </div>
                  <h3 style={{fontSize: 20, fontWeight: 800, margin: '0 0 8px'}}>THANH TOÁN QR</h3>
                  <p style={{color:'#6b7280', fontSize: 14, marginBottom: 20}}>Quét mã bên dưới để hoàn tất đơn hàng</p>
                  
                  <div style={{padding: 10, border: '1px solid #e5e7eb', borderRadius: 16, display:'inline-block', marginBottom: 20}}>
                      <img src={qrImage} alt="VietQR" style={{width: 220, height: 220, objectFit:'contain'}}/>
                  </div>
                  
                  <div style={{background:'#f3f4f6', padding: 12, borderRadius: 12, marginBottom: 20}}>
                      <div style={{fontSize: 12, color:'#6b7280', textTransform:'uppercase', fontWeight: 700}}>Số tiền cần chuyển</div>
                      <div style={{fontSize: 24, fontWeight: 900, color:'#ef4444'}}>{formatPrice(finalTotal)}</div>
                  </div>

                  <button className="btn-done" onClick={() => { clearCart(); navigate('/history'); }}>
                      TÔI ĐÃ CHUYỂN KHOẢN
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Order;
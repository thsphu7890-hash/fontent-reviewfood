import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import AddRestaurantModal from './AddRestaurantModal'; 
import { Edit, Trash2, Plus, Loader, MapPin } from 'lucide-react';

const RestaurantManager = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State lưu trữ nhà hàng đang muốn sửa (nếu null => đang thêm mới)
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi bấm nút "Thêm nhà hàng"
  const handleAddNew = () => {
    setEditingRestaurant(null); // Reset về null để Modal hiểu là thêm mới
    setIsModalOpen(true);
  };

  // Hàm xử lý khi bấm nút "Sửa"
  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant); // Lưu data cần sửa
    setIsModalOpen(true); // Mở modal
  };

  // Hàm xóa (Giữ nguyên logic của bạn)
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa nhà hàng này? Hành động này không thể hoàn tác.")) {
      try {
        await api.delete(`/restaurants/${id}`);
        setRestaurants(restaurants.filter(r => r.id !== id));
        alert("Đã xóa thành công!");
      } catch (error) {
        alert("Xóa thất bại! Vui lòng thử lại.");
      }
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const styles = {
    container: "mgr-container",
    header: "mgr-header",
    title: "mgr-title",
    btnAdd: "mgr-btn-add",
    tableCard: "mgr-table-card",
    resInfo: "mgr-res-info",
    resImg: "mgr-res-img",
    badge: "mgr-badge-status"
  };

  return (
    <div className={styles.container}>
      <style>{`
        .mgr-container { width: 100%; animation: fadeIn 0.3s ease-in; }
        .mgr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .mgr-title { font-size: 26px; font-weight: 900; color: #000; letter-spacing: -0.5px; }
        .mgr-btn-add { background: #ef4444; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .mgr-btn-add:hover { background: #dc2626; transform: translateY(-2px); }
        .mgr-table-card { background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 16px 24px; background: #fafafa; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #f3f4f6; }
        td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; vertical-align: middle; }
        .mgr-res-info { display: flex; align-items: center; gap: 16px; }
        .mgr-res-img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; background: #f3f4f6; }
        .res-name-label { font-weight: 700; color: #000; display: block; margin-bottom: 2px; }
        .res-addr-label { font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 4px; }
        .mgr-badge-status { padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; background: #ecfdf5; color: #10b981; border: 1px solid #d1fae5; }
        .action-btns { display: flex; gap: 8px; justify-content: flex-end; }
        .btn-icon { padding: 8px; border-radius: 6px; border: 1px solid #f3f4f6; background: #fff; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; }
        .btn-icon.edit:hover { background: #eff6ff; color: #3b82f6; border-color: #bfdbfe; }
        .btn-icon.delete:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý <span style={{color: '#ef4444'}}>Nhà hàng</span></h2>
        
        {/* Sửa onClick để gọi handleAddNew */}
        <button className={styles.btnAdd} onClick={handleAddNew}>
          <Plus size={20} /> Thêm nhà hàng
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', color: '#9ca3af' }}>
          <Loader className="animate-spin" size={40} style={{ marginBottom: '16px', color: '#ef4444' }} />
          <p>Đang đồng bộ dữ liệu...</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table>
            <thead>
              <tr>
                <th>Thông tin nhà hàng</th>
                <th>Mô tả ngắn</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.length > 0 ? restaurants.map((res) => (
                <tr key={res.id}>
                  <td>
                    <div className={styles.resInfo}>
                      <img src={res.image || 'https://via.placeholder.com/150'} className={styles.resImg} alt={res.name} />
                      <div>
                        <span className="res-name-label">{res.name}</span>
                        <span className="res-addr-label"><MapPin size={12} /> {res.address}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {res.description}
                  </td>
                  <td><span className={styles.badge}>Hoạt động</span></td>
                  <td>
                    <div className="action-btns">
                      {/* Gắn sự kiện sửa */}
                      <button className="btn-icon edit" onClick={() => handleEdit(res)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(res.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Truyền thêm prop editingData vào Modal */}
      <AddRestaurantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchRestaurants}
        editingData={editingRestaurant} 
      />
    </div>
  );
};

export default RestaurantManager;
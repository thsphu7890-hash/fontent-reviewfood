import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import AddRestaurantModal from './AddRestaurantModal'; 
// Chỉ giữ lại các icon khác nếu chúng hoạt động, bỏ Edit/Trash2 vì sẽ dùng SVG trực tiếp
import { 
  Plus, Search, MapPin, 
  Filter, ChevronLeft, ChevronRight, CheckSquare, Square
} from 'lucide-react';

const RestaurantManager = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState('ALL'); 

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch Data
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurants');
      const enrichedData = response.data.map(r => ({
          ...r,
          status: r.status || 'ACTIVE' 
      }));
      setRestaurants(enrichedData);
    } catch (error) {
      console.error("Lỗi dữ liệu:", error);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // --- HANDLERS ---
  const handleAddNew = () => {
    setEditingRestaurant(null);
    setIsModalOpen(true);
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa nhà hàng này?")) {
      try {
        await api.delete(`/restaurants/${id}`);
        setRestaurants(restaurants.filter(r => r.id !== id));
      } catch (error) {
        alert("Lỗi xóa: " + error.message);
      }
    }
  };

  const handleBulkDelete = async () => {
      if (selectedIds.length === 0) return;
      if (window.confirm(`Xóa ${selectedIds.length} nhà hàng đã chọn?`)) {
          await Promise.all(selectedIds.map(id => api.delete(`/restaurants/${id}`)));
          setRestaurants(restaurants.filter(r => !selectedIds.includes(r.id)));
          setSelectedIds([]);
      }
  };

  const toggleSelect = (id) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(item => item !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  const toggleSelectAll = () => {
      if (selectedIds.length === currentData.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(currentData.map(r => r.id));
      }
  };

  // --- FILTER Logic ---
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(res => {
      const matchSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || res.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [searchTerm, restaurants, filterStatus]);

  // --- PAGINATION Logic ---
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const currentData = filteredRestaurants.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
  );

  return (
    <div className="mgr-container">
      <style>{`
        /* LAYOUT & FONTS */
        .mgr-container { padding: 10px; animation: fadeIn 0.4s ease-out; font-family: 'Inter', sans-serif; color: #1f2937; }
        
        /* HEADER SECTION */
        .mgr-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; gap: 20px; }
        .mgr-title h2 { font-size: 24px; font-weight: 800; color: #111827; margin: 0; }
        .mgr-title p { color: #6b7280; margin-top: 4px; font-size: 14px; }
        
        /* TOOLBAR */
        .mgr-toolbar { display: flex; gap: 12px; align-items: center; background: white; padding: 10px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .search-box { position: relative; display: flex; align-items: center; }
        .search-input { padding: 10px 10px 10px 36px; border: 1px solid #e5e7eb; border-radius: 8px; width: 220px; outline: none; font-size: 13px; transition: 0.2s; }
        .search-input:focus { border-color: #ef4444; width: 260px; }
        .search-icon { position: absolute; left: 10px; color: #9ca3af; }
        
        .filter-select { padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; font-size: 13px; color: #374151; cursor: pointer; background: white; }
        
        .btn-add { background: #111827; color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; transition: 0.2s; }
        .btn-add:hover { background: #ef4444; }
        
        .btn-bulk-delete { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-bulk-delete:hover { background: #ef4444; color: white; }

        /* TABLE STYLE */
        .table-container { background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 16px 20px; background: #f9fafb; font-size: 12px; font-weight: 700; color: #4b5563; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; text-align: left; }
        td { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; font-size: 14px; color: #374151; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #f9fafb; }

        .col-checkbox { width: 40px; text-align: center; }
        .checkbox-custom { cursor: pointer; color: #d1d5db; transition: 0.2s; }
        .checkbox-custom.checked { color: #ef4444; fill: #fee2e2; }

        .res-info { display: flex; align-items: center; gap: 15px; }
        .res-img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; border: 1px solid #e5e7eb; }
        .res-name { font-weight: 700; color: #111827; display: block; margin-bottom: 2px; }
        .res-addr { font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px; }
        
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; }
        .status-active { background: #dcfce7; color: #166534; }
        .status-inactive { background: #f3f4f6; color: #6b7280; }

        /* --- ACTION BUTTONS (ĐÃ SỬA) --- */
        .actions { display: flex; gap: 8px; justify-content: flex-end; }
        .btn-icon { width: 34px; height: 34px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; padding: 0; }
        
        /* Edit Button */
        .btn-icon.edit { background: #eff6ff; color: #3b82f6; border-color: #dbeafe; }
        .btn-icon.edit:hover { background: #3b82f6; color: white; border-color: #3b82f6; }

        /* Delete Button */
        .btn-icon.delete { background: #fef2f2; color: #ef4444; border-color: #fee2e2; }
        .btn-icon.delete:hover { background: #ef4444; color: white; border-color: #ef4444; }

        /* Pagination */
        .pagination { display: flex; justify-content: flex-end; padding: 15px 20px; gap: 8px; align-items: center; border-top: 1px solid #e5e7eb; }
        .page-btn { width: 32px; height: 32px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6b7280; transition: 0.2s; }
        .page-btn:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; }
        .page-btn.active { background: #111827; color: white; border-color: #111827; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .skeleton-row td { padding: 10px 20px; }
        .skeleton-bar { height: 20px; background: #f3f4f6; border-radius: 4px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* HEADER */}
      <div className="mgr-header">
        <div className="mgr-title">
          <h2>Quản Lý Nhà Hàng</h2>
          <p>Danh sách đối tác và trạng thái hoạt động</p>
        </div>
        
        {selectedIds.length > 0 ? (
            <button className="btn-bulk-delete" onClick={handleBulkDelete}>
                {/* SVG TRỰC TIẾP CHO NÚT XÓA HÀNG LOẠT */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                Xóa ({selectedIds.length}) mục
            </button>
        ) : (
            <div className="mgr-toolbar">
                <div className="search-box">
                    <Search size={16} className="search-icon"/> 
                    <input 
                        className="search-input" 
                        placeholder="Tìm kiếm..." 
                        value={searchTerm} 
                        onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    />
                </div>
                <select className="filter-select" onChange={e => setFilterStatus(e.target.value)}>
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Tạm đóng</option>
                </select>
                <button className="btn-add" onClick={handleAddNew}>
                    <Plus size={16}/> Thêm mới
                </button>
            </div>
        )}
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="col-checkbox" onClick={toggleSelectAll}>
                {selectedIds.length > 0 && selectedIds.length === currentData.length ? 
                    <CheckSquare size={18} className="checkbox-custom checked"/> : 
                    <Square size={18} className="checkbox-custom"/>
                }
              </th>
              <th>Thông tin nhà hàng</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th style={{textAlign: 'right'}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                [...Array(5)].map((_, i) => (
                    <tr key={i} className="skeleton-row">
                        <td><div className="skeleton-bar" style={{width: 20}}></div></td>
                        <td><div style={{display:'flex', gap:10}}><div className="skeleton-bar" style={{width: 48, height:48}}></div><div style={{flex:1}}><div className="skeleton-bar" style={{width:'60%', marginBottom:5}}></div><div className="skeleton-bar" style={{width:'40%'}}></div></div></div></td>
                        <td><div className="skeleton-bar"></div></td>
                        <td><div className="skeleton-bar" style={{width: 80}}></div></td>
                        <td><div className="skeleton-bar" style={{width: 80, marginLeft:'auto'}}></div></td>
                    </tr>
                ))
            ) : currentData.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign:'center', padding:40, color:'#9ca3af'}}>Không tìm thấy dữ liệu phù hợp.</td></tr>
            ) : (
                currentData.map((res) => (
                    <tr key={res.id}>
                        <td className="col-checkbox" onClick={() => toggleSelect(res.id)}>
                            {selectedIds.includes(res.id) ? 
                                <CheckSquare size={18} className="checkbox-custom checked"/> : 
                                <Square size={18} className="checkbox-custom"/>
                            }
                        </td>
                        <td>
                            <div className="res-info">
                                <img src={res.image || 'https://via.placeholder.com/150'} className="res-img" alt={res.name} onError={(e)=>{e.target.src='https://via.placeholder.com/150'}} />
                                <div>
                                    <span className="res-name">{res.name}</span>
                                    <span className="res-addr">
                                        <MapPin size={13} color="#ef4444" fill="#ef4444" style={{opacity:0.8}}/> {res.address}
                                    </span>
                                </div>
                            </div>
                        </td>
                        <td style={{maxWidth: 250}}>
                            <div style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'#6b7280'}}>
                                {res.description || "Chưa có mô tả."}
                            </div>
                        </td>
                        <td>
                            <span className={`status-badge ${res.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                                {res.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm đóng'}
                            </span>
                        </td>
                        <td>
                            <div className="actions">
                                {/* NÚT SỬA DÙNG SVG TRỰC TIẾP */}
                                <button className="btn-icon edit" onClick={() => handleEdit(res)} title="Sửa">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                {/* NÚT XÓA DÙNG SVG TRỰC TIẾP */}
                                <button className="btn-icon delete" onClick={() => handleDelete(res.id)} title="Xóa">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
            <div className="pagination">
                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <ChevronLeft size={16}/>
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <ChevronRight size={16}/>
                </button>
            </div>
        )}
      </div>

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
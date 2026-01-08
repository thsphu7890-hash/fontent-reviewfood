import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  Plus, Edit, Trash2, X, Calendar, MapPin, Loader, 
  Search, Filter, ChevronLeft, ChevronRight, Image as ImageIcon,
  Zap, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const EventManagement = () => {
  // --- STATE ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Filter & Search & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [formData, setFormData] = useState({
    title: '', image: '', date: '', time: '', 
    location: '', status: 'UPCOMING', description: '', interested: 0
  });

  // --- API CALLS ---
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- LOGIC XỬ LÝ DỮ LIỆU (Filter, Search, Pagination) ---
  const processedData = useMemo(() => {
    let data = events;

    // 1. Search
    if (searchTerm) {
      data = data.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // 2. Filter
    if (filterStatus !== 'ALL') {
      data = data.filter(e => e.status === filterStatus);
    }

    // 3. Pagination calculation
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    return { total: data.length, totalPages, currentData };
  }, [events, searchTerm, filterStatus, currentPage]);

  // Thống kê nhanh
  const stats = {
    total: events.length,
    happening: events.filter(e => e.status === 'HAPPENING').length,
    upcoming: events.filter(e => e.status === 'UPCOMING').length,
    ended: events.filter(e => e.status === 'ENDED').length,
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      // Xử lý Date format cho input type="date"
      let formattedDate = event.date;
      if (Array.isArray(event.date)) {
        formattedDate = `${event.date[0]}-${String(event.date[1]).padStart(2,'0')}-${String(event.date[2]).padStart(2,'0')}`;
      }
      setFormData({ ...event, date: formattedDate });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '', image: '', date: '', time: '', 
        location: '', status: 'UPCOMING', description: '', interested: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, formData);
        toast.success("Cập nhật thành công!");
      } else {
        await api.post('/events', formData);
        toast.success("Tạo sự kiện mới thành công!");
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa sự kiện này?")) {
      try {
        await api.delete(`/events/${id}`);
        toast.success("Đã xóa sự kiện!");
        setEvents(events.filter(e => e.id !== id));
      } catch (error) {
        toast.error("Lỗi khi xóa.");
      }
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'HAPPENING': { label: 'Đang diễn ra', color: 'text-green-700', bg: 'bg-green-100', icon: Zap },
      'UPCOMING': { label: 'Sắp diễn ra', color: 'text-blue-700', bg: 'bg-blue-100', icon: Clock },
      'ENDED': { label: 'Đã kết thúc', color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle },
    };
    return map[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: AlertCircle };
  };

  return (
    <div className="event-manager">
      <style>{`
        .event-manager { font-family: 'Inter', sans-serif; color: #1e293b; }
        
        /* STATS CARDS */
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-box { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .stat-info div:first-child { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .stat-info div:last-child { font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.2; }

        /* TOOLBAR */
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
        .search-box { position: relative; width: 300px; }
        .search-input { width: 100%; padding: 10px 10px 10px 36px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; font-size: 14px; transition: 0.2s; }
        .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        
        .filter-select { padding: 10px 15px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; font-size: 14px; cursor: pointer; color: #475569; background: white; }
        
        .btn-primary { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2); }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); }

        /* TABLE */
        .table-wrapper { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .em-table { width: 100%; border-collapse: collapse; }
        .em-table th { text-align: left; padding: 16px; background: #f8fafc; color: #475569; font-size: 12px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .em-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: middle; }
        .em-table tr:hover { background: #f8fafc; }
        .em-img { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
        
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .action-btn { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: 0.2s; background: transparent; color: #64748b; }
        .action-btn:hover { background: #f1f5f9; color: #3b82f6; }
        .action-btn.delete:hover { background: #fef2f2; color: #ef4444; }

        /* PAGINATION */
        .pagination { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-top: 1px solid #e2e8f0; background: white; }
        .page-info { font-size: 13px; color: #64748b; }
        .page-controls { display: flex; gap: 5px; }
        .page-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; color: #64748b; font-size: 13px; transition: 0.2s; }
        .page-btn:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; }
        .page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* MODAL */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
        .modal-box { background: white; width: 650px; max-width: 95%; max-height: 90vh; border-radius: 16px; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); padding: 30px; position: relative; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .full-width { grid-column: 1 / -1; }
        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-label { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; }
        .input-field { padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; font-size: 14px; transition: 0.2s; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .img-preview { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-top: 10px; border: 1px dashed #cbd5e1; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
      `}</style>

      {/* 1. STATS DASHBOARD */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-icon bg-blue-100 text-blue-600"><Calendar /></div>
          <div className="stat-info"><div>Tổng sự kiện</div><div>{stats.total}</div></div>
        </div>
        <div className="stat-box">
          <div className="stat-icon bg-green-100 text-green-600"><Zap /></div>
          <div className="stat-info"><div>Đang diễn ra</div><div>{stats.happening}</div></div>
        </div>
        <div className="stat-box">
          <div className="stat-icon bg-indigo-100 text-indigo-600"><Clock /></div>
          <div className="stat-info"><div>Sắp diễn ra</div><div>{stats.upcoming}</div></div>
        </div>
        <div className="stat-box">
          <div className="stat-icon bg-gray-100 text-gray-600"><CheckCircle /></div>
          <div className="stat-info"><div>Đã kết thúc</div><div>{stats.ended}</div></div>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="toolbar">
        <div className="flex gap-3">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              className="search-input" 
              placeholder="Tìm kiếm sự kiện..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="HAPPENING">Đang diễn ra</option>
            <option value="UPCOMING">Sắp diễn ra</option>
            <option value="ENDED">Đã kết thúc</option>
          </select>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={18}/> Thêm sự kiện
        </button>
      </div>

      {/* 3. TABLE */}
      {loading ? (
        <div className="text-center py-20"><Loader className="animate-spin mx-auto text-blue-500" size={32}/></div>
      ) : (
        <div className="table-wrapper">
          <table className="em-table">
            <thead>
              <tr>
                <th width="80">Ảnh</th>
                <th>Thông tin cơ bản</th>
                <th>Thời gian & Địa điểm</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {processedData.currentData.map(ev => {
                const status = getStatusBadge(ev.status);
                const StatusIcon = status.icon;
                return (
                  <tr key={ev.id}>
                    <td>
                      <img src={ev.image} alt="" className="em-img" onError={(e) => e.target.src = 'https://via.placeholder.com/150'}/>
                    </td>
                    <td>
                      <div className="font-bold text-slate-800">{ev.title}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1">{ev.description}</div>
                    </td>
                    <td>
                      <div className="text-sm flex items-center gap-2 text-slate-700 font-medium">
                        <Calendar size={14} className="text-blue-500"/> 
                        {Array.isArray(ev.date) ? ev.date.join('-') : ev.date}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <Clock size={12}/> {ev.time}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <MapPin size={12}/> {ev.location}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${status.bg} ${status.color}`}>
                        <StatusIcon size={12}/> {status.label}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button className="action-btn" onClick={() => openModal(ev)} title="Sửa"><Edit size={16}/></button>
                        <button className="action-btn delete" onClick={() => handleDelete(ev.id)} title="Xóa"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {processedData.currentData.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Không tìm thấy sự kiện nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 4. PAGINATION */}
          {processedData.totalPages > 1 && (
            <div className="pagination">
              <div className="page-info">
                Hiển thị <b>{processedData.currentData.length}</b> trên tổng <b>{processedData.total}</b> sự kiện
              </div>
              <div className="page-controls">
                <button 
                  className="page-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft size={16}/>
                </button>
                {[...Array(processedData.totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  className="page-btn" 
                  disabled={currentPage === processedData.totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL FORM */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
              <X size={24}/>
            </button>
            <h2 className="text-xl font-bold mb-6 text-slate-800">
              {editingEvent ? 'Cập nhật sự kiện' : 'Thêm sự kiện mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="input-group full-width">
                <label className="input-label">Tên sự kiện</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="VD: Lễ hội ẩm thực đường phố..." />
              </div>

              <div className="input-group">
                <label className="input-label">Ngày diễn ra</label>
                <input required type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group">
                <label className="input-label">Khung giờ</label>
                <input required name="time" value={formData.time} onChange={handleChange} className="input-field" placeholder="VD: 09:00 - 22:00" />
              </div>

              <div className="input-group full-width">
                <label className="input-label">Địa điểm</label>
                <input required name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="VD: Công viên Thống Nhất..." />
              </div>

              <div className="input-group">
                <label className="input-label">Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input-field cursor-pointer">
                  <option value="UPCOMING">Sắp diễn ra</option>
                  <option value="HAPPENING">Đang diễn ra</option>
                  <option value="ENDED">Đã kết thúc</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Lượt quan tâm (Fake)</label>
                <input type="number" name="interested" value={formData.interested} onChange={handleChange} className="input-field" min="0" />
              </div>

              <div className="input-group full-width">
                <label className="input-label">Hình ảnh (URL)</label>
                <input required name="image" value={formData.image} onChange={handleChange} className="input-field" placeholder="https://..." />
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="img-preview" onError={(e) => e.target.style.display='none'} />
                ) : (
                  <div className="img-preview flex-col gap-2">
                    <ImageIcon size={32}/>
                    <span className="text-sm">Nhập link ảnh để xem trước</span>
                  </div>
                )}
              </div>

              <div className="input-group full-width">
                <label className="input-label">Mô tả chi tiết</label>
                <textarea required rows="4" name="description" value={formData.description} onChange={handleChange} className="input-field resize-none" placeholder="Nhập nội dung sự kiện..."></textarea>
              </div>

              <div className="full-width mt-2">
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                  {editingEvent ? 'LƯU THAY ĐỔI' : 'TẠO SỰ KIỆN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
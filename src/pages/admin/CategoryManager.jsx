import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import { 
  Edit3, Trash2, Plus, Search, X, Save, 
  CheckCircle, AlertCircle, PackageOpen, 
  CheckSquare, Square, LayoutGrid, Coffee, 
  UtensilsCrossed, Pizza, IceCream, Beef, 
  Soup, Carrot
} from 'lucide-react';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // --- HELPER: CHỌN ICON ---
  const getCategoryIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('uống') || n.includes('drink') || n.includes('cafe')) return <Coffee size={28} />;
    if (n.includes('ngọt') || n.includes('kem') || n.includes('bánh')) return <IceCream size={28} />;
    if (n.includes('nhanh') || n.includes('fast') || n.includes('pizza')) return <Pizza size={28} />;
    if (n.includes('nướng') || n.includes('bbq') || n.includes('thịt')) return <Beef size={28} />;
    if (n.includes('canh') || n.includes('lẩu') || n.includes('soup')) return <Soup size={28} />;
    if (n.includes('rau') || n.includes('chay') || n.includes('salad')) return <Carrot size={28} />;
    if (n.includes('chính') || n.includes('cơm') || n.includes('mặn')) return <UtensilsCrossed size={28} />;
    return <LayoutGrid size={28} />;
  };

  const getCategoryColor = (name) => {
    const n = name.toLowerCase();
    if (n.includes('uống')) return 'bg-amber-100 text-amber-600';
    if (n.includes('ngọt')) return 'bg-pink-100 text-pink-600';
    if (n.includes('nhanh')) return 'bg-orange-100 text-orange-600';
    if (n.includes('nướng')) return 'bg-red-100 text-red-600';
    if (n.includes('rau')) return 'bg-green-100 text-green-600';
    return 'bg-indigo-100 text-indigo-600';
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/categories');
      const enrichedData = (Array.isArray(response.data) ? response.data : []).map(c => ({
          ...c,
          itemCount: Math.floor(Math.random() * 50) + 5
      }));
      setCategories(enrichedData);
    } catch (error) {
      console.error("Lỗi:", error);
      showToast("Không thể tải dữ liệu", "error");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
      let data = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (sortOrder === 'az') data.sort((a, b) => a.name.localeCompare(b.name));
      else if (sortOrder === 'za') data.sort((a, b) => b.name.localeCompare(a.name));
      else data.sort((a, b) => b.id - a.id);
      return data;
  }, [categories, searchTerm, sortOrder]);

  const openModal = (category = null) => {
    setEditingCategory(category);
    setCategoryName(category ? category.name : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const exists = categories.some(c => c.name.toLowerCase() === categoryName.trim().toLowerCase() && c.id !== editingCategory?.id);
    if (exists) return showToast("Tên danh mục đã tồn tại!", "error");

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name: categoryName });
        setCategories(categories.map(cat => cat.id === editingCategory.id ? { ...cat, name: categoryName } : cat));
        showToast("Đã cập nhật thành công!", "success");
      } else {
        const response = await api.post('/api/categories', { name: categoryName });
        setCategories([{ ...response.data, itemCount: 0 }, ...categories]);
        showToast("Thêm mới thành công!", "success");
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast("Lỗi hệ thống!", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) {
      try {
        await api.delete(`/api/categories/${id}`);
        setCategories(categories.filter(c => c.id !== id));
        showToast("Đã xóa thành công!", "success");
      } catch (error) {
        showToast("Không thể xóa danh mục này!", "error");
      }
    }
  };

  const handleBulkDelete = async () => {
      if (window.confirm(`Xóa ${selectedIds.length} danh mục đã chọn?`)) {
          const newCats = categories.filter(c => !selectedIds.includes(c.id));
          setCategories(newCats);
          setSelectedIds([]);
          showToast(`Đã xóa ${selectedIds.length} danh mục`, "success");
      }
  };

  const toggleSelect = (id) => {
      if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
      else setSelectedIds([...selectedIds, id]);
  };

  return (
    <div className="cat-page">
      <style>{`
        :root {
          --primary: #6366f1;
          --bg-page: #f8fafc;
          --text-main: #0f172a;
          --text-sub: #64748b;
          --border: #e2e8f0;
          --danger: #ef4444;
          --success: #10b981;
        }

        .cat-page { padding: 40px; background-color: var(--bg-page); min-height: 100vh; font-family: 'Inter', sans-serif; color: var(--text-main); }

        /* HEADER */
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .page-title h2 { font-size: 32px; font-weight: 800; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
        .page-subtitle { color: var(--text-sub); font-size: 15px; margin-top: 8px; font-weight: 500; }
        .stats-badge { background: #e0e7ff; color: var(--primary); padding: 4px 12px; border-radius: 99px; font-size: 13px; font-weight: 700; margin-left: 12px; vertical-align: middle; }

        /* TOOLBAR */
        .toolbar { background: white; padding: 16px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; gap: 16px; align-items: center; margin-bottom: 32px; border: 1px solid var(--border); }
        .search-box { position: relative; flex: 1; max-width: 400px; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; width: 18px; }
        .search-input { width: 100%; padding: 12px 12px 12px 42px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; outline: none; transition: 0.2s; background: #f8fafc; color: var(--text-main); }
        .search-input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }

        .filter-group { display: flex; gap: 12px; margin-left: auto; }
        .select-custom { padding: 10px 36px 10px 14px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; color: var(--text-main); outline: none; cursor: pointer; background: #fff; font-weight: 500; transition: 0.2s; }
        
        .btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; border: none; height: 44px; }
        .btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25); }
        .btn-primary:hover { transform: translateY(-1px); }
        .btn-danger { background: #fee2e2; color: var(--danger); }
        .btn-danger:hover { background: var(--danger); color: white; }

        /* GRID SYSTEM */
        .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }

        /* CARD STYLE - FIXED */
        .card { 
            background: white; border-radius: 20px; border: 1px solid var(--border); 
            padding: 24px; position: relative; transition: all 0.3s ease; 
            cursor: pointer; display: flex; flex-direction: column; height: 210px; /* Tăng chiều cao xíu */
            box-shadow: 0 2px 5px rgba(0,0,0,0.02); overflow: hidden;
        }
        .card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1); border-color: #c7d2fe; }
        .card.selected { border: 2px solid var(--primary); background: #eef2ff; }
        
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        
        /* Icon Colors */
        .icon-wrapper { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .bg-indigo-100 { background: #e0e7ff; color: #4f46e5; }
        .bg-amber-100 { background: #fef3c7; color: #d97706; }
        .bg-pink-100 { background: #fce7f3; color: #db2777; }
        .bg-orange-100 { background: #ffedd5; color: #ea580c; }
        .bg-red-100 { background: #fee2e2; color: #dc2626; }
        .bg-green-100 { background: #dcfce7; color: #16a34a; }

        .card:hover .icon-wrapper { transform: scale(1.1) rotate(-5deg); }
        
        .check-btn { color: #cbd5e1; transition: 0.2s; cursor: pointer; }
        .check-btn:hover { color: var(--primary); }
        .check-btn.checked { color: var(--primary); fill: #e0e7ff; }

        .card-content { flex: 1; }
        .card-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin: 0 0 8px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-meta { font-size: 13px; color: var(--text-sub); display: flex; align-items: center; gap: 6px; font-weight: 500; }
        .badge-count { background: #f1f5f9; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #475569; }

        /* ACTION BUTTONS - FIXED */
        .card-actions { 
            margin-top: auto; 
            padding-top: 16px; 
            border-top: 1px dashed var(--border); 
            display: flex; 
            justify-content: flex-end; 
            gap: 10px;
            /* Bỏ opacity để nút luôn hiện, tránh lỗi không hiển thị icon */
        }
        
        .icon-btn { 
            width: 36px; height: 36px; 
            border-radius: 10px; 
            display: flex; align-items: center; justify-content: center; 
            border: 1px solid var(--border); 
            background: white; 
            color: var(--text-sub); 
            cursor: pointer; 
            transition: 0.2s; 
        }
        .icon-btn:hover { border-color: var(--primary); color: var(--primary); background: #f5f3ff; }
        .icon-btn.delete:hover { border-color: var(--danger); color: var(--danger); background: #fef2f2; }

        /* EMPTY STATE */
        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px; background: #fff; border-radius: 20px; border: 2px dashed var(--border); color: var(--text-sub); }
        
        /* MODAL & TOAST styles giữ nguyên */
        .overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; animation: fadeIn 0.2s ease-out; }
        .modal { background: white; width: 100%; max-width: 480px; border-radius: 24px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); animation: zoomIn 0.3s; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-title { font-size: 24px; font-weight: 800; color: var(--text-main); margin: 0; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
        .form-input { width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 12px; font-size: 15px; outline: none; transition: 0.2s; background: #f8fafc; color: var(--text-main); }
        .form-input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .skeleton { background: #e2e8f0; border-radius: 20px; height: 200px; animation: pulse 1.5s infinite; }
        .toast { position: fixed; bottom: 30px; right: 30px; background: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px; z-index: 100; animation: slideUp 0.3s; border-left: 4px solid var(--success); }
        .toast.error { border-left-color: var(--danger); }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* HEADER SECTION */}
      <div className="page-header">
        <div className="page-title">
          <h2>Quản Lý Danh Mục <span className="stats-badge">{categories.length}</span></h2>
          <div className="page-subtitle">Tổ chức và phân loại menu món ăn của bạn</div>
        </div>
      </div>

      {/* TOOLBAR SECTION */}
      <div className="toolbar">
        {selectedIds.length > 0 ? (
          <div style={{flex: 1, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span style={{fontWeight: 600, color: '#475569', display:'flex', alignItems:'center', gap: 8}}>
              <CheckCircle size={20} color="#6366f1"/>
              Đã chọn {selectedIds.length} mục
            </span>
            <button className="btn btn-danger" onClick={handleBulkDelete}>
              <Trash2 size={18}/> Xóa tất cả
            </button>
          </div>
        ) : (
          <>
            <div className="search-box">
              <Search className="search-icon" />
              <input 
                className="search-input"
                placeholder="Tìm kiếm danh mục..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <select className="select-custom" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Mới nhất</option>
                <option value="az">Tên (A-Z)</option>
                <option value="za">Tên (Z-A)</option>
              </select>
              
              <button className="btn btn-primary" onClick={() => openModal()}>
                <Plus size={20} /> Thêm Mới
              </button>
            </div>
          </>
        )}
      </div>

      {/* CONTENT GRID */}
      {loading ? (
        <div className="grid-container">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="skeleton"></div>)}
        </div>
      ) : (
        <div className="grid-container">
          {filteredCategories.map((cat) => (
            <div 
              key={cat.id} 
              className={`card ${selectedIds.includes(cat.id) ? 'selected' : ''}`}
              onClick={() => toggleSelect(cat.id)}
            >
              <div className="card-top">
                <div className={`icon-wrapper ${getCategoryColor(cat.name)}`}>
                  {getCategoryIcon(cat.name)}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  {selectedIds.includes(cat.id) ? 
                    <CheckSquare size={24} className="check-btn checked" onClick={() => toggleSelect(cat.id)}/> : 
                    <Square size={24} className="check-btn" onClick={() => toggleSelect(cat.id)}/>
                  }
                </div>
              </div>
              
              <div className="card-content">
                <h3 className="card-title" title={cat.name}>{cat.name}</h3>
                <div className="card-meta">
                  <PackageOpen size={14} />
                  <span className="badge-count">{cat.itemCount} món ăn</span>
                </div>
              </div>

              {/* ACTION BUTTONS (Đã Fix) */}
              <div className="card-actions">
                <button className="icon-btn" onClick={(e) => { e.stopPropagation(); openModal(cat); }} title="Chỉnh sửa">
                  <Edit3 size={18} />
                </button>
                <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }} title="Xóa bỏ">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {filteredCategories.length === 0 && (
             <div className="empty-state">
                 <PackageOpen className="empty-icon" size={64}/>
                 <h3>Không tìm thấy danh mục nào</h3>
                 <p>Thử tìm kiếm từ khóa khác hoặc thêm danh mục mới</p>
             </div>
          )}
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button className="close-btn" style={{background:'none', border:'none', cursor:'pointer'}} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{marginBottom: 24}}>
                <label className="form-label">Tên danh mục <span style={{color:'red'}}>*</span></label>
                <input 
                  className="form-input"
                  placeholder="Ví dụ: Đồ uống, Món khai vị..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{display:'flex', gap: 12}}>
                <button type="button" className="btn" style={{flex:1, justifyContent:'center', background:'#f1f5f9', color:'#475569'}} onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{flex:1, justifyContent:'center'}}>
                  <Save size={18} /> {editingCategory ? 'Lưu Thay Đổi' : 'Tạo Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      {toast.show && (
        <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.type === 'success' ? <CheckCircle size={24} color="#10b981" /> : <AlertCircle size={24} color="#ef4444" />}
          <span className="toast-text">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
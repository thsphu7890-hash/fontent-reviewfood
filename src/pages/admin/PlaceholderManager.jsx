// src/components/admin/PlaceholderManager.jsx
import React from 'react';

const PlaceholderManager = ({ title }) => {
  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', textAlign: 'center' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>Quản lý {title}</h2>
      <p style={{ color: '#64748b' }}>Chức năng này đang được phát triển...</p>
      <img 
        src="https://cdn-icons-png.flaticon.com/512/7604/7604066.png" 
        alt="Developing" 
        style={{ width: '150px', marginTop: '20px', opacity: 0.5 }} 
      />
    </div>
  );
};

export default PlaceholderManager;
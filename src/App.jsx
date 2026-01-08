import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { CartProvider } from './context/CartContext';

// --- COMPONENTS (Auth & Driver) ---
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DriverRegistration from './components/DriverRegModal'; 
import DriverLogin from './pages/DriverLogin'; 

// --- PAGES (User) ---
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Order from './pages/Order'; 
import Profile from './pages/Profile'; 
import SearchPage from './pages/SearchPage'; 
import Settings from './pages/Settings';
import MenuPage from './pages/MenuPage'; 
import NotificationPage from './pages/NotificationPage';
import EventPage from './pages/EventPage';

// --- QUAN TRỌNG: Import trang Lịch sử & Chi tiết ---
import History from './pages/History';       
import OrderDetail from './pages/OrderDetail'; 

// --- 👇 CẬP NHẬT MỚI: Import 2 trang Dashboard & Mission 👇 ---
// (Lưu ý: Đường dẫn trỏ về folder components/user như trong hình của bạn)
import UserDashboard from './components/user/UserDashboard';
import MissionHunting from './components/user/MissionHunting';

// --- FEATURES ---
import VoucherMarket from './components/user/VoucherMarket';
import GameZone from './components/user/GameZone';

// --- DASHBOARDS ---
import AdminDashboard from './pages/admin/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard'; 

function App() {
  return (
    <CartProvider>
      <Router>
        {/* Cấu hình thông báo (Toast) toàn cục */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '16px',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            },
            success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }} 
        />
        
        <div className="app-container">
          <Routes>
            {/* =========================================
                1. PUBLIC ROUTES (Login / Register)
               ========================================= */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/driver/login" element={<DriverLogin />} /> 
            <Route path="/driver-register" element={<DriverRegistration />} />
            
            {/* =========================================
                2. DASHBOARD ROUTES (Giao diện riêng)
               ========================================= */}
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            
            {/* 👇 CẬP NHẬT: Trang Dashboard của User 👇 */}
            <Route path="/dashboard" element={<UserDashboard />} />

            {/* 👇 CẬP NHẬT: Trang Nhiệm vụ 👇 */}
            <Route path="/mission" element={<MissionHunting />} />

            {/* =========================================
                3. MAIN USER ROUTES 
               ========================================= */}
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/history" element={<History />} /> 
            <Route path="/order/:id" element={<OrderDetail />} /> 
            <Route path="/order" element={<Order />} />          
            
            <Route path="/settings" element={<Settings />} />
            
            {/* Tính năng phụ */}
            <Route path="/vouchers" element={<VoucherMarket />} />
            <Route path="/game" element={<GameZone />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/events" element={<EventPage />} />

            {/* =========================================
                4. ADMIN ROUTES
               ========================================= */}
            <Route path="/admin" element={<AdminDashboard tab="dashboard" />} />
            <Route path="/admin/restaurants" element={<AdminDashboard tab="restaurants" />} />
            <Route path="/admin/foods" element={<AdminDashboard tab="foods" />} />
            <Route path="/admin/categories" element={<AdminDashboard tab="categories" />} />
            <Route path="/admin/orders" element={<AdminDashboard tab="orders" />} />
            <Route path="/admin/reviews" element={<AdminDashboard tab="reviews" />} />
            <Route path="/admin/users" element={<AdminDashboard tab="users" />} />
            <Route path="/admin/vouchers" element={<AdminDashboard tab="vouchers" />} />
            <Route path="/admin/drivers" element={<AdminDashboard tab="drivers" />} />
            <Route path="/admin/missions" element={<AdminDashboard tab="missions" />} />
            <Route path="/admin/events" element={<AdminDashboard tab="events" />} />

          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
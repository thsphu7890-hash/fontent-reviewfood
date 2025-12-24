import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Order from './pages/Order'; 
import Profile from './pages/Profile'; 
import SearchPage from './pages/SearchPage'; 
import History from './pages/History'; 
import { CartProvider } from './context/CartContext';
import './App.css';

import VoucherMarket from './components/user/VoucherMarket';
import GameZone from './components/user/GameZone';
import Settings from './pages/Settings';

// --- IMPORT MODULE TÀI XẾ ---
import DriverDashboard from './pages/driver/DriverDashboard';

// --- 👇 IMPORT MODULE USER DASHBOARD (MỚI) 👇 ---
import UserDashboard from './pages/user/UserDashboard';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<><SearchPage /><Footer /></>} />
            <Route path="/restaurant/:id" element={<><RestaurantDetail /><Footer /></>} />

            {/* --- USER ROUTES --- */}
            {/* Dashboard mới tích hợp: Hồ sơ, Lịch sử, Nhiệm vụ */}
            <Route path="/user/dashboard" element={<UserDashboard />} />

            {/* Các route cũ (có thể giữ lại hoặc chuyển dần sang Dashboard) */}
            <Route path="/profile" element={<><Profile /><Footer /></>} />
            <Route path="/history" element={<><History /><Footer /></>} />
            <Route path="/order" element={<><Order /><Footer /></>} />
            <Route path="/settings" element={<><Settings /><Footer /></>} />
            <Route path="/vouchers" element={<><VoucherMarket /><Footer /></>} />
            <Route path="/game" element={<><GameZone /><Footer /></>} />

            {/* --- DRIVER ROUTES --- */}
            <Route path="/driver/dashboard" element={<DriverDashboard />} />

            {/* --- ADMIN ROUTES --- */}
            <Route path="/admin/*" element={
                <Routes>
                  <Route index element={<AdminDashboard />} /> 
                  <Route path="restaurants" element={<AdminDashboard tab="restaurants" />} /> 
                  <Route path="foods" element={<AdminDashboard tab="foods" />} /> 
                  <Route path="categories" element={<AdminDashboard tab="categories" />} /> 
                  <Route path="orders" element={<AdminDashboard tab="orders" />} />
                  <Route path="reviews" element={<AdminDashboard tab="reviews" />} />
                  <Route path="users" element={<AdminDashboard tab="users" />} />
                  <Route path="vouchers" element={<AdminDashboard tab="vouchers" />} />
                  <Route path="drivers" element={<AdminDashboard tab="drivers" />} />
                </Routes>
            } />

          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
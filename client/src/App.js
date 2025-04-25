import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CreateVehiclePage from './pages/CreateVehiclePage';
import EditVehiclePage from './pages/EditVehiclePage';
import NotFoundPage from './pages/NotFoundPage';
import AccountPage from './pages/AccountPage';
import OrderDetails from './components/OrderDetails';
import NewsListPage from './pages/NewsListPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CreateNewsPage from './pages/CreateNewsPage';
import EditNewsPage from './pages/EditNewsPage';

import ProtectedRoute from './components/auth/ProtectedRoute';

const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute>
      {({ currentUser }) => {
        if (!currentUser || !currentUser.is_admin) {
          return <Navigate to="/" />;
        }
        return children;
      }}
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1 main-content">
            <div className="container">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/catalog/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/account" element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                } />
                <Route path="/admin/create-news" element={
                  <AdminRoute>
                    <CreateNewsPage />
                  </AdminRoute>
                } />
                <Route path="/admin/edit-news/:id" element={
                  <AdminRoute>
                    <EditNewsPage />
                  </AdminRoute>
                } />
                <Route path="/order/:id" element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                } />
                <Route path="/profile/create-vehicle" element={
                  <ProtectedRoute>
                    <CreateVehiclePage />
                  </ProtectedRoute>
                } />
                <Route path="/profile/edit-vehicle/:id" element={
                  <ProtectedRoute>
                    <EditVehiclePage />
                  </ProtectedRoute>
                } />
                <Route path="/news" element={<NewsListPage />} />
                <Route path="/news/:id" element={<NewsDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App; 
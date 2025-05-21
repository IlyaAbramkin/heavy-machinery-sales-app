import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import Layout from "./components/Layout"
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CatalogPage from './pages/CatalogPage';
import NewsPage from './pages/NewsPage';
import VehiclePage from './pages/VehiclePage';
import ProfilePage from './pages/ProfilePage';
import CreateVehiclePage from './pages/CreateVehiclePage';
import BuyingPage from './pages/BuyingPage';
import CartPage from './pages/CartPage';
import AdminPanel from './pages/AdminPanel';
import CreateNewsPage from './pages/CreateNewsPage'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';





function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/vehicle/:id" element={<VehiclePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create" element={<CreateVehiclePage />} />
          <Route path="/buying" element={<BuyingPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/createNews" element={<CreateNewsPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <div className="d-flex align-items-center">
              <div className="logo-icon me-2" style={{ width: '40px', height: '40px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0054A6">
                  <path d="M12 2l3.5 6 7.5 1-5.5 4.5 1.5 7.5-7-4-7 4 1.5-7.5L1 9l7.5-1z"/>
                </svg>
              </div>
              <span className="fw-bold">Автоспецтехника</span>
            </div>
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link to="/" className="nav-link">Главная</Link>
              </li>
              <li className="nav-item">
                <Link to="/catalog" className="nav-link">Каталог</Link>
              </li>
              <li className="nav-item">
                <Link to="/news" className="nav-link">Новости</Link>
              </li>
            </ul>
            
            <div className="d-flex align-items-center">
              <Link to="/cart" className="cart-icon-container me-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {getItemCount() > 0 && (
                  <span className="cart-badge">{getItemCount()}</span>
                )}
              </Link>
              
              {currentUser ? (
                <>
                  {currentUser.is_admin ? (
                    <>
                      <Link to="/admin" className="btn btn-outline-primary me-2">
                        Панель управления
                      </Link>
                      <Link to="/account" className="btn btn-outline-primary me-2">
                        Личный кабинет
                      </Link>
                    </>
                  ) : (
                    <Link to="/account" className="btn btn-outline-primary me-2">
                      Личный кабинет
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="btn btn-outline-danger"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-primary me-2">
                    Войти
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Зарегистрироваться
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 
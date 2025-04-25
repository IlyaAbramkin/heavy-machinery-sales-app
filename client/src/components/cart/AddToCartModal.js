import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AddToCartModal.css';

const AddToCartModal = ({ show, onClose, vehicle }) => {
  const navigate = useNavigate();

  if (!show) return null;

  const handleContinueShopping = () => {
    onClose();
  };

  const handleGoToCart = () => {
    navigate('/cart');
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Закрываем модальное окно только при клике на оверлей
    if (e.target.className === 'add-to-cart-modal-overlay') {
      onClose();
    }
  };

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="add-to-cart-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-to-cart-modal-content">
        <div className="add-to-cart-modal-header">
          <h5 className="add-to-cart-modal-title">Товар добавлен в корзину</h5>
          <button 
            type="button" 
            className="add-to-cart-close-btn" 
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="add-to-cart-modal-body">
          <div className="d-flex align-items-center mb-3">
            <div 
              className="bg-light d-flex align-items-center justify-content-center me-3" 
              style={{ width: '70px', height: '70px', borderRadius: '4px' }}
            >
              <span className="text-muted">{vehicle?.title?.charAt(0) || 'А'}</span>
            </div>
            <div>
              <h5 className="mb-1">{vehicle?.title || 'Товар'}</h5>
              {vehicle?.price > 0 && (
                <p className="text-success">{formatPrice(vehicle.price)}</p>
              )}
              <p className="text-muted mb-0">Добавлен в корзину</p>
            </div>
          </div>
        </div>
        <div className="add-to-cart-modal-footer">
          <button 
            type="button" 
            className="add-to-cart-btn-outline" 
            onClick={handleContinueShopping}
          >
            Продолжить покупки
          </button>
          <button 
            type="button" 
            className="add-to-cart-btn-primary" 
            onClick={handleGoToCart}
          >
            Перейти в корзину
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal; 
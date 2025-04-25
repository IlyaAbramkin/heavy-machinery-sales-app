import React from 'react';
import { Link } from 'react-router-dom';
import './CartModal.css';
import { useCart } from '../context/CartContext';

const CartModal = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal-content" onClick={e => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h2>Корзина</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="cart-modal-body">
          {cart.length === 0 ? (
            <div className="empty-cart-message">
              Ваша корзина пуста
            </div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.id}>
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="cart-item-image"
                  />
                )}
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">{item.price} ₽</p>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >-</button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >+</button>
                  </div>
                  <button 
                    className="remove-button" 
                    onClick={() => removeFromCart(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="cart-modal-footer">
            <div className="cart-total">
              <span>Итого:</span>
              <span>{getTotalPrice()} ₽</span>
            </div>
            <div className="cart-actions">
              <button className="continue-shopping" onClick={onClose}>
                Продолжить покупки
              </button>
              <Link to="/cart">
                <button className="checkout-button">
                  Оформить заказ
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal; 
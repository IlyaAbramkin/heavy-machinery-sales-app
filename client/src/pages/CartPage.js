import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { requestsApi } from '../api/api';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    full_name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    city: '',
    payment_method: 'банковская карта',
    delivery_type: 'доставка',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  
  // Проверяем авторизацию
  useEffect(() => {
    if (isCheckingOut && !currentUser) {
      navigate('/login', { state: { from: location } });
    }
  }, [isCheckingOut, currentUser, navigate, location]);
  
  // Обновляем форму при изменении данных пользователя
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        full_name: currentUser.name || prev.full_name,
        email: currentUser.email || prev.email
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, parseInt(newQuantity));
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name) errors.full_name = 'Укажите ФИО';
    if (!formData.email) errors.email = 'Укажите email';
    if (!formData.phone) errors.phone = 'Укажите телефон';
    if (!formData.city) errors.city = 'Укажите город';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError(null);
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (cart.length === 0) {
      setError('Корзина пуста. Добавьте товары для оформления заказа.');
      return;
    }
    
    if (validateForm()) {
      try {
        // Подготовка данных заявки
        const now = new Date();
        // Форматируем дату без часового пояса
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const requestData = {
          ...formData,
          session_id: Math.floor(Math.random() * 1000000), // Имитация session ID
          request_date: formattedDate,
          status: 'заявка создана',
          total_price: Number(getTotalPrice()),
          tovary_v_zayavke: cart.map(item => ({
            vehicle_id: item.id,
            quantity: item.quantity,
            name: item.name,
            price: Number(item.price)
          }))
        };
        
        // Отправка заявки через новый endpoint
        await requestsApi.createOrder(requestData);
        
        // Очистка корзины и формы
        clearCart();
        setFormData({
          company_name: '',
          full_name: currentUser?.name || '',
          email: currentUser?.email || '',
          phone: '',
          city: '',
          payment_method: 'банковская карта',
          delivery_type: 'доставка',
          message: ''
        });
        
        setSuccessMessage('Заказ успешно оформлен! Наши менеджеры свяжутся с вами в ближайшее время.');
        setIsCheckingOut(false);
      } catch (err) {
        console.error('Error creating order:', err);
        setError('Ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.');
      }
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
    <div className="row">
      <div className="col-12 mb-4">
        <h2>Корзина</h2>
      </div>

      {successMessage && (
        <div className="col-12 mb-4">
          <div className="alert alert-success" role="alert">
            {successMessage}
            <div className="mt-3">
              <Link to="/catalog" className="btn btn-primary">
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="col-12 mb-4">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      )}

      {!successMessage && (
        <>
          {cart.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info" role="alert">
                Ваша корзина пуста.
              </div>
              <div className="mt-3">
                <Link to="/catalog" className="btn btn-primary">
                  Перейти в каталог
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className={`col-${isCheckingOut ? '7' : '12'} mb-4`}>
                <div className="card">
                  <div className="card-header bg-primary text-white">
                    <h3 className="card-title mb-0">Товары в корзине</h3>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th style={{ width: '50%' }}>Наименование</th>
                            <th style={{ width: '20%' }}>Количество</th>
                            <th style={{ width: '15%' }}>Цена</th>
                            <th style={{ width: '15%' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="bg-light d-flex align-items-center justify-content-center me-3" 
                                    style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                                  >
                                    <span className="text-muted">{item.name.charAt(0)}</span>
                                  </div>
                                  <div>
                                    <h5 className="mb-0">{item.name}</h5>
                                    {item.vehicleDetails && item.vehicleDetails.category && (
                                      <small className="text-muted">{item.vehicleDetails.category}</small>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                  style={{ width: '80px' }}
                                />
                              </td>
                              <td>
                                {formatPrice(item.price)}
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="2" className="text-end fw-bold">
                              Итого:
                            </td>
                            <td colSpan="2" className="fw-bold">
                              {formatPrice(getTotalPrice())}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    <div className="d-flex justify-content-between mt-3">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => clearCart()}
                      >
                        Очистить корзину
                      </button>
                      
                      <div>
                        <Link to="/catalog" className="btn btn-outline-primary me-2">
                          Продолжить покупки
                        </Link>
                        {!isCheckingOut && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => setIsCheckingOut(true)}
                          >
                            Оформить заказ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isCheckingOut && (
                <div className="col-5">
                  <div className="card">
                    <div className="card-header bg-primary text-white">
                      <h3 className="card-title mb-0">Оформление заказа</h3>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label htmlFor="company_name" className="form-label">Название компании (необязательно)</label>
                          <input
                            type="text"
                            className="form-control"
                            id="company_name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="full_name" className="form-label">ФИО</label>
                          <input
                            type="text"
                            className={`form-control ${formErrors.full_name ? 'is-invalid' : ''}`}
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                          />
                          {formErrors.full_name && (
                            <div className="invalid-feedback">{formErrors.full_name}</div>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email</label>
                          <input
                            type="email"
                            className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                          {formErrors.email && (
                            <div className="invalid-feedback">{formErrors.email}</div>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="phone" className="form-label">Телефон</label>
                          <input
                            type="tel"
                            className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                          {formErrors.phone && (
                            <div className="invalid-feedback">{formErrors.phone}</div>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="city" className="form-label">Город</label>
                          <input
                            type="text"
                            className={`form-control ${formErrors.city ? 'is-invalid' : ''}`}
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                          />
                          {formErrors.city && (
                            <div className="invalid-feedback">{formErrors.city}</div>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="payment_method" className="form-label">Способ оплаты</label>
                          <select
                            className="form-select"
                            id="payment_method"
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                          >
                            <option value="банковская карта">Банковская карта</option>
                            <option value="СБП">СБП</option>
                            <option value="наличные">Наличные</option>
                          </select>
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="delivery_type" className="form-label">Тип доставки</label>
                          <select
                            className="form-select"
                            id="delivery_type"
                            name="delivery_type"
                            value={formData.delivery_type}
                            onChange={handleChange}
                          >
                            <option value="доставка">Доставка</option>
                            <option value="самовывоз">Самовывоз</option>
                          </select>
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="message" className="form-label">Сообщение (необязательно)</label>
                          <textarea
                            className="form-control"
                            id="message"
                            name="message"
                            rows="3"
                            value={formData.message}
                            onChange={handleChange}
                          ></textarea>
                        </div>
                        
                        <div className="d-grid gap-2">
                          <button type="submit" className="btn btn-primary">
                            Оформить заказ
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary"
                            onClick={() => setIsCheckingOut(false)}
                          >
                            Вернуться к корзине
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CartPage; 
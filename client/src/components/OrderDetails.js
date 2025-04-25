import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requestsApi } from '../api/api';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await requestsApi.getOrderDetails(id);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Не удалось загрузить детали заказа. Попробуйте позже.');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="alert alert-info my-4" role="alert">
        Заказ не найден.
      </div>
    );
  }

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Получение статуса заказа в виде значка
  const getStatusBadge = (status) => {
    let badgeClass = '';
    
    switch (status) {
      case 'заявка создана':
        badgeClass = 'bg-info';
        break;
      case 'заявка обрабатывается':
        badgeClass = 'bg-warning';
        break;
      case 'заявка получена':
        badgeClass = 'bg-primary';
        break;
      case 'заявка выполнена':
        badgeClass = 'bg-success';
        break;
      default:
        badgeClass = 'bg-secondary';
    }
    
    return <span className={`badge ${badgeClass}`}>{status}</span>;
  };

  // Рассчет общей суммы заказа
  const calculateTotal = () => {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Функция для форматирования цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container my-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Главная</Link></li>
          <li className="breadcrumb-item"><Link to="/account">Личный кабинет</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Заказ #{order.request_id}</li>
        </ol>
      </nav>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Заказ #{order.request_id}</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h4>Информация о заказе</h4>
              <div className="mb-3">
                <p><strong>Дата заказа:</strong> {formatDate(order.request_date)}</p>
                <p><strong>Статус:</strong> {getStatusBadge(order.status)}</p>
                <p><strong>Способ оплаты:</strong> {order.payment_method}</p>
                <p><strong>Способ доставки:</strong> {order.delivery_type}</p>
              </div>
            </div>
            <div className="col-md-6">
              <h4>Информация о клиенте</h4>
              <div className="mb-3">
                <p><strong>ФИО:</strong> {order.full_name}</p>
                {order.company_name && <p><strong>Компания:</strong> {order.company_name}</p>}
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Телефон:</strong> {order.phone}</p>
                <p><strong>Город:</strong> {order.city}</p>
              </div>
            </div>
          </div>

          {order.message && (
            <div className="alert alert-info mb-4">
              <h5>Комментарий к заказу:</h5>
              <p className="mb-0">{order.message}</p>
            </div>
          )}

          <h4>Товары в заказе</h4>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Количество</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.vehicle_id}>
                    <td>
                      <Link to={`/catalog/${item.vehicle_id}`}>
                        {item.title || `Техника #${item.vehicle_id}`}
                      </Link>
                      {item.description && (
                        <p className="small text-muted mb-0">{item.description.substring(0, 100)}...</p>
                      )}
                    </td>
                    <td>{item.quantity} шт.</td>
                    <td>{formatPrice(item.price)}</td>
                    <td>{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end"><strong>Итого:</strong></td>
                  <td><strong>{calculateTotal()} ₽</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div className="card-footer">
          <Link to="/account" className="btn btn-outline-primary">
            Вернуться в личный кабинет
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 
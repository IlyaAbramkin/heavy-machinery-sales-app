import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vehiclesApi, requestsApi, newsApi } from '../api/api';
import AuthContext from '../context/AuthContext';
import { Tabs, Tab } from 'react-bootstrap';

const AdminDashboardPage = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('publications');
  
  // Состояния для публикаций
  const [allVehicles, setAllVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);
  
  // Состояния для заказов
  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  
  // Состояния для новостей
  const [allNews, setAllNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState(null);

  // Проверка прав администратора
  useEffect(() => {
    if (currentUser && !currentUser.is_admin) {
      navigate('/account');
    }
  }, [currentUser, navigate]);

  // Загрузка всех публикаций
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const response = await vehiclesApi.getAll();
        setAllVehicles(response.data);
        setVehiclesError(null);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setVehiclesError('Ошибка при загрузке публикаций');
      } finally {
        setLoadingVehicles(false);
      }
    };

    if (activeTab === 'publications') {
      fetchVehicles();
    }
  }, [activeTab]);

  // Загрузка всех заказов
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const response = await requestsApi.getAll();
        setAllOrders(response.data);
        setOrdersError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrdersError('Ошибка при загрузке заказов');
      } finally {
        setLoadingOrders(false);
      }
    };

    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  // Загрузка всех новостей
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true);
        const response = await newsApi.getAll();
        setAllNews(response.data);
        setNewsError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setNewsError('Ошибка при загрузке новостей');
      } finally {
        setLoadingNews(false);
      }
    };

    if (activeTab === 'news') {
      fetchNews();
    }
  }, [activeTab]);

  // Функция удаления публикации
  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту публикацию?')) {
      try {
        await vehiclesApi.delete(id);
        setAllVehicles(allVehicles.filter(vehicle => vehicle.vehicle_id !== id));
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        alert('Не удалось удалить публикацию');
      }
    }
  };

  // Функция актуализации даты публикации
  const handleUpdatePublicationDate = async (id) => {
    try {
      await vehiclesApi.updatePublicationDate(id);
      
      // Обновляем список публикаций, чтобы отразить новую дату
      const updatedVehicles = await vehiclesApi.getAll();
      setAllVehicles(updatedVehicles.data);
      
      alert('Дата публикации успешно обновлена');
    } catch (err) {
      console.error('Error updating publication date:', err);
      alert('Не удалось обновить дату публикации');
    }
  };

  // Функция удаления новости
  const handleDeleteNews = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту новость?')) {
      try {
        await newsApi.delete(id);
        setAllNews(allNews.filter(news => news.news_id !== id));
      } catch (err) {
        console.error('Error deleting news:', err);
        alert('Не удалось удалить новость');
      }
    }
  };

  // Функция изменения статуса заказа
  const handleChangeOrderStatus = async (orderId, newStatus) => {
    try {
      await requestsApi.update(orderId, { status: newStatus });
      // Обновляем статус заказа в списке
      setAllOrders(allOrders.map(order => 
        order.request_id === orderId 
          ? {...order, status: newStatus} 
          : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Не удалось обновить статус заказа');
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Получение класса для бейджа статуса
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'заявка создана':
        return 'bg-info';
      case 'заявка обрабатывается':
        return 'bg-warning';
      case 'заявка получена':
        return 'bg-primary';
      case 'заявка выполнена':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  if (!currentUser || !currentUser.is_admin) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        У вас нет доступа к панели администратора.
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Панель администратора</h2>
      </div>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="publications" title="Публикации">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="h5 mb-0">Все публикации о продаже техники</h3>
              <div>
                <Link to="/profile/create-vehicle" className="btn btn-light btn-sm ms-2">
                  Добавить технику
                </Link>
              </div>
            </div>
            <div className="card-body">
              {vehiclesError && (
                <div className="alert alert-danger" role="alert">
                  {vehiclesError}
                </div>
              )}
              
              {loadingVehicles ? (
                <div className="d-flex justify-content-center my-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </div>
                </div>
              ) : allVehicles.length === 0 ? (
                <div className="alert alert-info">
                  Публикаций о продаже техники пока нет.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>Год</th>
                        <th>Пользователь</th>
                        <th>Дата публикации</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allVehicles.map(vehicle => (
                        <tr key={vehicle.vehicle_id}>
                          <td>{vehicle.vehicle_id}</td>
                          <td>{vehicle.title}</td>
                          <td>{vehicle.category?.name || '-'}</td>
                          <td>{vehicle.year}</td>
                          <td>{vehicle.user_id}</td>
                          <td>{formatDate(vehicle.publication_date)}</td>
                          <td>
                            <div className="btn-group">
                              <Link 
                                to={`/catalog/${vehicle.vehicle_id}`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                Просмотр
                              </Link>
                              <Link 
                                to={`/profile/edit-vehicle/${vehicle.vehicle_id}`} 
                                className="btn btn-sm btn-outline-secondary"
                              >
                                Редактировать
                              </Link>
                              <button
                                className="btn btn-sm btn-outline-success me-2"
                                onClick={() => handleUpdatePublicationDate(vehicle.vehicle_id)}
                              >
                                Актуализировать
                              </button>
                              <button 
                                onClick={() => handleDeleteVehicle(vehicle.vehicle_id)} 
                                className="btn btn-sm btn-outline-danger"
                              >
                                Удалить
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Tab>
        
        <Tab eventKey="orders" title="Заказы">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h3 className="h5 mb-0">Все заказы</h3>
            </div>
            <div className="card-body">
              {ordersError && (
                <div className="alert alert-danger" role="alert">
                  {ordersError}
                </div>
              )}
              
              {loadingOrders ? (
                <div className="d-flex justify-content-center my-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </div>
                </div>
              ) : allOrders.length === 0 ? (
                <div className="alert alert-info">
                  Заказов пока нет.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Дата</th>
                        <th>Клиент</th>
                        <th>Статус</th>
                        <th>Доставка</th>
                        <th>Оплата</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.map(order => (
                        <tr key={order.request_id}>
                          <td>{order.request_id}</td>
                          <td>{formatDate(order.request_date)}</td>
                          <td>{order.full_name}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{order.delivery_type}</td>
                          <td>{order.payment_method}</td>
                          <td>
                            <div className="btn-group">
                              <Link 
                                to={`/order/${order.request_id}`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                Детали
                              </Link>
                              <div className="dropdown">
                                <button 
                                  className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                  type="button"
                                  data-bs-toggle="dropdown"
                                >
                                  Изменить статус
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleChangeOrderStatus(order.request_id, 'заявка создана')}
                                    >
                                      Заявка создана
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleChangeOrderStatus(order.request_id, 'заявка обрабатывается')}
                                    >
                                      Заявка обрабатывается
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleChangeOrderStatus(order.request_id, 'заявка получена')}
                                    >
                                      Заявка получена
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleChangeOrderStatus(order.request_id, 'заявка выполнена')}
                                    >
                                      Заявка выполнена
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Tab>
        
        <Tab eventKey="news" title="Новости">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="h5 mb-0">Управление новостями</h3>
              <Link to="/admin/create-news" className="btn btn-sm btn-light">
                Создать новость
              </Link>
            </div>
            <div className="card-body">
              {newsError && (
                <div className="alert alert-danger" role="alert">
                  {newsError}
                </div>
              )}
              
              {loadingNews ? (
                <div className="d-flex justify-content-center my-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </div>
                </div>
              ) : allNews.length === 0 ? (
                <div className="alert alert-info">
                  Новостей пока нет.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Заголовок</th>
                        <th>Дата публикации</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allNews.map(newsItem => (
                        <tr key={newsItem.news_id}>
                          <td>{newsItem.news_id}</td>
                          <td>{newsItem.title}</td>
                          <td>{formatDate(newsItem.publication_date)}</td>
                          <td>
                            <div className="btn-group">
                              <Link 
                                to={`/news/${newsItem.news_id}`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                Просмотр
                              </Link>
                              <Link 
                                to={`/admin/edit-news/${newsItem.news_id}`} 
                                className="btn btn-sm btn-outline-secondary"
                              >
                                Редактировать
                              </Link>
                              <button 
                                onClick={() => handleDeleteNews(newsItem.news_id)} 
                                className="btn btn-sm btn-outline-danger"
                              >
                                Удалить
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage; 

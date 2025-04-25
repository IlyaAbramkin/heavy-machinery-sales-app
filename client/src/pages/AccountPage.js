import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { requestsApi, vehiclesApi } from '../api/api';

const AccountPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояние для хранения автомобилей пользователя
  const [userVehicles, setUserVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Получение заказов пользователя
        const requestsResponse = await requestsApi.getUserRequests();
        setUserRequests(requestsResponse.data);
        
        // Получение транспортных средств пользователя
        const vehiclesResponse = await vehiclesApi.getUserVehicles();
        setUserVehicles(vehiclesResponse.data);
        
        setLoading(false);
        setLoadingVehicles(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Ошибка при загрузке данных');
        setVehiclesError('Не удалось загрузить ваши автомобили');
        setLoading(false);
        setLoadingVehicles(false);
      }
    };

    fetchUserData();
  }, []);
  
  // Функция удаления автомобиля
  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту технику?')) {
      try {
        await vehiclesApi.delete(id);
        // Обновляем список после удаления
        setUserVehicles(userVehicles.filter(vehicle => vehicle.vehicle_id !== id));
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        alert('Не удалось удалить технику');
      }
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  if (loading && loadingVehicles) {
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

  if (!currentUser) {
    return (
      <div className="alert alert-warning my-4" role="alert">
        Необходимо войти в систему для доступа к личному кабинету.
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h2>Личный кабинет</h2>
      <div className="row">
        {/* Профиль пользователя */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h3 className="h5 mb-0">Информация о пользователе</h3>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <div className="avatar-placeholder rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3">
                  <span className="h1 text-muted">{currentUser.name ? currentUser.name.charAt(0) : 'U'}</span>
                </div>
                <h4>{currentUser.name || 'Пользователь'}</h4>
                <p className="text-muted">{currentUser.email}</p>
              </div>
              
              <div className="d-grid gap-2">
                <Link to="/profile" className="btn btn-outline-primary">
                  Редактировать профиль
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Заказы пользователя */}
        <div className="col-md-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="h5 mb-0">Мои заказы</h3>
              <Link to="/cart" className="btn btn-sm btn-light">
                Оформить новый заказ
              </Link>
            </div>
            <div className="card-body">
              {userRequests.length === 0 ? (
                <div className="alert alert-info">
                  У вас пока нет заказов. <Link to="/catalog">Перейти в каталог</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>№ заказа</th>
                        <th>Дата</th>
                        <th>Статус</th>
                        <th>Доставка</th>
                        <th>Оплата</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userRequests.map((request) => (
                        <tr key={request.request_id}>
                          <td>{request.request_id}</td>
                          <td>{formatDate(request.request_date)}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td>{request.delivery_type}</td>
                          <td>{request.payment_method}</td>
                          <td>
                            <Link 
                              to={`/order/${request.request_id}`} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              Детали
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Техника на продаже */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="h5 mb-0">Моя техника на продаже</h3>
              <Link to="/profile/create-vehicle" className="btn btn-sm btn-light">
                Создать публикацию
              </Link>
            </div>
            <div className="card-body">
              {vehiclesError && (
                <div className="alert alert-danger" role="alert">
                  {vehiclesError}
                </div>
              )}
              
              {loadingVehicles ? (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : userVehicles.length === 0 ? (
                <div className="alert alert-info">
                  У вас пока нет техники на продаже. Нажмите "Создать публикацию", чтобы добавить.
                </div>
              ) : (
                <div className="row">
                  {userVehicles.map(vehicle => (
                    <div key={vehicle.vehicle_id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">{vehicle.title}</h5>
                          <p className="card-text text-muted">Год: {vehicle.year}</p>
                          <p className="card-text text-muted">Цвет: {vehicle.color}</p>
                          {vehicle.description && (
                            <p className="card-text small">{vehicle.description.substring(0, 100)}...</p>
                          )}
                        </div>
                        <div className="card-footer bg-white d-flex justify-content-between">
                          <Link 
                            to={`/profile/edit-vehicle/${vehicle.vehicle_id}`} 
                            className="btn btn-sm btn-outline-primary"
                          >
                            Редактировать
                          </Link>
                          <button 
                            onClick={() => handleDeleteVehicle(vehicle.vehicle_id)} 
                            className="btn btn-sm btn-outline-danger"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage; 
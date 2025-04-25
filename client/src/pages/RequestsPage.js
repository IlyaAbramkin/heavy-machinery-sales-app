import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestsApi, vehiclesApi } from '../api/api';
import AuthContext from '../context/AuthContext';

const RequestsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [vehicles, setVehicles] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    full_name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    city: '',
    payment_method: 'банковская карта',
    delivery_type: 'доставка',
    message: '',
    vehicles: []
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получение списка техники для формы
        const vehiclesResponse = await vehiclesApi.getAll();
        setVehicles(vehiclesResponse.data);
        
        // Получение заявок пользователя с помощью нового эндпоинта
        const requestsResponse = await requestsApi.getUserRequests();
        setUserRequests(requestsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка при загрузке данных');
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleVehicleChange = (e) => {
    const { value, checked } = e.target;
    const vehicleId = parseInt(value);
    
    if (checked) {
      // Добавить технику в массив с количеством 1
      setFormData({
        ...formData,
        vehicles: [...formData.vehicles, { vehicle_id: vehicleId, quantity: 1 }]
      });
    } else {
      // Удалить технику из массива
      setFormData({
        ...formData,
        vehicles: formData.vehicles.filter(v => v.vehicle_id !== vehicleId)
      });
    }
  };

  const handleQuantityChange = (vehicleId, quantity) => {
    setFormData({
      ...formData,
      vehicles: formData.vehicles.map(v => 
        v.vehicle_id === vehicleId ? { ...v, quantity: parseInt(quantity) } : v
      )
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name) errors.full_name = 'Укажите ФИО';
    if (!formData.email) errors.email = 'Укажите email';
    if (!formData.phone) errors.phone = 'Укажите телефон';
    if (!formData.city) errors.city = 'Укажите город';
    if (formData.vehicles.length === 0) errors.vehicles = 'Выберите хотя бы одну технику';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (validateForm()) {
      try {
        // Подготовка данных заказа
        const orderData = {
          ...formData,
          session_id: Math.floor(Math.random() * 1000000), // Симуляция ID сессии
          request_date: new Date().toISOString(),
          status: 'заявка создана',
          tovary_v_zayavke: formData.vehicles.map(v => {
            // Найдем информацию о выбранном автомобиле
            const vehicle = vehicles.find(veh => veh.vehicle_id === v.vehicle_id);
            return {
              vehicle_id: v.vehicle_id,
              quantity: v.quantity,
              name: vehicle ? vehicle.title : `Техника #${v.vehicle_id}`,
              price: 0 // Можно добавить цену, если она есть
            };
          })
        };
        
        // Отправляем запрос, используя новый эндпоинт
        await requestsApi.createOrder(orderData);
        
        // Сбрасываем форму и показываем сообщение
        setFormData({
          company_name: '',
          full_name: currentUser?.name || '',
          email: currentUser?.email || '',
          phone: '',
          city: '',
          payment_method: 'банковская карта',
          delivery_type: 'доставка',
          message: '',
          vehicles: []
        });
        
        setSuccessMessage('Заявка успешно отправлена');
        
        // Обновляем заявку пользователя
        const requestsResponse = await requestsApi.getUserRequests();
        setUserRequests(requestsResponse.data);
      } catch (err) {
        console.error('Error creating request:', err);
        setError('Ошибка при создании заявки');
      }
    }
  };

  const refreshRequests = async () => {
    try {
      setLoading(true);
      const requestsResponse = await requestsApi.getUserRequests();
      setUserRequests(requestsResponse.data);
    } catch (error) {
      console.error('Error refreshing requests:', error);
      setError('Could not refresh requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <h2>Заявки на технику</h2>
      </div>

      {/* Заявки пользователя */}
      {userRequests.length > 0 && (
        <div className="col-12 mb-5">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">Ваши заявки</h3>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>№ заявки</th>
                      <th>Дата</th>
                      <th>Статус</th>
                      <th>Тип доставки</th>
                      <th>Способ оплаты</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRequests.map((request) => (
                      <tr key={request.request_id}>
                        <td>{request.request_id}</td>
                        <td>{new Date(request.request_date).toLocaleDateString()}</td>
                        <td>{request.status}</td>
                        <td>{request.delivery_type}</td>
                        <td>{request.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Форма для новой заявки */}
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h3 className="card-title mb-0">Создать новую заявку</h3>
          </div>
          <div className="card-body">
            {successMessage && (
              <div className="alert alert-success" role="alert">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
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
                
                <div className="col-md-6 mb-3">
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
                
                <div className="col-md-6 mb-3">
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
                
                <div className="col-md-6 mb-3">
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
                
                <div className="col-md-4 mb-3">
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
                
                <div className="col-md-4 mb-3">
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
                
                <div className="col-md-4 mb-3">
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
                
                <div className="col-12 mb-3">
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
                
                <div className="col-12 mb-4">
                  <label className="form-label">Выберите технику</label>
                  {formErrors.vehicles && (
                    <div className="text-danger mb-2">{formErrors.vehicles}</div>
                  )}
                  
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}></th>
                          <th>Название</th>
                          <th>Категория</th>
                          <th style={{ width: '120px' }}>Количество</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((vehicle) => {
                          const selectedVehicle = formData.vehicles.find(
                            v => v.vehicle_id === vehicle.vehicle_id
                          );
                          const isChecked = !!selectedVehicle;
                          
                          return (
                            <tr key={vehicle.vehicle_id}>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  value={vehicle.vehicle_id}
                                  checked={isChecked}
                                  onChange={handleVehicleChange}
                                />
                              </td>
                              <td>{vehicle.title}</td>
                              <td>{vehicle.category?.name || 'Нет категории'}</td>
                              <td>
                                {isChecked && (
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    min="1"
                                    value={selectedVehicle.quantity}
                                    onChange={(e) => handleQuantityChange(
                                      vehicle.vehicle_id, 
                                      e.target.value
                                    )}
                                  />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg">
                      Отправить заявку
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage; 
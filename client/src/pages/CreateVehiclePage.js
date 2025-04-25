import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  categoriesApi, 
  enginesApi, 
  chassisApi, 
  wheelFormulasApi,
  factoriesApi,
  vehiclesApi
} from '../api/api';
import '../styles/CreateVehiclePage.css';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const CreateVehiclePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  // Состояние для формы
  const [vehicleData, setVehicleData] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    color: '',
    category_id: '',
    engine_id: '',
    chassis_id: '',
    wheel_formula_id: '',
    factory_id: '',
    price: '',
    delivery_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 дней от текущей даты
  });

  // Состояние для справочников
  const [categories, setCategories] = useState([]);
  const [engines, setEngines] = useState([]);
  const [chassis, setChassis] = useState([]);
  const [wheelFormulas, setWheelFormulas] = useState([]);
  const [factories, setFactories] = useState([]);
  
  // Состояние для ошибок и загрузки
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Загрузка справочников
  useEffect(() => {
    const fetchReferenceLists = async () => {
      try {
        setIsLoading(true);
        const [
          categoriesRes, 
          enginesRes, 
          chassisRes, 
          wheelFormulasRes, 
          factoriesRes
        ] = await Promise.all([
          categoriesApi.getAll(),
          enginesApi.getAll(),
          chassisApi.getAll(),
          wheelFormulasApi.getAll(),
          factoriesApi.getAll()
        ]);

        setCategories(categoriesRes.data);
        setEngines(enginesRes.data);
        setChassis(chassisRes.data);
        setWheelFormulas(wheelFormulasRes.data);
        setFactories(factoriesRes.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reference data:', err);
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferenceLists();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData({
      ...vehicleData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Создаем URL для предпросмотра изображения
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!vehicleData.title) errors.title = 'Название техники обязательно';
    if (!vehicleData.year) errors.year = 'Год выпуска обязателен';
    if (!vehicleData.color) errors.color = 'Цвет обязателен';
    if (!vehicleData.category_id) errors.category_id = 'Выберите категорию';
    if (!vehicleData.price) errors.price = 'Укажите цену';
    if (!vehicleData.delivery_time) errors.delivery_time = 'Укажите срок поставки';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        // Проверка, авторизован ли пользователь
        if (!currentUser) {
          throw new Error('Вы должны войти в систему, чтобы добавить автомобиль');
        }
        
        console.log('Current user:', currentUser);
        
        // Получаем ID пользователя из объекта пользователя
        const userId = currentUser.user_id || currentUser.id;
        
        // Проверяем, есть ли ID пользователя
        if (!userId) {
          console.error('ID пользователя не найден в объекте', currentUser);
          throw new Error('Не удалось определить ID пользователя. Пожалуйста, перезайдите в систему.');
        }
        
        // Создание объекта данных о транспортном средстве
        const vehiclePayload = {
          title: vehicleData.title,
          description: vehicleData.description || "",
          year: parseInt(vehicleData.year),
          color: vehicleData.color,
          category_id: vehicleData.category_id ? parseInt(vehicleData.category_id) : null,
          engine_id: vehicleData.engine_id ? parseInt(vehicleData.engine_id) : null,
          chassis_id: vehicleData.chassis_id ? parseInt(vehicleData.chassis_id) : null,
          wheel_formula_id: vehicleData.wheel_formula_id ? parseInt(vehicleData.wheel_formula_id) : null,
          factory_id: vehicleData.factory_id ? parseInt(vehicleData.factory_id) : null,
          user_id: userId
        };
        
        console.log('Отправляемые данные:', vehiclePayload);
        
        // Подготовка URL параметров для цены и даты поставки
        const queryParams = new URLSearchParams();
        if (vehicleData.price) {
          queryParams.append('price', parseFloat(vehicleData.price));
        }
        if (vehicleData.delivery_time) {
          queryParams.append('delivery_time', new Date(vehicleData.delivery_time).toISOString());
        }
        
        // Отправка данных на сервер
        const response = await axios.post(
          `/vehicles/?${queryParams.toString()}`, 
          vehiclePayload,
          { withCredentials: true }
        );
        
        console.log('Ответ сервера:', response);
        
        // Если есть выбранное изображение, загружаем его
        if (selectedImage && response.data && response.data.vehicle_id) {
          const vehicleId = response.data.vehicle_id;
          const formData = new FormData();
          formData.append('file', selectedImage);
          
          try {
            await axios.post(
              `/images/vehicles/${vehicleId}`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
              }
            );
          } catch (imageError) {
            console.error('Error uploading image:', imageError);
            // Продолжаем выполнение даже если загрузка изображения не удалась
          }
        }
        
        // Перенаправление на страницу личного кабинета
        navigate('/account', { state: { success: 'Техника успешно добавлена на продажу' } });
      } catch (err) {
        console.error('Error creating vehicle:', err);
        
        // Показать полный ответ сервера для отладки
        if (err.response) {
          console.error('Server response:', err.response);
          console.error('Response data:', err.response.data);
        }
        
        // Преобразуем объект ошибки в строку
        let errorMessage = 'Ошибка при создании публикации';
        if (err.response?.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (Array.isArray(err.response.data) && err.response.data.length > 0) {
            // Обработка массива ошибок
            errorMessage = err.response.data.map(error => 
              `${error.msg} в поле ${error.loc[1]}`
            ).join(', ');
          } else if (err.response.data.detail) {
            errorMessage = typeof err.response.data.detail === 'string' 
              ? err.response.data.detail 
              : JSON.stringify(err.response.data.detail);
          } else {
            errorMessage = JSON.stringify(err.response.data);
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <h2>Создание публикации о продаже техники</h2>
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => navigate('/account')}
          >
            Назад в личный кабинет
          </button>
        </div>
      </div>

      {error && (
        <div className="col-12 mb-4">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      )}

      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Основная информация */}
                <div className="col-md-6">
                  <h4 className="mb-3">Основная информация</h4>
                  
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Название техники *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                      id="title"
                      name="title"
                      value={vehicleData.title}
                      onChange={handleChange}
                      placeholder="Например: КАМАЗ 6522"
                    />
                    {formErrors.title && (
                      <div className="invalid-feedback">{typeof formErrors.title === 'string' ? formErrors.title : 'Необходимо заполнить поле'}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Описание</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="4"
                      value={vehicleData.description}
                      onChange={handleChange}
                      placeholder="Подробное описание транспортного средства"
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="image" className="form-label">Изображение техники</label>
                    <input
                      type="file"
                      className="form-control"
                      id="image"
                      accept="image/jpeg,image/png,image/svg+xml"
                      onChange={handleImageChange}
                    />
                    <small className="form-text text-muted">
                      Допустимые форматы: JPG, JPEG, PNG, SVG. Максимальный размер: 5MB
                    </small>
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="Предпросмотр" 
                          style={{ maxHeight: '200px', maxWidth: '100%' }} 
                          className="img-thumbnail"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="year" className="form-label">Год выпуска *</label>
                      <input
                        type="number"
                        className={`form-control ${formErrors.year ? 'is-invalid' : ''}`}
                        id="year"
                        name="year"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={vehicleData.year}
                        onChange={handleChange}
                      />
                      {formErrors.year && (
                        <div className="invalid-feedback">{typeof formErrors.year === 'string' ? formErrors.year : 'Необходимо заполнить поле'}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="color" className="form-label">Цвет *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.color ? 'is-invalid' : ''}`}
                        id="color"
                        name="color"
                        value={vehicleData.color}
                        onChange={handleChange}
                        placeholder="Например: Белый"
                      />
                      {formErrors.color && (
                        <div className="invalid-feedback">{typeof formErrors.color === 'string' ? formErrors.color : 'Необходимо заполнить поле'}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Технические характеристики */}
                <div className="col-md-6">
                  <h4 className="mb-3">Технические характеристики</h4>
                  
                  <div className="mb-3">
                    <label htmlFor="category_id" className="form-label">Категория *</label>
                    <select
                      className={`form-select ${formErrors.category_id ? 'is-invalid' : ''}`}
                      id="category_id"
                      name="category_id"
                      value={vehicleData.category_id}
                      onChange={handleChange}
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map(category => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.category_id && (
                      <div className="invalid-feedback">{typeof formErrors.category_id === 'string' ? formErrors.category_id : 'Необходимо выбрать категорию'}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="engine_id" className="form-label">Двигатель</label>
                    <select
                      className="form-select"
                      id="engine_id"
                      name="engine_id"
                      value={vehicleData.engine_id}
                      onChange={handleChange}
                    >
                      <option value="">Выберите двигатель</option>
                      {engines.map(engine => (
                        <option key={engine.engine_id} value={engine.engine_id}>
                          {engine.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="chassis_id" className="form-label">Шасси</label>
                    <select
                      className="form-select"
                      id="chassis_id"
                      name="chassis_id"
                      value={vehicleData.chassis_id}
                      onChange={handleChange}
                    >
                      <option value="">Выберите шасси</option>
                      {chassis.map(ch => (
                        <option key={ch.chassis_id} value={ch.chassis_id}>
                          {ch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="wheel_formula_id" className="form-label">Колесная формула</label>
                    <select
                      className="form-select"
                      id="wheel_formula_id"
                      name="wheel_formula_id"
                      value={vehicleData.wheel_formula_id}
                      onChange={handleChange}
                    >
                      <option value="">Выберите колесную формулу</option>
                      {wheelFormulas.map(formula => (
                        <option key={formula.wheel_formula_id} value={formula.wheel_formula_id}>
                          {formula.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="factory_id" className="form-label">Производитель</label>
                    <select
                      className="form-select"
                      id="factory_id"
                      name="factory_id"
                      value={vehicleData.factory_id}
                      onChange={handleChange}
                    >
                      <option value="">Выберите производителя</option>
                      {factories.map(factory => (
                        <option key={factory.factory_id} value={factory.factory_id}>
                          {factory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Ценовая информация */}
                <div className="col-12">
                  <hr className="my-4" />
                  <h4 className="mb-3">Цена и доставка</h4>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="price" className="form-label">Цена (₽) *</label>
                      <input
                        type="number"
                        className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
                        id="price"
                        name="price"
                        min="0"
                        step="1000"
                        value={vehicleData.price}
                        onChange={handleChange}
                        placeholder="Укажите цену в рублях"
                      />
                      {formErrors.price && (
                        <div className="invalid-feedback">{typeof formErrors.price === 'string' ? formErrors.price : 'Необходимо указать цену'}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="delivery_time" className="form-label">Срок поставки *</label>
                      <input
                        type="date"
                        className={`form-control ${formErrors.delivery_time ? 'is-invalid' : ''}`}
                        id="delivery_time"
                        name="delivery_time"
                        value={vehicleData.delivery_time}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {formErrors.delivery_time && (
                        <div className="invalid-feedback">{typeof formErrors.delivery_time === 'string' ? formErrors.delivery_time : 'Необходимо указать срок поставки'}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-12 mt-4">
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-md-2"
                      onClick={() => navigate('/profile')}
                      disabled={isSubmitting}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Публикация...
                        </>
                      ) : 'Опубликовать'}
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

export default CreateVehiclePage; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  vehiclesApi, 
  categoriesApi, 
  enginesApi, 
  chassisApi, 
  wheelFormulasApi,
  factoriesApi,
  priceListsApi,
  imagesApi
} from '../api/api';
import axios from 'axios';

const EditVehiclePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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
    delivery_time: new Date().toISOString().split('T')[0],
    is_active: true,
    image_path: ''
  });

  // Состояние для файла изображения
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [imageError, setImageError] = useState('');

  // Состояние для прайс-листа
  const [priceListId, setPriceListId] = useState(null);

  // Состояние для справочников
  const [categories, setCategories] = useState([]);
  const [engines, setEngines] = useState([]);
  const [chassis, setChassis] = useState([]);
  const [wheelFormulas, setWheelFormulas] = useState([]);
  const [factories, setFactories] = useState([]);
  
  // Состояние для ошибок и загрузки
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка данных автомобиля и справочников
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Загрузка справочников
        const [
          categoriesRes, 
          enginesRes, 
          chassisRes, 
          wheelFormulasRes, 
          factoriesRes,
          vehicleRes,
          priceListRes
        ] = await Promise.all([
          categoriesApi.getAll(),
          enginesApi.getAll(),
          chassisApi.getAll(),
          wheelFormulasApi.getAll(),
          factoriesApi.getAll(),
          vehiclesApi.getById(id),
          priceListsApi.getAll() // Загружаем все прайс-листы (оптимальнее было бы загружать только для конкретного транспортного средства)
        ]);

        // Сохраняем справочники
        setCategories(categoriesRes.data);
        setEngines(enginesRes.data);
        setChassis(chassisRes.data);
        setWheelFormulas(wheelFormulasRes.data);
        setFactories(factoriesRes.data);
        
        // Преобразуем данные автомобиля
        const vehicleFromApi = vehicleRes.data;
        
        // Найдем прайс-лист для этого транспортного средства
        const priceLists = priceListRes.data;
        const vehiclePriceList = priceLists.find(pl => pl.vehicle_id === parseInt(id));
        
        if (vehiclePriceList) {
          setPriceListId(vehiclePriceList.price_id);
        }
        
        setVehicleData({
          title: vehicleFromApi.title || '',
          description: vehicleFromApi.description || '',
          year: vehicleFromApi.year || new Date().getFullYear(),
          color: vehicleFromApi.color || '',
          category_id: vehicleFromApi.category_id || '',
          engine_id: vehicleFromApi.engine_id || '',
          chassis_id: vehicleFromApi.chassis_id || '',
          wheel_formula_id: vehicleFromApi.wheel_formula_id || '',
          factory_id: vehicleFromApi.factory_id || '',
          price: vehiclePriceList ? vehiclePriceList.price : '',
          delivery_time: vehiclePriceList 
            ? new Date(vehiclePriceList.delivery_time).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0],
          is_active: vehicleFromApi.is_active !== undefined ? vehicleFromApi.is_active : true,
          image_path: vehicleFromApi.image_path || ''
        });
        
        // Устанавливаем превью изображения, если оно есть
        if (vehicleFromApi.image_path) {
          setPreviewImage(`http://localhost:8000${vehicleFromApi.image_path}`);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVehicleData({
      ...vehicleData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Обработчик выбора файла изображения
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка типа файла
      const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setImageError('Пожалуйста, выберите изображение в формате JPG, PNG или SVG');
        setSelectedFile(null);
        setPreviewImage('');
        return;
      }

      // Проверка размера файла (не более 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Размер файла не должен превышать 5MB');
        setSelectedFile(null);
        setPreviewImage('');
        return;
      }

      setSelectedFile(file);
      setImageError('');
      
      // Создание превью изображения
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Удаление текущего изображения
  const handleDeleteImage = async () => {
    try {
      if (vehicleData.image_path) {
        await imagesApi.deleteVehicleImage(id);
        setVehicleData({
          ...vehicleData,
          image_path: ''
        });
        setPreviewImage('');
        setSelectedFile(null);
      } else {
        setPreviewImage('');
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Ошибка при удалении изображения');
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
        
        // Формируем данные для отправки
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
        };
        
        // Подготовка URL параметров для цены и даты поставки
        const queryParams = new URLSearchParams();
        if (vehicleData.price) {
          queryParams.append('price', parseFloat(vehicleData.price));
        }
        if (vehicleData.delivery_time) {
          queryParams.append('delivery_time', new Date(vehicleData.delivery_time).toISOString());
        }
        
        // Отправляем данные на сервер с параметрами в URL
        await axios.put(
          `/vehicles/${id}?${queryParams.toString()}`, 
          vehiclePayload,
          { withCredentials: true }
        );
        
        // Загрузка изображения, если оно выбрано
        if (selectedFile) {
          const formData = new FormData();
          formData.append('file', selectedFile);
          await imagesApi.uploadVehicleImage(id, formData);
        }
        
        // Переходим обратно в личный кабинет
        navigate('/account', { state: { success: 'Техника успешно обновлена' } });
      } catch (err) {
        console.error('Error updating vehicle:', err);
        setError(err.response?.data?.detail || 'Ошибка при обновлении публикации');
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
          <h2>Редактирование публикации о продаже техники</h2>
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
                  
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="is_active"
                      name="is_active"
                      checked={vehicleData.is_active}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      Публикация активна
                    </label>
                  </div>
                  
                  {/* Блок для загрузки изображения */}
                  <div className="mb-4">
                    <label className="form-label">Изображение техники</label>
                    
                    <div className="d-flex align-items-center mb-2">
                      {previewImage ? (
                        <div className="position-relative">
                          <img 
                            src={previewImage} 
                            alt="Превью" 
                            className="rounded border"
                            style={{ maxWidth: '200px', maxHeight: '150px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                            onClick={handleDeleteImage}
                          >
                            <i className="bi bi-x"></i>
                            Удалить
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="bg-light d-flex align-items-center justify-content-center rounded border"
                          style={{width: '200px', height: '150px'}}
                        >
                          <span className="text-muted">Нет изображения</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <input
                        type="file"
                        className={`form-control ${imageError ? 'is-invalid' : ''}`}
                        id="vehicle-image"
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={handleFileChange}
                      />
                      {imageError && (
                        <div className="invalid-feedback">{imageError}</div>
                      )}
                      <div className="form-text">
                        Поддерживаемые форматы: JPG, PNG, SVG. Максимальный размер: 5MB
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Название техники *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                      id="title"
                      name="title"
                      value={vehicleData.title}
                      onChange={handleChange}
                      placeholder="Например: КАМАЗ 65115 Самосвал"
                    />
                    {formErrors.title && (
                      <div className="invalid-feedback">{formErrors.title}</div>
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
                      placeholder="Подробное описание техники, особенности и преимущества"
                    ></textarea>
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
                        <div className="invalid-feedback">{formErrors.year}</div>
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
                        <div className="invalid-feedback">{formErrors.color}</div>
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
                      <div className="invalid-feedback">{formErrors.category_id}</div>
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
                        <div className="invalid-feedback">{formErrors.price}</div>
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
                        <div className="invalid-feedback">{formErrors.delivery_time}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-12 mt-4">
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-md-2"
                      onClick={() => navigate('/account')}
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
                          Сохранение...
                        </>
                      ) : 'Сохранить изменения'}
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

export default EditVehiclePage; 
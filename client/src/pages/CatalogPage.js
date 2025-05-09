import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { vehiclesApi, categoriesApi } from '../api/api';
import { useCart } from '../context/CartContext';
import AddToCartModal from '../components/cart/AddToCartModal';
import axios from 'axios';

const CatalogPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: ''
  });
  
  // Состояние для корзины и модального окна
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получение всех категорий для фильтров
        const categoriesResponse = await categoriesApi.getAll();
        setCategories(categoriesResponse.data);
        
        // Получение транспортных средств с опциональным фильтром категории
        const params = {};
        if (filters.category) {
          params.category_id = filters.category;
        }
        const vehiclesResponse = await vehiclesApi.getAll(params);
        setVehicles(vehiclesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка при загрузке данных');
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.category]);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFilters({ ...filters, category: categoryId });
    setSearchParams(categoryId ? { category: categoryId } : {});
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };
  
  const handleAddToCart = async (vehicle) => {
    try {
      // Получаем цену товара из прайс-листа
      const priceResponse = await axios.get(`/price-list/vehicle/${vehicle.vehicle_id}`);
      
      // Определяем цену из ответа API или устанавливаем 0, если цены нет
      const price = priceResponse.data && priceResponse.data.length > 0 
        ? priceResponse.data[0].price 
        : 0;
      
      // Создаем объект товара для корзины
      const cartItem = {
        id: vehicle.vehicle_id,
        name: vehicle.title,
        price: price,
        imageUrl: vehicle.image_url || null,
        vehicleDetails: {
          year: vehicle.year,
          color: vehicle.color,
          category: vehicle.category?.name,
          factory: vehicle.factory?.name
        }
      };
      
      // Добавляем товар в корзину
      addToCart(cartItem);
      setSelectedVehicle({...vehicle, price: price});
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching price:', err);
      // Если не удалось получить цену, добавляем товар с ценой 0
      const cartItem = {
        id: vehicle.vehicle_id,
        name: vehicle.title,
        price: 0,
        imageUrl: vehicle.image_url || null,
        vehicleDetails: {
          year: vehicle.year,
          color: vehicle.color,
          category: vehicle.category?.name,
          factory: vehicle.factory?.name
        }
      };
      
      addToCart(cartItem);
      setSelectedVehicle(vehicle);
      setShowModal(true);
    }
  };

  // Фильтрация транспорта
  const filteredVehicles = vehicles.filter(vehicle => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      vehicle.title.toLowerCase().includes(searchLower) ||
      (vehicle.description && vehicle.description.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-5" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="row">
      {/* Фильтр сайдбар */}
      <div className="col-md-3 mb-4">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title mb-4">Фильтры</h4>
            
            <div className="mb-4">
              <label htmlFor="searchInput" className="form-label">Поиск</label>
              <input
                type="text"
                className="form-control"
                id="searchInput"
                placeholder="Введите название..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="categorySelect" className="form-label">Категория</label>
              <select
                className="form-select"
                id="categorySelect"
                value={filters.category}
                onChange={handleCategoryChange}
              >
                <option value="">Все категории</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Список техники */}
      <div className="col-md-9">
        <h2 className="mb-4">Каталог техники</h2>
        
        {filteredVehicles.length === 0 ? (
          <div className="alert alert-info">
            По заданным критериям техника не найдена.
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.vehicle_id} className="col">
                <div className="card h-100 product-card">
                  <div 
                    className="bg-light d-flex align-items-center justify-content-center" 
                    style={{height: '200px'}}
                  >
                    <img 
                      src={vehicle.image_path ? `http://localhost:8000${vehicle.image_path}` : "/images/placeholders/vehicle.svg"} 
                      alt={vehicle.title}
                      className="img-fluid"
                      style={{maxHeight: '180px'}}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{vehicle.title}</h5>
                    <p className="card-text">
                      {vehicle.description 
                        ? vehicle.description.substring(0, 100) + '...' 
                        : 'Нет описания'}
                    </p>
                    <ul className="list-unstyled mb-3">
                      <li><strong>Опубликовано:</strong> {new Date(vehicle.publication_date).toLocaleDateString()}</li>
                      <li><strong>Цвет:</strong> {vehicle.color}</li>
                      {vehicle.category && (
                        <li><strong>Категория:</strong> {vehicle.category.name}</li>
                      )}
                    </ul>
                    
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-success"
                        onClick={() => handleAddToCart(vehicle)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-plus me-2" viewBox="0 0 16 16">
                          <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z"/>
                          <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                        </svg>
                        Купить
                      </button>
                      <Link 
                        to={`/catalog/${vehicle.vehicle_id}`} 
                        className="btn btn-outline-primary"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Модальное окно добавления в корзину */}
      <AddToCartModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        vehicle={selectedVehicle} 
      />
    </div>
  );
};

export default CatalogPage; 

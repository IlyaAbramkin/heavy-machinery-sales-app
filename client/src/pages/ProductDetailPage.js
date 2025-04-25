import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehiclesApi, priceListsApi, categoriesApi, enginesApi, chassisApi, wheelFormulasApi, factoriesApi } from '../api/api';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AddToCartModal from '../components/cart/AddToCartModal';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [priceLists, setPriceLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // Дополнительные данные для характеристик
  const [category, setCategory] = useState(null);
  const [engine, setEngine] = useState(null);
  const [chassis, setChassis] = useState(null);
  const [wheelFormula, setWheelFormula] = useState(null);
  const [factory, setFactory] = useState(null);
  
  // Состояние для модального окна
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получение данных о технике
        const vehicleResponse = await vehiclesApi.getById(id);
        console.log("Vehicle data from server:", vehicleResponse.data);
        const vehicleData = vehicleResponse.data;
        setVehicle(vehicleData);
        
        // Получение прайс-листов для этой техники
        const priceResponse = await priceListsApi.getAll();
        const filteredPrices = priceResponse.data.filter(
          price => price.vehicle_id === parseInt(id)
        );
        setPriceLists(filteredPrices);
        
        // Загрузка дополнительных данных, если они не пришли с сервера
        try {
          if (vehicleData.category_id && !vehicleData.category) {
            const categoryResponse = await categoriesApi.getById(vehicleData.category_id);
            setCategory(categoryResponse.data);
          }
          
          if (vehicleData.engine_id && !vehicleData.engine) {
            const engineResponse = await enginesApi.getById(vehicleData.engine_id);
            setEngine(engineResponse.data);
          }
          
          if (vehicleData.chassis_id && !vehicleData.chassis) {
            const chassisResponse = await chassisApi.getById(vehicleData.chassis_id);
            setChassis(chassisResponse.data);
          }
          
          if (vehicleData.wheel_formula_id && !vehicleData.wheel_formula) {
            const wheelFormulaResponse = await wheelFormulasApi.getById(vehicleData.wheel_formula_id);
            setWheelFormula(wheelFormulaResponse.data);
          }
          
          if (vehicleData.factory_id && !vehicleData.factory) {
            const factoryResponse = await factoriesApi.getById(vehicleData.factory_id);
            setFactory(factoryResponse.data);
          }
        } catch (err) {
          console.error("Error loading additional data:", err);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка при загрузке данных');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Получение названия характеристики с учетом загруженных дополнительных данных
  const getCharacteristicName = (field, id, defaultValue = 'Не указано') => {
    if (!id) return defaultValue;
    
    if (vehicle && vehicle[field] && vehicle[field].name) {
      return vehicle[field].name;
    }
    
    switch (field) {
      case 'category':
        return category ? category.name : 'Загрузка...';
      case 'engine':
        return engine ? engine.name : 'Загрузка...';
      case 'chassis':
        return chassis ? chassis.name : 'Загрузка...';
      case 'wheel_formula':
        return wheelFormula ? wheelFormula.name : 'Загрузка...';
      case 'factory':
        return factory ? factory.name : 'Загрузка...';
      default:
        return defaultValue;
    }
  };

  const handleAddToCart = () => {
    if (vehicle && priceLists.length > 0) {
      // Формируем объект товара для корзины с нужными полями
      const cartItem = {
        id: vehicle.vehicle_id,
        name: vehicle.title,
        price: priceLists[0].price,
        imageUrl: vehicle.image_url || null,
        vehicleDetails: {
          year: vehicle.year,
          color: vehicle.color,
          category: vehicle.category?.name,
          factory: vehicle.factory?.name
        }
      };
      
      addToCart(cartItem);
      setShowModal(true);
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

  if (error) {
    return (
      <div className="alert alert-danger my-5" role="alert">
        {error}
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="alert alert-warning my-5" role="alert">
        Техника не найдена.
      </div>
    );
  }

  return (
    <div className="row my-4">
      <div className="col-md-5 mb-4">
        <div 
          className="bg-light d-flex align-items-center justify-content-center rounded" 
          style={{height: '350px'}}
        >
          <img 
            src={vehicle.image_path ? `http://localhost:8000${vehicle.image_path}` : "/images/placeholders/vehicle.svg"} 
            alt={vehicle.title}
            className="img-fluid"
            style={{maxHeight: '300px'}}
          />
        </div>
      </div>
      
      <div className="col-md-7">
        <h1 className="mb-3">{vehicle.title}</h1>
        
        <div className="mb-4">
          <h5>Описание</h5>
          <p>{vehicle.description || 'Нет описания'}</p>
        </div>
        
        <div className="card mb-4">
          <div className="card-header">
            Характеристики
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item d-flex justify-content-between">
              <span>Год выпуска:</span>
              <strong>{vehicle.year}</strong>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Цвет:</span>
              <strong>{vehicle.color}</strong>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Категория:</span>
              <strong>{getCharacteristicName('category', vehicle.category_id)}</strong>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Производитель:</span>
              <strong>{getCharacteristicName('factory', vehicle.factory_id)}</strong>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Двигатель:</span>
              <strong>{getCharacteristicName('engine', vehicle.engine_id)}</strong>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Шасси:</span>
              <strong>{getCharacteristicName('chassis', vehicle.chassis_id)}</strong>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>Колесная формула:</span>
              <strong>{getCharacteristicName('wheel_formula', vehicle.wheel_formula_id)}</strong>
            </li>
          </ul>
        </div>
        
        {priceLists.length > 0 && (
          <div className="card mb-4">
            <div className="card-header">
              Цены и сроки поставки
            </div>
            <div className="card-body">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Цена</th>
                    <th>Срок поставки</th>
                  </tr>
                </thead>
                <tbody>
                  {priceLists.map((price) => (
                    <tr key={price.price_id}>
                      <td>{price.price.toLocaleString()} ₽</td>
                      <td>{new Date(price.delivery_time).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="d-grid">
          <button 
            className="btn btn-success btn-lg mb-2" 
            onClick={handleAddToCart}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-cart-plus me-2" viewBox="0 0 16 16">
              <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z"/>
              <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
            </svg>
            Купить
          </button>
        </div>
      </div>
      
      {/* Модальное окно добавления в корзину */}
      <AddToCartModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        vehicle={vehicle} 
      />
    </div>
  );
};

export default ProductDetailPage; 
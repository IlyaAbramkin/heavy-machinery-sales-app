import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vehiclesApi, categoriesApi, newsApi } from '../api/api';

const HomePage = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем рекомендуемые товары
        // const vehiclesResponse = await vehiclesApi.getAll({ limit: 6 });
        const vehiclesResponse = await vehiclesApi.getAll(6);
        setFeaturedVehicles(vehiclesResponse.data);

        // Получаем все категории
        const categoriesResponse = await categoriesApi.getAll();
        setCategories(categoriesResponse.data);
        
        // Получаем новости для карусели
        const newsResponse = await newsApi.getAll();
        setNews(newsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка при загрузке данных');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Функция для обрезки текста новости
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
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

  return (
    <div>
      {/* Карусель новостей */}
      <div id="mainCarousel" className="carousel slide mb-5" data-bs-ride="carousel">
        <div className="carousel-indicators">
          {news.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#mainCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? 'active' : ''}
              aria-current={index === 0 ? 'true' : 'false'}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
        <div className="carousel-inner">
          {news.length > 0 ? (
            news.map((newsItem, index) => (
              <div key={newsItem.news_id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                <div 
                  className="d-block w-100 position-relative" 
                  style={{height: '400px'}}
                >
                  {/* Изображение новости как фон */}
                  {(newsItem.image_path || newsItem.image_url) ? (
                    <div 
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${
                          newsItem.image_path 
                            ? `http://localhost:8000${newsItem.image_path}` 
                            : newsItem.image_url
                        })`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    ></div>
                  ) : (
                    <div 
                      className="bg-primary" 
                      style={{
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    ></div>
                  )}
                  
                  <div 
                    className="text-white text-center px-5 position-relative" 
                    style={{
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <h2>{newsItem.title}</h2>
                    <p className="lead">{truncateText(newsItem.content, 200)}</p>
                    <small className="d-block mb-3">
                      {new Date(newsItem.publication_date).toLocaleDateString()}
                    </small>
                    <Link to={`/news/${newsItem.news_id}`} className="btn btn-light mt-3">
                      Читать полностью
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="carousel-item active">
              <div 
                className="d-block w-100 bg-secondary" 
                style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
              >
                <div className="text-white text-center px-5">
                  <h2>Спецтехника для вашего бизнеса</h2>
                  <p className="lead">Широкий ассортимент техники от ведущих производителей</p>
                  <Link to="/catalog" className="btn btn-primary mt-3">
                    Перейти в каталог
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <div className="row">
        {/* Боковая панель с категориями */}
        <div className="col-md-3 mb-4">
          <div className="category-sidebar">
            <h4 className="mb-3">Категории техники</h4>
            <ul className="list-group">
              {categories.map((category) => (
                <li key={category.category_id} className="list-group-item">
                  <Link 
                    to={`/catalog?category=${category.category_id}`}
                    className="text-decoration-none"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Рекомендуемые товары */}
        <div className="col-md-9">
          <h2 className="mb-4">Рекомендуемая техника</h2>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {featuredVehicles.map((vehicle) => (
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
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="btn-group">
                        <Link 
                          to={`/catalog/${vehicle.vehicle_id}`} 
                          className="btn btn-sm btn-outline-primary"
                        >
                          Подробнее
                        </Link>
                      </div>
                      <div className="text-muted">Дата: {new Date(vehicle.publication_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advantages Section */}
      <div className="row mt-5 pt-4 border-top">
        <div className="col-12">
          <h2 className="text-center mb-4">Наши преимущества</h2>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center p-3">
            <div className="card-body">
              <h5 className="card-title">Широкий ассортимент</h5>
              <p className="card-text">
                Мы предлагаем обширный выбор специализированной техники для различных отраслей.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center p-3">
            <div className="card-body">
              <h5 className="card-title">Выгодные цены</h5>
              <p className="card-text">
                Работая напрямую с производителями, мы предлагаем конкурентные цены и выгодные условия.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center p-3">
            <div className="card-body">
              <h5 className="card-title">Доставка по всей России</h5>
              <p className="card-text">
                Мы осуществляем доставку техники в любой регион России.
              </p>
              <a
          href="https://wa.me/79991234567"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-success mt-3"
        >
          Напишите нам в WhatsApp
        </a>
            </div>
          </div>
        </div>

        <div className="row mt-5">
        <div className="col-12"
        style={{
          width: '100%',
          height: '600px',
          overflow: 'hidden',
          position: 'relative'
        }}
        >
          <h2 className="text-center mb-4">Логистика</h2>
          <iframe
            src="https://azlog.ru/calc/"
            width="1300"
            height="600"
            scrolling="yes"
            title="Логистика"
            style={{
              border: 'none',
              width: '100%',
              height: '1000px',
              position: 'absolute',
              top: '-280px',
              left: '0'
             }}
          ></iframe>
        </div>
      </div>
      </div>
    </div>
  );
};

export default HomePage; 

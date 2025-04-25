import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { newsApi } from '../api/api';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await newsApi.getById(id);
        setNews(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Не удалось загрузить новость');
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
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
        <div className="mt-3">
          <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="alert alert-warning my-5" role="alert">
        Новость не найдена
        <div className="mt-3">
          <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Главная</Link></li>
              <li className="breadcrumb-item"><Link to="/news">Новости</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{news.title}</li>
            </ol>
          </nav>
          
          <article className="card border-0 shadow-sm">
            {(news.image_path || news.image_url) && (
              <div className="card-img-top text-center p-3">
                <img 
                  src={news.image_path 
                    ? `http://localhost:8000${news.image_path}` 
                    : news.image_url} 
                  alt={news.title}
                  className="img-fluid rounded"
                  style={{maxHeight: '400px'}}
                />
              </div>
            )}
            <div className="card-body p-4 p-xl-5">
              <h1 className="mb-4">{news.title}</h1>
              
              <div className="mb-4 text-muted small">
                <span className="me-3">
                  <i className="bi bi-calendar-event me-1"></i>
                  {formatDate(news.publication_date)}
                </span>
              </div>
              
              <div className="content">
                {news.content.split('\n').map((paragraph, idx) => (
                  paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                ))}
              </div>
              
              <div className="mt-5 pt-4 border-top">
                <Link to="/" className="btn btn-primary">
                  Вернуться на главную
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage; 
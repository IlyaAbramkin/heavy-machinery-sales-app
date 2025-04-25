import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from '../api/api';

const NewsListPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await newsApi.getAll();
        setNews(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Не удалось загрузить новости');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  const truncateText = (text, maxLength = 200) => {
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
    <div className="container my-5">
      <h1 className="mb-4">Новости</h1>

      {news.length === 0 ? (
        <div className="alert alert-info">
          На данный момент новостей нет.
        </div>
      ) : (
        <div className="row">
          {news.map((newsItem) => (
            <div key={newsItem.news_id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                {(newsItem.image_path || newsItem.image_url) && (
                  <div className="card-img-top" style={{height: '200px', overflow: 'hidden'}}>
                    <img 
                      src={newsItem.image_path 
                        ? `http://localhost:8000${newsItem.image_path}` 
                        : newsItem.image_url} 
                      alt={newsItem.title}
                      className="img-fluid w-100 h-100"
                      style={{objectFit: 'cover'}}
                    />
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title">{newsItem.title}</h5>
                  <p className="card-text text-muted small mb-2">
                    {formatDate(newsItem.publication_date)}
                  </p>
                  <p className="card-text">
                    {truncateText(newsItem.content)}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <Link to={`/news/${newsItem.news_id}`} className="btn btn-primary">
                    Читать полностью
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsListPage; 
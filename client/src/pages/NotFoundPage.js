import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center my-5 py-5">
      <h1 className="display-1 fw-bold">404</h1>
      <h2 className="mb-4">Страница не найдена</h2>
      <p className="lead mb-5">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <Link to="/" className="btn btn-primary">
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFoundPage; 
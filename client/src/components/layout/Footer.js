import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5>Автоспецтехника</h5>
            <p className="text-muted">
              Продажа и сервис автомобильной и специальной техники для различных отраслей.
            </p>
          </div>

          <div className="col-md-3 mb-4 mb-md-0">
            <h5>Разделы</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-decoration-none">Главная</Link></li>
              <li><Link to="/catalog" className="text-decoration-none">Каталог</Link></li>
            </ul>
          </div>

          <div className="col-md-5">
            <h5>Контакты</h5>
            <address className="mb-0 text-muted">
              <p className="mb-1">Адрес: ...</p>
              <p className="mb-1">Телефон: +8 800 555-35-35</p>
              <p className="mb-0">Email: ...</p>
            </address>
          </div>
        </div>

        <hr className="my-4" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 text-muted">
              &copy; {new Date().getFullYear()} Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
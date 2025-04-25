import React, { useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Проверка авторизации при каждом рендере защищенного маршрута
  useEffect(() => {
    // Если загрузка завершена и пользователь не авторизован, перенаправляем на страницу входа
    if (!loading && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  // Показываем индикатор загрузки, пока проверяем авторизацию
  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Если дочерний элемент - функция, вызываем её с currentUser в качестве параметра
  if (typeof children === 'function') {
    return children({ currentUser });
  }

  // Если пользователь авторизован, показываем защищенный компонент
  return children;
};

export default ProtectedRoute; 
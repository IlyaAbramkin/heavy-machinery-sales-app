import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const ProfilePage = () => {
  const { currentUser } = useContext(AuthContext);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Введите текущий пароль';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'Введите новый пароль';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Пароль должен быть не менее 6 символов';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    if (validateForm()) {
      try {
        await axios.post('/auth/change-password', passwordData, {
          withCredentials: true
        });
        
        setSuccessMessage('Пароль успешно изменен');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        console.error('Error changing password:', err);
        setErrorMessage(
          err.response?.data?.detail || 'Ошибка при изменении пароля'
        );
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="alert alert-warning my-5" role="alert">
        Пользователь не найден.
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2>Редактирование профиля</h2>
        <Link to="/account" className="btn btn-outline-primary">
          Назад в личный кабинет
        </Link>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">Профиль пользователя</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={currentUser.email || ''} 
                  disabled 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Имя</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={currentUser.name || ''} 
                  disabled 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Статус</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={currentUser.is_active ? 'Активен' : 'Неактивен'} 
                  disabled 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">Изменить пароль</h3>
            </div>
            <div className="card-body">
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              
              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Текущий пароль</label>
                  <input
                    type="password"
                    className={`form-control ${formErrors.currentPassword ? 'is-invalid' : ''}`}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handleChange}
                  />
                  {formErrors.currentPassword && (
                    <div className="invalid-feedback">{formErrors.currentPassword}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">Новый пароль</label>
                  <input
                    type="password"
                    className={`form-control ${formErrors.newPassword ? 'is-invalid' : ''}`}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handleChange}
                  />
                  {formErrors.newPassword && (
                    <div className="invalid-feedback">{formErrors.newPassword}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Подтверждение пароля</label>
                  <input
                    type="password"
                    className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handleChange}
                  />
                  {formErrors.confirmPassword && (
                    <div className="invalid-feedback">{formErrors.confirmPassword}</div>
                  )}
                </div>
                
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    Изменить пароль
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 
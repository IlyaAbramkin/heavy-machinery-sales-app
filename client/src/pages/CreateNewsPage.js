import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsApi, imagesApi } from '../api/api';
import AuthContext from '../context/AuthContext';

const CreateNewsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    publication_date: new Date().toISOString().split('T')[0]
  });
  
  // Состояние для файла изображения
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [imageError, setImageError] = useState('');
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Проверка прав администратора
  useEffect(() => {
    if (currentUser && !currentUser.is_admin) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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

  // Удаление выбранного изображения
  const handleDeleteImage = () => {
    setSelectedFile(null);
    setPreviewImage('');
    setFormData({
      ...formData,
      image_url: ''
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Заголовок обязателен';
    if (!formData.content.trim()) errors.content = 'Содержание новости обязательно';
    if (!formData.publication_date) errors.publication_date = 'Дата публикации обязательна';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        // Подготовка данных в соответствии с требованиями API
        const payload = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          publication_date: formData.publication_date,
          user_id: currentUser.user_id // Добавляем ID пользователя
        };
        
        // Создаем новость без изображения
        console.log("Creating news without image first");
        const response = await newsApi.create(payload);
        
        // Если есть изображение, загружаем его отдельно
        if (selectedFile) {
          try {
            console.log("Uploading image for news ID:", response.data.news_id);
            
            // Создаем FormData для загрузки файла
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            // Загружаем изображение
            await imagesApi.uploadNewsImage(response.data.news_id, formData);
            console.log("Image uploaded successfully");
          } catch (err) {
            console.error("Error uploading image:", err);
            setError("Новость создана, но возникла ошибка при загрузке изображения");
          }
        }
        
        navigate('/admin', { state: { success: 'Новость успешно создана' } });
      } catch (err) {
        console.error('Error creating news:', err);
        
        // Получение понятного сообщения об ошибке
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Функция для получения понятного сообщения об ошибке
  const getErrorMessage = (err) => {
    if (err.response) {
      // Если есть детальная информация об ошибке от сервера
      if (err.response.data && typeof err.response.data === 'object') {
        if (err.response.data.detail) {
          if (typeof err.response.data.detail === 'string') {
            return err.response.data.detail;
          } else if (Array.isArray(err.response.data.detail)) {
            // Обработка массива ошибок валидации
            return err.response.data.detail.map(item => 
              `${item.loc.join('.')} - ${item.msg}`
            ).join('; ');
          } else {
            return 'Ошибка валидации данных';
          }
        } else {
          return 'Ошибка при создании новости';
        }
      } else {
        return `Ошибка сервера: ${err.response.status}`;
      }
    } else if (err.request) {
      return 'Нет ответа от сервера. Проверьте подключение к интернету.';
    } else {
      return `Произошла ошибка: ${err.message}`;
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Проверка авторизации...</p>
      </div>
    );
  }

  if (currentUser && !currentUser.is_admin) {
    return null; // Перенаправление выполняется в useEffect
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Создание новости</h2>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => navigate('/admin')}
        >
          Назад к панели управления
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Заголовок *</label>
              <input
                type="text"
                className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Введите заголовок новости"
              />
              {formErrors.title && (
                <div className="invalid-feedback">{formErrors.title}</div>
              )}
            </div>
            
            <div className="mb-3">
              <label htmlFor="content" className="form-label">Содержание *</label>
              <textarea
                className={`form-control ${formErrors.content ? 'is-invalid' : ''}`}
                id="content"
                name="content"
                rows="8"
                value={formData.content}
                onChange={handleChange}
                placeholder="Введите текст новости"
              ></textarea>
              {formErrors.content && (
                <div className="invalid-feedback">{formErrors.content}</div>
              )}
            </div>
            
            {/* Блок для загрузки изображения */}
            <div className="mb-4">
              <label className="form-label">Изображение новости</label>
              
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
                  id="news-image"
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
              <label htmlFor="publication_date" className="form-label">Дата публикации *</label>
              <input
                type="date"
                className={`form-control ${formErrors.publication_date ? 'is-invalid' : ''}`}
                id="publication_date"
                name="publication_date"
                value={formData.publication_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
              {formErrors.publication_date && (
                <div className="invalid-feedback">{formErrors.publication_date}</div>
              )}
            </div>
            
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                type="button"
                className="btn btn-outline-secondary me-md-2"
                onClick={() => navigate('/admin')}
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
                ) : 'Создать новость'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNewsPage; 
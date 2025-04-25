import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Настройка базового URL для axios если необходимо
  axios.defaults.baseURL = 'http://localhost:8000'; // Раскомментируйте и укажите правильный URL API

  // Настраиваем axios-интерцептор для добавления токена к запросам
  useEffect(() => {
    // Проверяем наличие токена в localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Устанавливаем токен в заголовок по умолчанию для всех запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Создаем интерцептор для обработки ошибок аутентификации
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // Если сервер вернул 401 (Unauthorized), очищаем данные пользователя
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setCurrentUser(null);
        }
        return Promise.reject(error);
      }
    );

    // Очистка интерцептора при размонтировании компонента
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Проверка аутентификации пользователя при загрузке
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // Проверяем наличие сохраненных данных о пользователе и токена
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('userData');
        
        if (!savedToken) {
          // Если нет токена, пользователь не аутентифицирован
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        if (savedUser) {
          // Временно устанавливаем сохраненного пользователя
          const parsedUser = JSON.parse(savedUser);
          console.log('Сохраненные данные пользователя:', parsedUser);
          setCurrentUser(parsedUser);
        }
        
        // Настраиваем заголовок авторизации
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        
        // Проверяем валидность сессии на сервере
        console.log('Делаем запрос на /auth/me');
        const response = await axios.get('/auth/me', { withCredentials: true });
        console.log('Ответ от /auth/me:', response.data);
        
        // Если запрос успешный, обновляем данные пользователя из ответа сервера
        // Убедимся, что у объекта есть все нужные поля
        const userData = {
          ...response.data,
          user_id: response.data.user_id || response.data.id // Если сервер возвращает id вместо user_id
        };
        
        console.log('Сформированный объект пользователя:', userData);
        setCurrentUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
      } catch (err) {
        console.error('Auth check error:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
        }
        // Если запрос не удался, считаем пользователя не аутентифицированным
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('/auth/login', new URLSearchParams({
        'username': email,
        'password': password
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      });
      
      console.log('Ответ на логин:', response.data);
      
      // Сохраняем токен, если он есть в ответе
      if (response.data && response.data.access_token) {
        const token = response.data.access_token;
        localStorage.setItem('authToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // После успешного входа делаем запрос на получение данных пользователя
      try {
        const userResponse = await axios.get('/auth/me', { withCredentials: true });
        console.log('Данные пользователя после логина:', userResponse.data);
        
        // Убедимся, что у объекта есть все нужные поля
        const userData = {
          ...userResponse.data,
          user_id: userResponse.data.user_id || userResponse.data.id // Если сервер возвращает id вместо user_id
        };
        
        console.log('Сформированный объект пользователя:', userData);
        setCurrentUser(userData);
        // Сохраняем данные пользователя в localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
      } catch (userErr) {
        console.error('Error fetching user data:', userErr);
        if (userErr.response) {
          console.error('Response data:', userErr.response.data);
        }
        // Если запрос на получение пользователя не удался, создаем минимальный объект пользователя
        const basicUserData = { 
          isLoggedIn: true,
          email: email,
          // Можно добавить временное значение для user_id, например -1
          user_id: -1 
        };
        console.log('Создан базовый объект пользователя:', basicUserData);
        setCurrentUser(basicUserData);
        localStorage.setItem('userData', JSON.stringify(basicUserData));
      }
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
      }
      setError(err.response?.data?.detail || 'Failed to login');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      await axios.post('/users/', userData);
      return true;
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.detail || 'Failed to register');
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Удаляем данные пользователя и токен из localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Удаляем заголовок авторизации из axios
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
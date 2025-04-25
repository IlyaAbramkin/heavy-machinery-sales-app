import axios from 'axios';

// Базовый URL для API
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

// API для работы с пользователями
export const usersApi = {
  getAll: () => axios.get('/users'),
  getById: (id) => axios.get(`/users/${id}`),
  create: (data) => axios.post('/users', data),
  update: (id, data) => axios.put(`/users/${id}`, data),
  delete: (id) => axios.delete(`/users/${id}`),
  register: (data) => axios.post('/auth/register', data),
  login: (data) => axios.post('/auth/login', data),
  logout: () => axios.post('/auth/logout'),
  getCurrentUser: () => axios.get('/users/me'),
  changePassword: (data) => axios.post('/auth/change-password', data)
};

// API для работы с транспортными средствами
export const vehiclesApi = {
  getAll: (params) => axios.get('/vehicles', { params }),
  getById: (id) => axios.get(`/vehicles/${id}`),
  create: (data) => axios.post('/vehicles', data),
  update: (id, data) => axios.put(`/vehicles/${id}`, data),
  delete: (id) => axios.delete(`/vehicles/${id}`),
  getUserVehicles: () => axios.get('/vehicles/my/'),
};

// API для работы с категориями
export const categoriesApi = {
  getAll: () => axios.get('/categories'),
  getById: (id) => axios.get(`/categories/${id}`),
  create: (data) => axios.post('/categories', data),
  update: (id, data) => axios.put(`/categories/${id}`, data),
  delete: (id) => axios.delete(`/categories/${id}`)
};

// API для работы с шасси
export const chassisApi = {
  getAll: () => axios.get('/chassis'),
  getById: (id) => axios.get(`/chassis/${id}`),
  create: (data) => axios.post('/chassis', data),
  update: (id, data) => axios.put(`/chassis/${id}`, data),
  delete: (id) => axios.delete(`/chassis/${id}`)
};

// API для работы с заводами
export const factoriesApi = {
  getAll: () => axios.get('/factories'),
  getById: (id) => axios.get(`/factories/${id}`),
  create: (data) => axios.post('/factories', data),
  update: (id, data) => axios.put(`/factories/${id}`, data),
  delete: (id) => axios.delete(`/factories/${id}`)
};

// API для работы с колесными формулами
export const wheelFormulasApi = {
  getAll: () => axios.get('/wheel-formulas'),
  getById: (id) => axios.get(`/wheel-formulas/${id}`),
  create: (data) => axios.post('/wheel-formulas', data),
  update: (id, data) => axios.put(`/wheel-formulas/${id}`, data),
  delete: (id) => axios.delete(`/wheel-formulas/${id}`)
};

// API для работы с двигателями
export const enginesApi = {
  getAll: () => axios.get('/engines'),
  getById: (id) => axios.get(`/engines/${id}`),
  create: (data) => axios.post('/engines', data),
  update: (id, data) => axios.put(`/engines/${id}`, data),
  delete: (id) => axios.delete(`/engines/${id}`)
};

// API для работы с прайс-листами
export const priceListsApi = {
  getAll: () => axios.get('/price-list'),
  getById: (id) => axios.get(`/price-list/${id}`),
  getByVehicleId: (vehicleId) => axios.get(`/price-list/vehicle/${vehicleId}`),
  create: (data) => axios.post('/price-list', data),
  update: (id, data) => axios.put(`/price-list/${id}`, data),
  delete: (id) => axios.delete(`/price-list/${id}`)
};

// API для работы с заявками
export const requestsApi = {
  getAll: () => axios.get('/requests'),
  getById: (id) => axios.get(`/requests/${id}`),
  getUserRequests: () => axios.get('/requests/my/'),
  create: (data) => axios.post('/requests', data),
  update: (id, data) => axios.put(`/requests/${id}`, data),
  delete: (id) => axios.delete(`/requests/${id}`),
  createOrder: (data) => axios.post('/requests/create-order', data),
  getOrderDetails: (id) => axios.get(`/requests/details/${id}`)
};

// API для работы с товарами в заявке
export const tovaryApi = {
  getAll: (requestId) => axios.get(`/requisitioned-goods/${requestId}`),
  create: (requestId, data) => axios.post(`/requisitioned-goods/${requestId}`, data),
  update: (requestId, vehicleId, data) => axios.put(`/requisitioned-goods/${requestId}/${vehicleId}`, data),
  delete: (requestId, vehicleId) => axios.delete(`/requisitioned-goods/${requestId}/${vehicleId}`)
};

// API для работы с новостями
export const newsApi = {
  getAll: () => axios.get('/news'),
  getById: (id) => axios.get(`/news/${id}`),
  create: (data) => axios.post('/news', data),
  update: (id, data) => axios.put(`/news/${id}`, data),
  delete: (id) => axios.delete(`/news/${id}`)
};

// API для работы с изображениями
export const imagesApi = {
  uploadVehicleImage: (vehicleId, formData) => 
    axios.post(`/images/vehicles/${vehicleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  deleteVehicleImage: (vehicleId) => 
    axios.delete(`/images/vehicles/${vehicleId}`),
  
  // API для работы с изображениями новостей
  uploadNewsImage: (newsId, formData) => 
    axios.post(`/images/news/${newsId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  deleteNewsImage: (newsId) => 
    axios.delete(`/images/news/${newsId}`)
};

export default axios; 
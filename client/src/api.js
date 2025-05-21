import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true // для куки
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const userApi = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),

    login: (data) => api.post('/auth/login', new URLSearchParams({
        username: data.email,
        password: data.password
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}),

    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
    changePassword: (data) => api.post('/auth/change-password', data)
}

export const newsApi = {
    getAll: () => api.get('/news'),
    getById: (id) => api.get(`/news/${id}`),
    create: (data) => api.post('/news', data),
    update: (id, data) => api.put(`/news/${id}`, data),
    delete: (id) => api.delete(`/news/${id}`)
};

export const vehiclesApi = {
    getAll: (params) => api.get('/vehicles', { params }),
    getById: (id) => api.get(`/vehicles/${id}`),
    create: (data) => api.post('/vehicles', data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    delete: (id) => api.delete(`/vehicles/${id}`),
    getUserVehicles: () => api.get('/vehicles/my/'),
    updatePublicationDate: (id) => api.put(`/vehicles/${id}/update-publication-date`),
};

export const categoriesApi = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`)
};

export const chassisApi = {
    getAll: () => api.get('/chassis'),
    getById: (id) => api.get(`/chassis/${id}`),
    create: (data) => api.post('/chassis', data),
    update: (id, data) => api.put(`/chassis/${id}`, data),
    delete: (id) => api.delete(`/chassis/${id}`)
};

export const factoriesApi = {
    getAll: () => api.get('/factories'),
    getById: (id) => api.get(`/factories/${id}`),
    create: (data) => api.post('/factories', data),
    update: (id, data) => api.put(`/factories/${id}`, data),
    delete: (id) => api.delete(`/factories/${id}`)
};

export const wheelFormulasApi = {
    getAll: () => api.get('/wheel-formulas'),
    getById: (id) => api.get(`/wheel-formulas/${id}`),
    create: (data) => api.post('/wheel-formulas', data),
    update: (id, data) => api.put(`/wheel-formulas/${id}`, data),
    delete: (id) => api.delete(`/wheel-formulas/${id}`)
};

export const enginesApi = {
    getAll: () => api.get('/engines'),
    getById: (id) => api.get(`/engines/${id}`),
    create: (data) => api.post('/engines', data),
    update: (id, data) => api.put(`/engines/${id}`, data),
    delete: (id) => api.delete(`/engines/${id}`)
};

export const priceListsApi = {
    getAll: () => api.get('/price-list'),
    getById: (id) => api.get(`/price-list/${id}`),
    getByVehicleId: (vehicleId) => api.get(`/price-list/vehicle/${vehicleId}`),
    create: (data) => api.post('/price-list', data),
    update: (id, data) => api.put(`/price-list/${id}`, data),
    delete: (id) => api.delete(`/price-list/${id}`)
};

export const requestsApi = {
    getAll: () => api.get('/requests'),
    getById: (id) => api.get(`/requests/${id}`),
    getUserRequests: () => api.get('/requests/my/'),
    create: (data) => api.post('/requests', data),
    update: (id, data) => api.put(`/requests/${id}`, data),
    delete: (id) => api.delete(`/requests/${id}`),
    createOrder: (data) => api.post('/requests/create-order', data),
    getOrderDetails: (id) => api.get(`/requests/details/${id}`)
};

export const tovaryApi = {
    getAll: () => api.get('/requisitioned-goods'),
    getByRequest: (requestId) => api.get(`/requisitioned-goods/${requestId}`),
    getRequisitionedGood: (requestId, vehicleId) => api.get(`/requisitioned-goods/${requestId}/${vehicleId}`),
    create: (requestId, data) => api.post(`/requisitioned-goods/${requestId}`, data),
    update: (requestId, vehicleId, data) => api.put(`/requisitioned-goods/${requestId}/${vehicleId}`, data),
    delete: (requestId, vehicleId) => api.delete(`/requisitioned-goods/${requestId}/${vehicleId}`)
};


export const imagesApi = {
    uploadVehicleImage: (vehicleId, formData) => api.post(`/images/vehicles/${vehicleId}`, formData, {
        headers: {'Content-Type': 'multipart/form-data'}
    }),
    deleteVehicleImage: (vehicleId) => api.delete(`/images/vehicles/${vehicleId}`),

    uploadNewsImage: (newsId, formData) => api.post(`/images/news/${newsId}`, formData, {
        headers: {'Content-Type': 'multipart/form-data'}
    }),
    deleteNewsImage: (newsId) => api.delete(`/images/news/${newsId}`),

    getNewsImage: (newsId) => api.get(`http://localhost:8000/images/news/${newsId}`)

};

export default api
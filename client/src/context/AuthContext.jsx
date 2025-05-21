import { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);


    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }

            const response = await userApi.getCurrentUser();
            setUser(response.data);
        }

        checkAuth();
    }, []);

    const login = async (credentials) => {
        const res = await userApi.login(credentials);
        localStorage.setItem('token', res.data.access_token);
        const me = await userApi.getCurrentUser();
        setUser(me.data);
    };

    const register = async (data) => {
        await userApi.create(data);
        return login({ email: data.email, password: data.password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        userApi.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(AuthContext);
}
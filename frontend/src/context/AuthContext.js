import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api/auth`
        : 'http://localhost:5001/api/auth';

    useEffect(() => {
        // Check local storage for token
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const register = async (name, email, password) => {
        try {
            const res = await axios.post(`${API_URL}/register`, { name, email, password });

            setToken(res.data.token);
            setUser(res.data);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));

            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });

            setToken(res.data.token);
            setUser(res.data);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));

            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUserFavorites = (favorites) => {
        const updatedUser = { ...user, favorites };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, logout, updateUserFavorites }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

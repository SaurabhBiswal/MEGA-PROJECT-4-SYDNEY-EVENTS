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
        const initAuth = async () => {
            // Check session storage for token
            const storedToken = sessionStorage.getItem('token');
            const storedUser = sessionStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                const parsedUser = JSON.parse(storedUser);

                // Initialize with stored user first
                setUser(parsedUser);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                // Then refresh from server to get latest data (including favorites)
                try {
                    const response = await axios.get(`${API_URL}/me`, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });

                    // Update with fresh data from server
                    const freshUser = { ...response.data, token: storedToken };
                    console.log('User Auth Success [v1.2.1]');
                    setUser(freshUser);
                    sessionStorage.setItem('user', JSON.stringify(freshUser));
                } catch (error) {
                    console.error('Failed to refresh user data:', error);
                    // If token is invalid or signature failed, logout immediately
                    if (error.response?.status === 401 || error.message.includes('signature')) {
                        logout();
                        console.warn('Invalid session - LOGGED OUT [v1.2.1]');
                    }
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [API_URL]);

    const register = async (name, email, password) => {
        try {
            const res = await axios.post(`${API_URL}/register`, { name, email, password });

            setToken(res.data.token);
            setUser(res.data);

            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('user', JSON.stringify(res.data));

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

            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('user', JSON.stringify(res.data));

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
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUserFavorites = (favorites) => {
        const updatedUser = { ...user, favorites };
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, logout, updateUserFavorites, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

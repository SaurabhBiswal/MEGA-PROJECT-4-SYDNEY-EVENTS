import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Info, LogIn, User, LogOut } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            SydneyEvents
                        </span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Home
                        </Link>
                        <Link to="/about" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            <Info className="h-4 w-4" />
                            <span>About</span>
                        </Link>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-900 font-medium">Hello, {user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                            >
                                <LogIn className="h-4 w-4" />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

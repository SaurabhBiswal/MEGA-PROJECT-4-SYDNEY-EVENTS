import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, Bell, AlertTriangle, CheckCircle, XCircle, Edit2, Save, X } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5001/api';

const Profile = () => {
    const { user, token, logout, updateProfile, login } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        notificationSettings: {
            email: true,
            telegram: false,
            eventReminders: true,
            marketing: false
        }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // For success/error messages

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                notificationSettings: user.notificationSettings || {
                    email: true,
                    telegram: false,
                    eventReminders: true,
                    marketing: false
                }
            });
        }
    }, [user]);

    const paymentStatus = searchParams.get('payment');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await axios.put(
                `${API_URL}/auth/profile`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                // Update context with new user data
                login(token, response.data.data);
                setEditing(false);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || ''
        });
        setEditing(false);
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <p className="text-center text-gray-600">Please login to view your profile</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
                                <User className="h-10 w-10 text-blue-600" />
                            </div>
                            <div className="text-white">
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                                <p className="text-blue-100">{user.email}</p>
                            </div>
                        </div>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {
                        editing ? (
                            <form onSubmit={handleSubmit} className="space-y-4" >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>

                                <div className="border-t border-gray-100 pt-4 mt-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-gray-500" />
                                        Notification Preferences
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-gray-700 text-sm">Email Notifications</span>
                                            <input
                                                type="checkbox"
                                                checked={formData.notificationSettings?.email}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    notificationSettings: {
                                                        ...formData.notificationSettings,
                                                        email: e.target.checked
                                                    }
                                                })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-gray-700 text-sm">Telegram Alerts</span>
                                            <input
                                                type="checkbox"
                                                checked={formData.notificationSettings?.telegram}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    notificationSettings: {
                                                        ...formData.notificationSettings,
                                                        telegram: e.target.checked
                                                    }
                                                })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-gray-700 text-sm">Event Reminders (1 day before)</span>
                                            <input
                                                type="checkbox"
                                                checked={formData.notificationSettings?.eventReminders}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    notificationSettings: {
                                                        ...formData.notificationSettings,
                                                        eventReminders: e.target.checked
                                                    }
                                                })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Name
                                        </label>
                                        <p className="text-lg text-gray-900">{user.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Email
                                        </label>
                                        <p className="text-lg text-gray-900">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Role
                                        </label>
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            {user.role}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Favorite Events
                                        </label>
                                        <p className="text-lg text-gray-900">{user.favorites?.length || 0}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                </div >
            </div >
        </div >
    );
};

export default Profile;

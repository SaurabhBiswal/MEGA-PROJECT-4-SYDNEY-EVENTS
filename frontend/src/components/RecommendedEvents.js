import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Sparkles, Loader2 } from 'lucide-react';
import EventCard from './EventCard';
import AuthContext from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5001/api';

const RecommendedEvents = ({ onGetTickets }) => {
    const { token } = useContext(AuthContext);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/events/recommendations?limit=6`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setRecommendations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null; // Don't show section if no recommendations
    }

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>
            </div>
            <p className="text-gray-600 mb-6">
                Based on your interests and similar users' preferences
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map(event => (
                    <EventCard
                        key={event._id}
                        event={event}
                        onGetTickets={onGetTickets}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecommendedEvents;

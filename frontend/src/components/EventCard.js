import React, { useContext } from 'react';
import { Calendar, MapPin, ExternalLink, Heart } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const EventCard = ({ event }) => {
    const { user, token, updateUserFavorites } = useContext(AuthContext);

    // Check if event is favorited
    const isFavorite = user?.favorites?.includes(event._id);

    const toggleFavorite = async () => {
        if (!user) {
            alert('Please login to save events!');
            return;
        }

        try {
            const API_URL = process.env.REACT_APP_API_URL
                ? `${process.env.REACT_APP_API_URL}/api/events/${event._id}/favorite`
                : `http://localhost:5001/api/events/${event._id}/favorite`;

            const res = await axios.post(API_URL, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Update local context
                let newFavorites;
                if (res.data.isFavorite) {
                    newFavorites = [...(user.favorites || []), event._id];
                } else {
                    newFavorites = (user.favorites || []).filter(id => id !== event._id);
                }
                updateUserFavorites(newFavorites);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-600 shadow-sm">
                        {event.category}
                    </span>
                    <button
                        onClick={toggleFavorite}
                        className={`p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                        {event.title}
                    </h3>
                    <span className="text-green-600 font-bold text-sm whitespace-nowrap ml-2">
                        {event.price}
                    </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600 flex-grow">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                            {event.date ? format(new Date(event.date), 'EEE, MMM d, yyyy') : 'Date TBA'}
                            {event.time && ` • ${event.time}`}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="line-clamp-1">{event.venue}</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50 mt-auto">
                    <a
                        href={event.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white py-2.5 rounded-lg transition-all duration-300 font-medium text-sm group-hover:bg-blue-50 group-hover:text-blue-600"
                    >
                        <span>Get Tickets</span>
                        <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default EventCard;

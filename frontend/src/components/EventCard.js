import React, { useContext, useState } from 'react';
import { Calendar, MapPin, ExternalLink, Heart, Share2, Star, MessageSquare, Bell } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const EventCard = ({ event, onGetTickets, onOpenReviews }) => {
    const { user, token, updateUserFavorites } = useContext(AuthContext);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    // Check if event is favorited
    // Robust check for both populated objects and ID strings
    const isFavorite = user?.favorites?.some(f =>
        (typeof f === 'string' ? f : f._id) === event._id
    );

    const toggleFavorite = async () => {
        if (!user) {
            alert('Please login to save events!');
            return;
        }

        // Prevent multiple simultaneous requests
        if (isTogglingFavorite) return;

        setIsTogglingFavorite(true);
        try {
            const API_URL = process.env.REACT_APP_API_URL
                ? `${process.env.REACT_APP_API_URL}/api`
                : 'http://localhost:5001/api';

            const response = await axios.post(
                `${API_URL}/events/${event._id}/favorite`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                updateUserFavorites(response.data.data);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Failed to update favorite. Please try again.');
        } finally {
            setIsTogglingFavorite(false);
        }
    };



    const setReminder = async () => {
        if (!user) {
            alert('Please login to set reminders!');
            return;
        }

        try {
            const API_URL = process.env.REACT_APP_API_URL
                ? `${process.env.REACT_APP_API_URL}/api`
                : 'http://localhost:5001/api';

            const response = await axios.post(
                `${API_URL}/reminders`,
                { eventId: event._id, type: '1_day_before' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Reminder set successfully! You will be notified 1 day before the event.');
            }
        } catch (error) {
            console.error('Error setting reminder:', error);
            alert(error.response?.data?.message || 'Failed to set reminder.');
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
                        disabled={isTogglingFavorite}
                        className={`p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                            } ${isTogglingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                            {event.title}
                        </h3>
                        {/* Rating Display */}
                        {event.averageRating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${star <= Math.round(event.averageRating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-gray-600">
                                    {event.averageRating.toFixed(1)} ({event.reviewCount})
                                </span>
                            </div>
                        )}
                    </div>
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

                <div className="pt-4 border-t border-gray-50 mt-auto flex gap-2">
                    <button
                        onClick={() => onGetTickets(event)}
                        className="flex items-center justify-center flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-all duration-300 font-medium text-sm"
                    >
                        <span>Get Tickets</span>
                        <ExternalLink className="h-4 w-4 ml-2" />
                    </button>

                    <div className="relative group/calendar">
                        <button
                            className="flex items-center justify-center px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 font-medium text-sm"
                            title="Add to Calendar"
                        >
                            <Calendar className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/calendar:opacity-100 group-hover/calendar:visible transition-all duration-200 z-10">
                            <a
                                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(new Date(event.date).getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description || `Event at ${event.venue}`)}&location=${encodeURIComponent(event.venue)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                            >
                                📅 Google Calendar
                            </a>
                            <a
                                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/events/${event._id}/calendar`}
                                download
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg border-t border-gray-100"
                            >
                                📥 Download iCal
                            </a>
                        </div>
                    </div>

                    <button
                        onClick={() => onOpenReviews && onOpenReviews(event)}
                        className="flex items-center justify-center px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 font-medium text-sm group/reviews relative"
                        title="Reviews"
                    >
                        <MessageSquare className="h-4 w-4" />
                        {event.reviewCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                                {event.reviewCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={setReminder}
                        className="flex items-center justify-center px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 font-medium text-sm group/reminder"
                        title="Set Reminder"
                    >
                        <Bell className="h-4 w-4" />
                    </button>

                    <div className="relative group/share">
                        <button
                            className="flex items-center justify-center px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 font-medium text-sm"
                            title="Share Event"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>

                        {/* Share Dropdown */}
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/share:opacity-100 group-hover/share:visible transition-all duration-200 z-10">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(event.sourceUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                            >
                                📘 Facebook
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${event.title}!`)}&url=${encodeURIComponent(event.sourceUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                            >
                                🐦 Twitter
                            </a>
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(`${event.title} - ${event.sourceUrl}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg border-t border-gray-100"
                            >
                                💬 WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCard;

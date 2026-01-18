import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

const EventCard = ({ event, onGetTickets }) => {
    const eventDate = new Date(event.date).toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
                    alt={event.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'; }}
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-primary-600 shadow-md">
                    {event.price}
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                    <span className="text-xs font-semibold tracking-wide uppercase text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                        {event.category || 'Event'}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2 flex-1">{event.description}</p>

                <div className="space-y-2 mb-6 text-sm text-gray-500">
                    <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{eventDate}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{event.time}</span>
                    </div>
                </div>

                <button
                    onClick={() => onGetTickets(event)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    Get Tickets
                </button>
            </div>
        </div>
    );
};

export default EventCard;

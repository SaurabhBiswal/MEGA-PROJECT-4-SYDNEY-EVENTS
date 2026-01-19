import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, MapPin } from 'lucide-react';
import axios from 'axios';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_URL = process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5001/api';

const MapView = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_URL}/events`);
            // Filter events that have coordinates (mocked for now if not present)
            const eventsWithLoc = res.data.data.map(event => ({
                ...event,
                coordinates: event.coordinates || {
                    // Random offset from Sydney center for demo if no real coords
                    lat: -33.8688 + (Math.random() - 0.5) * 0.1,
                    lng: 151.2093 + (Math.random() - 0.5) * 0.1
                }
            }));
            setEvents(eventsWithLoc);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            <div className="bg-white p-4 shadow-sm z-10">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary-600" />
                    Event Map
                </h1>
                <p className="text-gray-500 text-sm">Discover events happening around Sydney</p>
            </div>

            <MapContainer
                center={[-33.8688, 151.2093]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {events.map(event => (
                    <Marker
                        key={event._id}
                        position={[event.coordinates.lat, event.coordinates.lng]}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                />
                                <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(event.date).toLocaleDateString()} at {event.time}
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {event.venue}
                                    </p>
                                </div>
                                <a
                                    href={event.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-3 text-center bg-primary-600 text-white py-1.5 rounded text-sm font-medium hover:bg-primary-700 transition"
                                >
                                    View Details
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;

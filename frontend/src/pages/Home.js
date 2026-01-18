import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2 } from 'lucide-react';
import EventCard from '../components/EventCard';


const API_URL = 'http://localhost:5001/api';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [email, setEmail] = useState('');
    const [optIn, setOptIn] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${API_URL}/events`);
            setEvents(response.data.data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
            
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGetTickets = (event) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const handleSubmitEmail = async () => {
        if (!email) {
            alert('Please enter your email address');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(
                `${API_URL}/events/${selectedEvent._id}/subscribe`,
                { email }
            );

            if (response.data.success) {
                window.open(response.data.redirectUrl, '_blank');
                closeModal();
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            
            if (selectedEvent?.sourceUrl) {
                window.open(selectedEvent.sourceUrl, '_blank');
                closeModal();
            }
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEmail('');
        setOptIn(false);
        setSelectedEvent(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Discover Sydney's Best <span className="text-primary-600">Events</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    From live music to food festivals, find out what's happening in your city.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
                </div>
            ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <EventCard key={event._id || event.title} event={event} onGetTickets={handleGetTickets} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                    <p className="text-gray-500 mt-2">Check back later or try running the scraper!</p>
                </div>
            )}

            {/* Get Tickets Modal */}
            {showModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Get Tickets</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 mb-6">
                                Enter your email to proceed to <strong>{selectedEvent.title}</strong> booking page.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        placeholder="you@example.com"
                                        autoFocus
                                    />
                                </div>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            checked={optIn}
                                            onChange={(e) => setOptIn(e.target.checked)}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                        Keep me updated about similar events in Sydney
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitEmail}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-70 flex justify-center items-center"
                            >
                                {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Get Tickets'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;

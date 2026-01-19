import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { X, Loader2, Filter } from 'lucide-react';
import EventCard from '../components/EventCard';
import RecommendedEvents from '../components/RecommendedEvents';
import ReviewModal from '../components/ReviewModal';
import AuthContext from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5001/api';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [reviewEvent, setReviewEvent] = useState(null);
    const [email, setEmail] = useState('');
    const [optIn, setOptIn] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        category: 'All',
        date: 'any',
        search: ''
    });

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                // Build query params
                const params = {};
                if (filters.category !== 'All') params.category = filters.category;
                if (filters.date !== 'any') params.date = filters.date;
                if (filters.search) params.search = filters.search;

                const response = await axios.get(`${API_URL}/events`, { params });
                setEvents(response.data.data || []);
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timer = setTimeout(() => {
            fetchEvents();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
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
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Discover Sydney's Best <span className="text-primary-600">Events</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    From live music to food festivals, find out what's happening in your city.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-center justify-center sm:justify-between">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Filter className="h-5 w-5 text-primary-600" />
                    <span>Filters:</span>
                </div>

                <div className="flex flex-wrap gap-4">
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700"
                    >
                        <option value="All">All Categories</option>
                        <option value="Music">Music</option>
                        <option value="Food">Food & Drink</option>
                        <option value="Technology">Technology</option>
                        <option value="Sports">Sports</option>
                        <option value="Arts">Arts & Theatre</option>
                    </select>

                    <select
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-700"
                    >
                        <option value="any">Any Date</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        {/* <option value="weekend">This Weekend</option> */}
                    </select>
                </div>
            </div>

            {/* Recommended Events Section - Only for logged-in users */}
            {user && <RecommendedEvents onGetTickets={handleGetTickets} />}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
                </div>
            ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <EventCard
                            key={event._id || event.title}
                            event={event}
                            onGetTickets={handleGetTickets}
                            onOpenReviews={(event) => {
                                setReviewEvent(event);
                                setShowReviewModal(true);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xl text-gray-500">No events found matching your criteria</p>
                    <button
                        onClick={() => setFilters({ category: 'All', date: 'any', search: '' })}
                        className="mt-4 text-primary-600 font-medium hover:text-primary-700 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Ticket Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">Get Tickets</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-8">
                            <p className="mb-6 text-gray-600 text-center">
                                Enter your email to receive ticket details for <br />
                                <span className="font-bold text-gray-900 mt-1 block">{selectedEvent?.title}</span>
                            </p>
                            <form onSubmit={handleSubmitEmail} className="space-y-4">
                                <div>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="optIn"
                                        checked={optIn}
                                        onChange={(e) => setOptIn(e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    />
                                    <label htmlFor="optIn" className="text-sm text-gray-600 cursor-pointer select-none">
                                        Send me updates about similar events
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:transform-none disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        'Confirm Subscription'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && reviewEvent && (
                <ReviewModal
                    event={reviewEvent}
                    onClose={() => {
                        setShowReviewModal(false);
                        setReviewEvent(null);
                    }}
                    onReviewSubmitted={() => {
                        fetchEvents(); // Refresh to update average rating on card
                    }}
                />
            )}
        </div>
    );
};

export default Home;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Star, X, MessageSquare, User } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5001/api';

const ReviewModal = ({ event, onClose, onReviewSubmitted }) => {
    const { user, token } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`${API_URL}/reviews/${event._id}`);
                if (res.data.success) {
                    setReviews(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [event._id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to submit a review');
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post(
                `${API_URL}/reviews`,
                {
                    eventId: event._id,
                    rating,
                    comment
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (res.data.success) {
                // Refresh reviews
                fetchReviews();
                setComment('');
                setRating(5);
                if (onReviewSubmitted) onReviewSubmitted();
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Error submitting review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                {event.averageRating?.toFixed(1) || '0.0'} ({event.reviewCount || 0} reviews)
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-8">
                    {/* Submit Review Form */}
                    {user ? (
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                                Write a Review
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`h-8 w-8 ${star <= (hoverRating || rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                                        placeholder="Share your experience..."
                                        maxLength={500}
                                    />
                                    <div className="text-right text-xs text-gray-400 mt-1">
                                        {comment.length}/500
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Post Review'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
                            <p className="text-gray-600 mb-2">Please login to write a review</p>
                            <a href="/login" className="text-blue-600 font-bold hover:underline">Go to Login</a>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Recent Reviews</h3>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading reviews...</div>
                        ) : reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review._id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{review.userId?.name || 'Anonymous'}</p>
                                                    <p className="text-xs text-gray-500">{format(new Date(review.createdAt), 'MMM d, yyyy')}</p>
                                                </div>
                                            </div>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-600 text-sm leading-relaxed ml-10">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">No reviews yet. Be the first to share your thoughts!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;

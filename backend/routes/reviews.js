import express from 'express';
import Review from '../models/Review.js';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { eventId, rating, comment } = req.body;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check if user already reviewed
        const existingReview = await Review.findOne({ userId: req.user.id, eventId });
        if (existingReview) {
            // Update existing review
            existingReview.rating = rating;
            existingReview.comment = comment;
            await existingReview.save();
        } else {
            // Create new review
            await Review.create({
                userId: req.user.id,
                eventId,
                rating,
                comment
            });
        }

        // Recalculate average rating
        const reviews = await Review.find({ eventId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        event.averageRating = avgRating;
        event.reviewCount = reviews.length;
        await event.save();

        res.json({ success: true, message: 'Review submitted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Get reviews for an event
// @route   GET /api/reviews/:eventId
// @access  Public
router.get('/:eventId', async (req, res) => {
    try {
        const reviews = await Review.find({ eventId: req.params.eventId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

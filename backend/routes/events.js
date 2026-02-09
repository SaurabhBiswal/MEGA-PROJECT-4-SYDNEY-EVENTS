import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendTicketConfirmationEmail } from '../services/emailService.js';
import { trackInteraction, getRecommendations } from '../services/recommendationService.js';


import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: retries => {
            if (retries > 5) {
                console.log('Redis: Too many retries. Going silent (Cache Disabled).');
                return new Error('Redis connection failed');
            }
            return Math.min(retries * 50, 500);
        }
    }
});

redisClient.on('error', (err) => {

    if (err.code !== 'ECONNREFUSED') console.log('Redis Client Error', err);
});


(async () => {
    try {
        await redisClient.connect();
        console.log("Redis Connected 🚀");
    } catch (e) {
        console.log("⚠️ Redis not found locally. Running in 'Database Only' mode (this is normal without Docker).");
    }
})();

const router = express.Router();

// Get all events
// Get all events with Filters
router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, date, search } = req.query;

        // Build Query
        let query = {
            isActive: true,
            date: { $gte: new Date() } // Default: Upcoming events
        };

        // Text search
        if (search && search.trim()) {
            query.$text = { $search: search };
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        if (date) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            if (date === 'today') {
                query.date = {
                    $gte: new Date(today.setHours(0, 0, 0, 0)),
                    $lt: new Date(today.setHours(23, 59, 59, 999))
                };
            } else if (date === 'tomorrow') {
                query.date = {
                    $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
                    $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
                };
            }
        }

        // Cache Key based on query
        const cacheKey = `events_${JSON.stringify(req.query)}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                return res.json({
                    success: true,
                    data: JSON.parse(cachedData),
                    source: 'cache'
                });
            }
        } catch (e) { /* ignore cache errors */ }

        const events = await Event.find(query).sort({ date: 1 });

        try {
            await redisClient.set(cacheKey, JSON.stringify(events), { EX: 3600 });
        } catch (e) { /* ignore */ }

        res.json({
            success: true,
            count: events.length,
            data: events,
            source: 'database'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


router.post('/sample', async (req, res) => {
    try {
        const sampleEvent = new Event({
            title: 'Sample Music Concert',
            description: 'This is a sample event for testing',
            date: new Date('2024-03-20'),
            time: '7:00 PM',
            venue: 'Sydney Opera House',
            price: '$50',
            category: 'Music',
            imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
            sourceUrl: 'https://www.eventbrite.com',
            source: 'Eventbrite',
        });

        await sampleEvent.save();
        res.json({ success: true, data: sampleEvent });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Get user favorites
// @route   GET /api/events/favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');
        res.json({ success: true, data: user.favorites });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Toggle favorite event
// @route   POST /api/events/:id/favorite
// @access  Private
router.post('/:id/favorite', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const eventId = req.params.id;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check if already in favorites
        if (!user.favorites) {
            user.favorites = [];
        }
        const favoriteIndex = user.favorites.findIndex(id => id ? id.toString() === eventId : false);

        if (favoriteIndex > -1) {
            // Remove
            user.favorites.splice(favoriteIndex, 1);
            await user.save();
            return res.json({ success: true, message: 'Removed from favorites', isFavorite: false, data: user.favorites });
        } else {
            // Add
            user.favorites.push(eventId);
            await user.save();

            // Track interaction for ML - Fire and forget
            trackInteraction(req.user.id, eventId, 'favorite').catch(err => console.error('Interaction tracking failed', err));

            return res.json({ success: true, message: 'Added to favorites', isFavorite: true, data: user.favorites });
        }
    } catch (error) {
        console.error('Favorite toggle error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.post('/:id/subscribe', async (req, res) => {
    try {
        const { email, optIn } = req.body;
        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // Save Subscription to DB
        try {
            const { default: Subscription } = await import('../models/Subscription.js');
            await Subscription.findOneAndUpdate(
                { email, eventId },
                { optIn, subscribedAt: new Date() },
                { upsert: true, new: true }
            );
        } catch (dbError) {
            console.error('Subscription DB error:', dbError);
        }

        // Send Email asynchronously (Fire and Forget)
        // Ensure we don't await this and catch any errors to prevent server crash
        (async () => {
            try {
                await sendTicketConfirmationEmail(email, event);
            } catch (e) {
                console.error('Email background send failed (silent):', e.message);
            }
        })();

        // Track interaction for ML (if user is logged in) - Fire and forget
        if (req.user) {
            (async () => {
                try {
                    await trackInteraction(req.user.id, req.params.id, 'ticket');
                } catch (e) {
                    console.error('Tracking failed', e);
                }
            })();
        }

        res.json({
            success: true,
            message: 'Successfully subscribed',
            redirectUrl: event.sourceUrl, // Ensure this exists
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Get personalized recommendations
// @route   GET /api/events/recommendations
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const recommendations = await getRecommendations(req.user.id, limit);

        res.json({
            success: true,
            count: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Download event as iCal file
// @route   GET /api/events/:id/calendar
// @access  Public
router.get('/:id/calendar', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        const { generateICalFile } = await import('../services/calendarService.js');
        const icalContent = generateICalFile(event);

        // Set headers for file download
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '_')}.ics"`);

        res.send(icalContent);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

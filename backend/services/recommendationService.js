import UserInteraction from '../models/UserInteraction.js';
import User from '../models/User.js';
import Event from '../models/Event.js';

/**
 * Track user interaction with an event
 */
export const trackInteraction = async (userId, eventId, type) => {
    try {
        // Check if interaction already exists
        const existing = await UserInteraction.findOne({ userId, eventId, type });

        if (existing) {
            // Update timestamp
            existing.timestamp = new Date();
            await existing.save();
            return existing;
        }

        // Create new interaction
        const interaction = await UserInteraction.create({
            userId,
            eventId,
            type
        });

        // Update user preferences asynchronously
        updateUserPreferences(userId);

        return interaction;
    } catch (error) {
        console.error('Error tracking interaction:', error);
        return null;
    }
};

/**
 * Calculate and update user preferences based on interactions
 */
const updateUserPreferences = async (userId) => {
    try {
        const interactions = await UserInteraction.find({ userId })
            .populate('eventId', 'category');

        const categoryScores = {};

        interactions.forEach(interaction => {
            if (interaction.eventId && interaction.eventId.category) {
                const category = interaction.eventId.category;
                const weight = interaction.weight;

                categoryScores[category] = (categoryScores[category] || 0) + weight;
            }
        });

        // Normalize scores
        const total = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
        if (total > 0) {
            Object.keys(categoryScores).forEach(cat => {
                categoryScores[cat] = categoryScores[cat] / total;
            });
        }

        // Update user preferences
        await User.findByIdAndUpdate(userId, {
            'preferences.categories': categoryScores,
            'preferences.lastUpdated': new Date()
        });
    } catch (error) {
        console.error('Error updating user preferences:', error);
    }
};

/**
 * Calculate Jaccard similarity between two users based on their favorites
 */
const calculateSimilarity = (user1Favorites, user2Favorites) => {
    const set1 = new Set(user1Favorites.map(id => id.toString()));
    const set2 = new Set(user2Favorites.map(id => id.toString()));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
};

/**
 * Find similar users based on favorites
 */
const findSimilarUsers = async (userId, limit = 10) => {
    try {
        const currentUser = await User.findById(userId).select('favorites');
        if (!currentUser || currentUser.favorites.length === 0) {
            return [];
        }

        const allUsers = await User.find({
            _id: { $ne: userId },
            favorites: { $exists: true, $ne: [] }
        }).select('favorites');

        const similarities = allUsers.map(user => ({
            userId: user._id,
            similarity: calculateSimilarity(currentUser.favorites, user.favorites),
            favorites: user.favorites
        }));

        return similarities
            .filter(s => s.similarity > 0)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    } catch (error) {
        console.error('Error finding similar users:', error);
        return [];
    }
};

/**
 * Get personalized event recommendations for a user
 */
export const getRecommendations = async (userId, limit = 10) => {
    try {
        const user = await User.findById(userId).populate('favorites');
        if (!user) return [];

        const userFavoriteIds = user.favorites.map(f => f._id.toString());

        // Get all active upcoming events
        const allEvents = await Event.find({
            isActive: true,
            date: { $gte: new Date() },
            _id: { $nin: user.favorites } // Exclude already favorited
        });

        const eventScores = {};

        // 1. Content-Based Scoring
        allEvents.forEach(event => {
            let score = 0;

            // Category preference
            if (user.preferences && user.preferences.categories) {
                const categoryScore = user.preferences.categories.get(event.category) || 0;
                score += categoryScore * 0.5;
            }

            // Venue preference (if user has favorites from same venue)
            const sameVenueCount = user.favorites.filter(f => f.venue === event.venue).length;
            if (sameVenueCount > 0) {
                score += 0.3;
            }

            eventScores[event._id] = score;
        });

        // 2. Collaborative Filtering
        const similarUsers = await findSimilarUsers(userId, 10);

        similarUsers.forEach(({ similarity, favorites }) => {
            favorites.forEach(favId => {
                const favIdStr = favId.toString();

                // Skip if user already favorited this event
                if (userFavoriteIds.includes(favIdStr)) return;

                // Add collaborative score
                if (eventScores[favIdStr] !== undefined) {
                    eventScores[favIdStr] += similarity * 0.5;
                } else {
                    // Event might not be in allEvents (e.g., past event)
                    // We can still recommend it if it's active
                    eventScores[favIdStr] = similarity * 0.5;
                }
            });
        });

        // 3. Sort by hybrid score and return top N
        const recommendations = allEvents
            .map(event => ({
                event,
                score: eventScores[event._id] || 0
            }))
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(r => r.event);

        return recommendations;
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return [];
    }
};

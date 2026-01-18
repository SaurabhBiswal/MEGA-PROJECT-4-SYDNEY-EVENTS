import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    venue: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        default: 'Free',
    },
    category: {
        type: String,
        enum: ['Music', 'Food', 'Arts', 'Technology', 'Sports', 'Business', 'General', 'Other'],
        default: 'General'
    },
    imageUrl: {
        type: String,
    },
    sourceUrl: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        enum: ['Eventbrite', 'TimeOut', 'Facebook', 'Meetup', 'Manual'],
        default: 'Eventbrite',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    scrapedAt: {
        type: Date,
        default: Date.now,
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true,
});

// Create text index for search
eventSchema.index({ title: 'text', venue: 'text', description: 'text' });

const Event = mongoose.model('Event', eventSchema);
export default Event;

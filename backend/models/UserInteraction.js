import mongoose from 'mongoose';

const userInteractionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['favorite', 'view', 'ticket'],
        required: true
    },
    weight: {
        type: Number,
        default: function () {
            // Assign weights based on interaction type
            switch (this.type) {
                case 'favorite': return 3;
                case 'ticket': return 2;
                case 'view': return 1;
                default: return 1;
            }
        }
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
userInteractionSchema.index({ userId: 1, eventId: 1, type: 1 });

export default mongoose.model('UserInteraction', userInteractionSchema);

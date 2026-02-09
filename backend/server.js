import 'dotenv/config'; // Load env vars before anything else
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import eventRoutes from './routes/events.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import scraperRoutes from './routes/scraper.js';
import chatRoutes from './routes/chat.js';
import cleanupRoutes from './routes/cleanup.js';
import reviewRoutes from './routes/reviews.js';
import reminderRoutes from './routes/reminders.js';
import paymentRoutes from './routes/payments.js';
import './jobs/scheduledScraper.js';
import './jobs/reminderScheduler.js';
import { initTelegramBot } from './services/telegramBot.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.log('Check your MongoDB Atlas Network Access settings (whitelist IP).');
    }
};

connectDB();
initTelegramBot();

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cleanup', cleanupRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reminders', reminderRoutes);
// app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Sydney Events API is running!',
        version: '1.2.1',
        status: 'Hardened'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on 0.0.0.0:${PORT}`);
});

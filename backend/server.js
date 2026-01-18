import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import eventRoutes from './routes/events.js';
import scraperRoutes from './routes/scraper.js';
import chatRoutes from './routes/chat.js';
import cleanupRoutes from './routes/cleanup.js';
import './jobs/scheduledScraper.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on 0.0.0.0:${PORT}`);
});

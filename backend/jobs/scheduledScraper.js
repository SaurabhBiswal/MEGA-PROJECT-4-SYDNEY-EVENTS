import cron from 'node-cron';
import ScraperOrchestrator from '../scrapers/ScraperOrchestrator.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { sendNewEventAlert } from '../services/emailService.js';
import { sendTelegramBroadcast } from '../services/telegramBot.js';

// Schedule scraper to run daily at 2:00 AM
// CRON format: minute hour day month weekday
// '0 2 * * *' = Every day at 2:00 AM
cron.schedule('0 2 * * *', async () => {
    console.log('🕐 [CRON] Running scheduled event scraper...');

    try {
        const orchestrator = new ScraperOrchestrator();
        const scrapedEvents = await orchestrator.scrapeAll();

        let savedCount = 0;

        // Fetch users to notify (In real app, filter for subscribed users)
        const users = await User.find({});

        for (const eventData of scrapedEvents) {
            try {
                // Check if event already exists (by title and date)
                const existingEvent = await Event.findOne({
                    title: eventData.title,
                    date: eventData.date
                });

                if (!existingEvent) {
                    const newEvent = await Event.create(eventData);
                    savedCount++;

                    // Send Email Alert
                    if (users.length > 0) {
                        await sendNewEventAlert(users, newEvent);
                    }

                    // Send Telegram Broadcast
                    await sendTelegramBroadcast(newEvent);
                }
            } catch (err) {
                console.error(`Error saving event: ${eventData.title}`, err.message);
            }
        }

        console.log(`✅ [CRON] Scraper completed. Saved ${savedCount} new events.`);
    } catch (error) {
        console.error('❌ [CRON] Scraper failed:', error.message);
    }
});


console.log('⏰ Scheduled scraper initialized (runs daily at 2:00 AM)');

import TelegramBot from 'node-telegram-bot-api';
import User from '../models/User.js';

let bot = null;

// Initialize Bot
export const initTelegramBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.log('⚠️ Telegram Bot Token not found. Skipping Telegram integration.');
        return;
    }

    // Create a bot that uses 'polling' to fetch new updates
    bot = new TelegramBot(token, { polling: true });
    console.log('Telegram Bot Initialized 🤖');

    // Handle /start command
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const username = msg.chat.username || msg.chat.first_name || 'Event Lover';

        bot.sendMessage(chatId, `Hi ${username}! 👋\nWelcome to EventPulse Sydney Alerts.\n\nYou are now subscribed to receive instant notifications about new events!\n\n/latest - See latest events\n/stop - Unsubscribe`);

        // In a real app, you would link this chatId to a User in DB
        // For now, we'll just log it or rely on broadcasting to all stored users if we add a 'telegramChatId' field
        // But for "Broadcast", we need to store these chat IDs.

        // Let's trying to find a user by some unique code if we had one, 
        // but for this MVP, we will simpler: Just save the ChatID in a separate collection or console log for now.
        // Actually, let's implement a simple "Subscriber" storage for Telegram if we want to broadcast.
        // For the scope of this assignment, we might just focus on the bot responding.

        // IMPROVEMENT: We will simply assume any user who /starts is interested.
        // We will store this chatId in a Set in memory (reset on restart) or DB.
        // To persist, let's update the User model later. For now, let's use runtime Set.
        addSubscriber(chatId);
    });

    bot.onText(/\/stop/, (msg) => {
        const chatId = msg.chat.id;
        removeSubscriber(chatId);
        bot.sendMessage(chatId, 'You have unsubscribed from EventPulse. Bye! 👋');
    });

    // Handle /latest command
    bot.onText(/\/latest/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            const Event = (await import('../models/Event.js')).default;
            const events = await Event.find({
                isActive: true,
                date: { $gte: new Date() } // Only future events
            })
                .sort({ date: 1 })
                .limit(3);

            if (events.length === 0) {
                bot.sendMessage(chatId, 'No upcoming events found at the moment. Check back soon! 📅');
                return;
            }

            let message = '🎉 *Latest Upcoming Events:*\n\n';

            events.forEach((event, index) => {
                message += `${index + 1}. *${event.title}*\n`;
                message += `📅 ${new Date(event.date).toDateString()}\n`;
                message += `📍 ${event.venue}\n`;
                message += `💰 ${event.price || 'Check Info'}\n`;
                message += `[Get Tickets](${event.sourceUrl})\n\n`;
            });

            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Error fetching events for /latest:', error);
            bot.sendMessage(chatId, 'Sorry, there was an error fetching events. Please try again later.');
        }
    });

    bot.on('polling_error', (error) => {
        console.log(`Telegram Polling Error: ${error.code}`);  // Disable verbose logging
    });
};

// Simple In-Memory Store for Chat IDs (Note: Wipes on restart)
// TODO: Move to MongoDB User model for persistence
const subscribers = new Set();

const addSubscriber = (chatId) => {
    subscribers.add(chatId);
    console.log(`New Telegram subscriber: ${chatId}`);
};

const removeSubscriber = (chatId) => {
    subscribers.delete(chatId);
    console.log(`Removed Telegram subscriber: ${chatId}`);
};

// Broadcast to all subscribers
export const sendTelegramBroadcast = async (event) => {
    if (!bot) return;

    const message = `
📣 *NEW EVENT ALERT!* 
*${event.title}*

📅 ${new Date(event.date).toDateString()}
📍 ${event.venue}
💰 ${event.price || 'Check Info'}

[Get Tickets](${event.sourceUrl})
    `;

    console.log(`Broadcasting to ${subscribers.size} Telegram users...`);

    for (const chatId of subscribers) {
        try {
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error(`Failed to send Telegram message to ${chatId}:`, error.message);
        }
    }
};

export const getBot = () => bot;

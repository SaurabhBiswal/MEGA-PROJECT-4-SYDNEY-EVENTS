import EventbriteScraper from '../scrapers/EventbriteScraper.js';
import EventbriteSydneyScraper from '../scrapers/EventbriteSydneyScraper.js';

class ScraperOrchestrator {
    constructor() {
        this.scrapers = [
            new EventbriteSydneyScraper()
        ];
    }

    async scrapeAll() {
        console.log('🚀 [Orchestrator] Starting multi-source scraping...');
        const allEvents = [];

        for (const scraper of this.scrapers) {
            try {
                const events = await scraper.scrapeEvents();
                allEvents.push(...events);
                console.log(`✅ [Orchestrator] ${scraper.constructor.name}: ${events.length} events`);
            } catch (error) {
                console.error(`❌ [Orchestrator] ${scraper.constructor.name} failed:`, error.message);
            }
        }

        // Remove duplicates based on title similarity
        const uniqueEvents = this.deduplicateEvents(allEvents);
        console.log(`🎯 [Orchestrator] Total unique events: ${uniqueEvents.length}`);

        return uniqueEvents;
    }

    deduplicateEvents(events) {
        const seen = new Map();

        return events.filter(event => {
            const key = event.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (seen.has(key)) {
                return false;
            }
            seen.set(key, true);
            return true;
        });
    }
}

export default ScraperOrchestrator;

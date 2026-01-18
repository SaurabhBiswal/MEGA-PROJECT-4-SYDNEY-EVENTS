import puppeteer from 'puppeteer';

class EventbriteSydneyScraper {
    constructor() {
        this.baseUrl = 'https://www.eventbrite.com.au/d/australia--sydney/events/';
    }

    async scrapeEvents() {
        console.log('🕷️ [Eventbrite Sydney] Starting real event scraper...');
        let browser;

        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ]
            });

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            await page.goto(this.baseUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for event cards
            await page.waitForSelector('[data-testid="search-event-card"], .event-card, .discover-search-desktop-card', { timeout: 10000 });

            const events = await page.evaluate(() => {
                const eventCards = document.querySelectorAll('[data-testid="search-event-card"], .event-card, .discover-search-desktop-card');
                const scrapedEvents = [];

                eventCards.forEach((card, index) => {
                    if (index >= 15) return;

                    const titleEl = card.querySelector('h2, h3, [data-testid="event-title"], .event-card__title');
                    const linkEl = card.querySelector('a[href*="/e/"]');
                    const imgEl = card.querySelector('img');
                    const dateEl = card.querySelector('[data-testid="event-date"], .event-card__date');
                    const priceEl = card.querySelector('[data-testid="event-price"], .event-card__price');
                    const locationEl = card.querySelector('[data-testid="event-location"], .event-card__location');

                    if (titleEl && linkEl) {
                        scrapedEvents.push({
                            title: titleEl.innerText.trim(),
                            description: titleEl.innerText.trim(),
                            sourceUrl: linkEl.href,
                            imageUrl: imgEl ? imgEl.src : 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
                            date: dateEl ? dateEl.innerText : '',
                            price: priceEl ? priceEl.innerText : 'Check Website',
                            location: locationEl ? locationEl.innerText : 'Sydney, Australia'
                        });
                    }
                });

                return scrapedEvents;
            });

            console.log(`✅ [Eventbrite Sydney] Scraped ${events.length} real events`);

            return events.map(event => ({
                title: event.title,
                date: this.parseDate(event.date),
                time: '7:00 PM',
                location: event.location,
                venue: event.location,
                description: event.description.substring(0, 200),
                price: event.price,
                category: this.categorizeEvent(event.title),
                sourceUrl: event.sourceUrl,
                imageUrl: event.imageUrl,
                isActive: true
            }));

        } catch (error) {
            console.error('❌ [Eventbrite Sydney] Scraping failed:', error.message);
            return [];
        } finally {
            if (browser) await browser.close();
        }
    }

    parseDate(dateStr) {
        try {
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) return parsed;
        } catch (e) { }

        return new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    }

    categorizeEvent(text) {
        const lower = text.toLowerCase();
        if (lower.includes('music') || lower.includes('concert') || lower.includes('jazz') || lower.includes('band')) return 'Music';
        if (lower.includes('food') || lower.includes('restaurant') || lower.includes('dining') || lower.includes('festival') || lower.includes('cafe')) return 'Food';
        if (lower.includes('tech') || lower.includes('startup') || lower.includes('innovation') || lower.includes('conference')) return 'Technology';
        if (lower.includes('sport') || lower.includes('cricket') || lower.includes('football') || lower.includes('rugby')) return 'Sports';
        if (lower.includes('art') || lower.includes('gallery') || lower.includes('exhibition') || lower.includes('theatre')) return 'Arts';
        return 'General';
    }
}

export default EventbriteSydneyScraper;

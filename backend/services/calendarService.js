import ics from 'ics';

/**
 * Generate iCal file content for an event
 * @param {Object} event - Event object from database
 * @returns {String} iCal file content
 */
export const generateICalFile = (event) => {
    const eventDate = new Date(event.date);

    // ics library expects [year, month, day, hour, minute]
    const start = [
        eventDate.getFullYear(),
        eventDate.getMonth() + 1, // ics uses 1-indexed months
        eventDate.getDate(),
        19, // Default to 7 PM if no time specified
        0
    ];

    const calendarEvent = {
        start,
        duration: { hours: 3 }, // Default 3 hour duration
        title: event.title,
        description: event.description || `Event at ${event.venue}`,
        location: event.venue,
        url: event.sourceUrl,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'EventPulse Sydney', email: 'events@eventpulse.com' }
    };

    const { error, value } = ics.createEvent(calendarEvent);

    if (error) {
        console.error('Error generating iCal:', error);
        throw new Error('Failed to generate calendar file');
    }

    return value;
};

/**
 * Generate Google Calendar URL for an event
 * @param {Object} event - Event object from database
 * @returns {String} Google Calendar URL
 */
export const generateGoogleCalendarUrl = (event) => {
    const eventDate = new Date(event.date);

    // Format: YYYYMMDDTHHmmss
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = formatDate(eventDate);
    const endDate = formatDate(new Date(eventDate.getTime() + 3 * 60 * 60 * 1000)); // +3 hours

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${startDate}/${endDate}`,
        details: event.description || `Event at ${event.venue}`,
        location: event.venue,
        sprop: 'website:eventpulse.com'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

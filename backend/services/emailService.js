import axios from 'axios';

/**
 * SendGrid Web API Helper
 * This bypasses Railway's SMTP port blocks by using HTTPS (Port 443).
 */
const sendEmail = async ({ to, subject, html, bcc }) => {
    if (!process.env.SENDGRID_API_KEY) {
        console.error('CRITICAL: SENDGRID_API_KEY is missing!');
        throw new Error('Email configuration missing');
    }

    const data = {
        personalizations: [
            {
                to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
                subject: subject
            }
        ],
        from: {
            email: process.env.EMAIL_USER || 'punpunsaurabh2002@gmail.com',
            name: 'EventPulse Sydney'
        },
        content: [
            {
                type: 'text/html',
                value: html
            }
        ]
    };

    // Add BCC if provided (useful for event alerts)
    if (bcc && bcc.length > 0) {
        data.personalizations[0].bcc = bcc.map(email => ({ email }));
    }

    try {
        await axios.post('https://api.sendgrid.com/v3/mail/send', data, {
            headers: {
                'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`Email sent successfully to: ${to}`);
        return true;
    } catch (error) {
        const errorDetail = error.response?.data?.errors?.[0]?.message || error.message;
        console.error('SendGrid API Error:', errorDetail);
        throw new Error(`SendGrid API Failed: ${errorDetail}`);
    }
};

// Send Welcome Email
export const sendWelcomeEmail = async (user) => {
    try {
        return await sendEmail({
            to: user.email,
            subject: 'Welcome to EventPulse Sydney! 🎉',
            html: `
                <h1>Welcome, ${user.name}!</h1>
                <p>Thanks for joining EventPulse Sydney. We're excited to help you discover the best events in town.</p>
                <p>You can now save your favorite events and will be the first to know when new concerts, food festivals, or shows are announced!</p>
                <br>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Explore Events</a>
                <br><br>
                <p>Cheers,<br>The EventPulse Team</p>
            `
        });
    } catch (error) {
        console.error('Failed to send welcome email:', error.message);
        return false;
    }
};

// Send New Event Alert
export const sendNewEventAlert = async (users, event) => {
    const emails = users.map(u => u.email);
    if (emails.length === 0) return;

    try {
        return await sendEmail({
            to: emails[0], // SendGrid requires at least one 'to' even with BCC
            bcc: emails.slice(1),
            subject: `New Event: ${event.title} 🎟️`,
            html: `
                <h2>New Event Alert!</h2>
                <img src="${event.imageUrl}" alt="${event.title}" style="max-width: 100%; border-radius: 8px;" />
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${new Date(event.date).toDateString()}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p>${event.description ? event.description.substring(0, 100) + '...' : ''}</p>
                <br>
                <a href="${event.sourceUrl}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Tickets</a>
            `
        });
    } catch (error) {
        console.error('Failed to send event alert:', error.message);
        return false;
    }
};

// Send Ticket Subscription Confirmation
export const sendTicketConfirmationEmail = async (email, event) => {
    try {
        return await sendEmail({
            to: email,
            subject: `Start Booking: ${event.title} 🎟️`,
            html: `
                <h2>You're one step away!</h2>
                <p>You requested tickets for <strong>${event.title}</strong>.</p>
                <img src="${event.imageUrl}" alt="${event.title}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;" />
                <p><strong>Date:</strong> ${new Date(event.date).toDateString()}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p>Click the button below to complete your booking on the official site:</p>
                <br>
                <a href="${event.sourceUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Proceed to Booking</a>
                <br><br>
                <p>Have a great time!<br>The EventPulse Team</p>
            `
        });
    } catch (error) {
        console.error('Failed to send ticket confirmation:', error.message);
        return false;
    }
};

// Send Event Reminder Email
export const sendReminderEmail = async (user, event) => {
    try {
        return await sendEmail({
            to: user.email,
            subject: `Reminder: ${event.title} is coming up! ⏰`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563EB;">Event Reminder ⏰</h2>
                    <p>Hi ${user.name},</p>
                    <p>This is a friendly reminder that <strong>${event.title}</strong> is happening soon!</p>
                    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${event.title}</h3>
                        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${event.time}</p>
                        <p><strong>Venue:</strong> ${event.venue}</p>
                    </div>
                    <p>Don't forget to check your tickets!</p>
                    <p>Best regards,<br>EventPulse Sydney Team</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Failed to send reminder email:', error.message);
        return false;
    }
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (user, resetUrl) => {
    return await sendEmail({
        to: user.email,
        subject: 'Password Reset Request 🔐',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #2563eb; text-align: center;">Password Reset Request</h2>
                <p>Hello ${user.name},</p>
                <p>You are receiving this email because you (or someone else) have requested the reset of a password for your account.</p>
                <p>Please click on the button below to complete the process:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p>This link will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="font-size: 12px; color: #6b7280; text-align: center;">EventPulse Sydney Team</p>
            </div>
        `
    });
};

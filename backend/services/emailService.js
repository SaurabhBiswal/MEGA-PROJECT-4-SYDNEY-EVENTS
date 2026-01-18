import nodemailer from 'nodemailer';

// Create Transporter using Gmail SMTP (or any other service)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_APP_PASSWORD // App Password (not login password)
    }
});

// Send Welcome Email
export const sendWelcomeEmail = async (user) => {
    const mailOptions = {
        from: `"EventPulse Sydney" <${process.env.EMAIL_USER}>`,
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
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

// Send New Event Alert (Broadcasting to a list of users)
export const sendNewEventAlert = async (users, event) => {
    // In production, use BCC or a bulk email service like SendGrid
    // For this demo, we'll loop sequentially (simple but slow for many users)

    // Extract user emails
    const emails = users.map(u => u.email);

    if (emails.length === 0) return;

    const mailOptions = {
        from: `"EventPulse Sydney" <${process.env.EMAIL_USER}>`,
        bcc: emails, // Use BCC to hide recipients from each other
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
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Event alert sent for: ${event.title}`);
        return true;
    } catch (error) {
        console.error('Error sending event alert:', error);
        return false;
    }
};

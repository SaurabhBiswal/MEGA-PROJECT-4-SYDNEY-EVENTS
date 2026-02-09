import nodemailer from 'nodemailer';

// Create Transporter using SendGrid (Professional & Cloud-Friendly)
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // use STARTTLS
    auth: {
        user: 'apikey', // This is always 'apikey' for SendGrid
        pass: process.env.SENDGRID_API_KEY
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000
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

// Send Ticket Subscription Confirmation
export const sendTicketConfirmationEmail = async (email, event) => {
    const mailOptions = {
        from: `"EventPulse Sydney" <${process.env.EMAIL_USER}>`,
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
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Ticket confirmation sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending ticket confirmation:', error);
        return false;
    }
};

// Send Event Reminder Email
export const sendReminderEmail = async (user, event) => {
    const mailOptions = {
        from: `"EventPulse Sydney" <${process.env.EMAIL_USER}>`,
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
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('Error sending reminder email:', error);
        return false;
    }
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (user, resetUrl) => {
    const mailOptions = {
        from: `"EventPulse Sydney" <${process.env.EMAIL_USER}>`,
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
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};

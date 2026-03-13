import nodemailer from 'nodemailer';

// Ethereal is a fake SMTP service mostly aimed at Nodemailer users
export const createTransporter = async () => {
    // If you have real credentials in your env, use them. Otherwise, create a test account.
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Default to ethereal for testing if no config provided
    try {
        const testAccount = await nodemailer.createTestAccount();
        console.log('Sending emails using Ethereal account:', testAccount.user);
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } catch (e) {
        console.error('Failed to create ethereal account for email notifications', e);
        return null;
    }
};

export const getDaysSince = (date: Date | null): number => {
    if (!date) return 0;
    const diff = new Date().getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const isDue = (contact: any): boolean => {
    const today = new Date();

    // Birthday logic
    if (contact.birthday) {
        const bday = new Date(contact.birthday);
        if (!isNaN(bday.getTime())) {
            if (bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate()) return true;
            if (contact.birthday_pre_reminder) {
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                if (bday.getMonth() === tomorrow.getMonth() && bday.getDate() === tomorrow.getDate()) return true;
            }
        }
    }

    // Snooze logic
    if (contact.snoozed_until) {
        const snooze = new Date(contact.snoozed_until);
        if (!isNaN(snooze.getTime()) && snooze > today) return false;
    }

    // Cadence logic
    const days = getDaysSince(contact.last_contacted_at);
    return days >= (contact.cadence_interval_days || 30);
};

export const isBirthdayToday = (birthday: Date | null): boolean => {
    if (!birthday) return false;
    const today = new Date();
    return birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate();
};

export const sendDailySummaryEmail = async (userEmail: string, userName: string, dueContacts: any[]) => {
    if (dueContacts.length === 0) return;

    const transporter = await createTransporter();
    if (!transporter) return;

    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Hi ${userName},</h2>
        <p style="color: #718096; font-size: 16px;">Here is your daily Fika summary. You have <strong>${dueContacts.length}</strong> connection${dueContacts.length === 1 ? '' : 's'} to catch up with today:</p>
        <ul style="list-style-type: none; padding: 0;">
    `;

    dueContacts.forEach(c => {
        const bday = isBirthdayToday(c.birthday);
        const days = getDaysSince(c.last_contacted_at);
        html += `
            <li style="margin-bottom: 20px; padding: 15px; background: #fdfdfd; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; color: #2d3748;">${c.name}</h3>
                <p style="margin: 0; color: #4a5568;">
                    ${bday ? "🎂 It's their birthday today!" : `Last contacted ${days} days ago.`}
                </p>
                ${c.note ? `<p style="margin: 10px 0 0 0; color: #718096; font-size: 14px; font-style: italic;">Note: ${c.note}</p>` : ''}
            </li>
        `;
    });

    html += `
        </ul>
        <p style="margin-top: 30px; font-size: 14px; color: #a0aec0;">
            Stay in touch.<br />
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #3182ce; text-decoration: none;">Open Fika</a>
        </p>
    </div>
    `;

    try {
        const info = await transporter.sendMail({
            from: '"Fika Notifications" <fika@example.com>',
            to: userEmail,
            subject: `Your daily connections (${dueContacts.length}) - Fika`,
            html: html,
        });

        console.log(`Email sent to ${userEmail} (${userName})`);
        if (nodemailer.getTestMessageUrl(info)) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    } catch (e) {
        console.error('Failed to send mail', e);
    }
};

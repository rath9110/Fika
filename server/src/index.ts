import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../prisma/generated/client';
import { isDue, sendDailySummaryEmail } from './services/email';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fika-jwt-fallback';

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

app.get('/api/fs', (req, res) => {
    try {
        const rootDir = process.cwd();
        const getFiles = (dir: string): string[] => {
            let results: string[] = [];
            try {
                const list = fs.readdirSync(dir);
                list.forEach((file) => {
                    if (file === 'node_modules' || file === '.git' || file === 'prisma') return;
                    const fullPath = path.join(dir, file);
                    const stat = fs.statSync(fullPath);
                    if (stat && stat.isDirectory()) {
                        results = results.concat(getFiles(fullPath));
                    } else {
                        results.push(fullPath.replace(process.cwd(), ''));
                    }
                });
            } catch (e) { }
            return results;
        };
        res.json({ cwd: rootDir, files: getFiles(rootDir) });
    } catch (e: any) {
        res.json({ error: e.message });
    }
});

// ─── PASSPORT (no sessions — JWT only) ────────────────────────────────────────
app.use(passport.initialize());

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const user = await prisma.user.upsert({
                    where: { googleId: profile.id },
                    update: {
                        name: profile.displayName,
                        avatar: profile.photos?.[0]?.value,
                    },
                    create: {
                        googleId: profile.id,
                        email: profile.emails?.[0]?.value || '',
                        name: profile.displayName,
                        avatar: profile.photos?.[0]?.value,
                    },
                });
                return done(null, user);
            } catch (err) {
                return done(err as Error);
            }
        }
    ));
} else {
    console.warn("Skipping GoogleStrategy initialization: Missing credentials.");
}

// ─── JWT AUTH MIDDLEWARE ───────────────────────────────────────────────────────
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        (req as any).user = user;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?auth_error=true` }),
    (req, res) => {
        const user = req.user as any;
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}?token=${token}`);
    }
);

app.get('/auth/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.json(null);
        return;
    }
    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) { res.json(null); return; }
        const { id, name, email, avatar, emailNotifications } = user;
        res.json({ id, name, email, avatar, emailNotifications });
    } catch {
        res.json(null);
    }
});

app.put('/api/user/settings', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const { emailNotifications } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { emailNotifications: !!emailNotifications }
        });
        res.json(user);
    } catch {
        res.status(500).json({ error: 'Failed to update user settings' });
    }
});

// ─── CONTACTS API ─────────────────────────────────────────────────────────────
app.get('/api/contacts', requireAuth, async (req, res) => {
    try {
        const userId = (req.user as any).id;
        const contacts = await prisma.contact.findMany({
            where: { userId },
            include: { interactions: true },
            orderBy: { updatedAt: 'desc' },
        });
        res.json(contacts);
    } catch {
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

app.post('/api/contacts', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const { name, cadence_interval_days, birthday, birthday_pre_reminder, snoozed_until, snooze_count, note } = req.body;
    try {
        const contact = await prisma.contact.create({
            data: {
                userId,
                name: name || 'Unknown',
                cadence_interval_days: Number(cadence_interval_days) || 30,
                last_contacted_at: new Date(),
                birthday: birthday ? new Date(birthday) : null,
                birthday_pre_reminder: !!birthday_pre_reminder,
                snoozed_until: snoozed_until ? new Date(snoozed_until) : null,
                snooze_count: typeof snooze_count === 'number' ? snooze_count : 0,
                note: note || null,
            },
        });
        res.status(201).json(contact);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create contact' });
    }
});

app.put('/api/contacts/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = (req.user as any).id;
    const { name, cadence_interval_days, last_contacted_at, birthday, birthday_pre_reminder, snoozed_until, snooze_count, note } = req.body;
    try {
        const contact = await prisma.contact.updateMany({
            where: { id: String(id), userId },
            data: {
                name,
                cadence_interval_days: Number(cadence_interval_days) || 30,
                last_contacted_at: last_contacted_at ? new Date(last_contacted_at) : undefined,
                birthday: birthday ? new Date(birthday) : null,
                birthday_pre_reminder: !!birthday_pre_reminder,
                snoozed_until: snoozed_until === null ? null : (snoozed_until ? new Date(snoozed_until) : undefined),
                snooze_count: typeof snooze_count === 'number' ? snooze_count : undefined,
                note: note || null,
            },
        });
        res.json(contact);
    } catch {
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

app.delete('/api/contacts/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = (req.user as any).id;
    try {
        await prisma.contact.deleteMany({ where: { id: String(id), userId } });
        res.json({ ok: true });
    } catch {
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// ─── INTERACTIONS API ─────────────────────────────────────────────────────────
app.post('/api/interactions', requireAuth, async (req, res) => {
    const { contactId, type, notes } = req.body;
    const userId = (req.user as any).id;
    try {
        // Ensure the contact belongs to this user
        const contact = await prisma.contact.findFirst({ where: { id: contactId, userId } });
        if (!contact) return res.status(403).json({ error: 'Forbidden' });

        const interaction = await prisma.interaction.create({
            data: { contactId, type, notes },
        });

        await prisma.contact.update({
            where: { id: contactId },
            data: { last_contacted_at: new Date() },
        });

        res.status(201).json(interaction);
    } catch {
        res.status(500).json({ error: 'Failed to log interaction' });
    }
});

// ─── IMPORT (migrate localStorage contacts) ───────────────────────────────────
app.post('/api/contacts/import', requireAuth, async (req, res) => {
    const userId = (req.user as any).id;
    const { contacts } = req.body as { contacts: any[] };
    if (!Array.isArray(contacts)) return res.status(400).json({ error: 'contacts must be an array' });

    try {
        const created = await prisma.$transaction(
            contacts.map((c) =>
                prisma.contact.create({
                    data: {
                        userId,
                        name: c.name || 'Unknown',
                        cadence_interval_days: Number(c.cadence_interval_days) || 30,
                        last_contacted_at: c.last_contacted_at ? new Date(c.last_contacted_at) : new Date(),
                        birthday: c.birthday ? new Date(c.birthday) : null,
                        birthday_pre_reminder: !!c.birthday_pre_reminder,
                        snoozed_until: c.snoozed_until ? new Date(c.snoozed_until) : null,
                        snooze_count: typeof c.snooze_count === 'number' ? c.snooze_count : 0,
                        note: c.note || null,
                    },
                })
            )
        );
        res.status(201).json(created);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to import contacts' });
    }
});

// ─── CRON JOB ─────────────────────────────────────────────────────────────
// This should ideally be protected via an auth secret from the cron provider
app.get('/api/cron/daily-emails', async (req, res) => {
    // Basic protection to prevent random hits
    const cronSecret = req.headers.authorization;
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        res.status(401).json({ error: 'Unauthorized cron trigger' });
        return;
    }

    try {
        // Find users with notifications enabled and their contacts
        const users = await prisma.user.findMany({
            where: { emailNotifications: true },
            include: { contacts: true }
        });

        let sentCount = 0;
        for (const user of users) {
            // Filter contacts that are actually due
            const dueContacts = user.contacts.filter((c: any) => isDue(c));
            if (dueContacts.length > 0) {
                await sendDailySummaryEmail(user.email, user.name, dueContacts);
                sentCount++;
            }
        }

        res.json({ ok: true, message: `Sent emails to ${sentCount} users.` });
    } catch (e) {
        console.error('Cron job error:', e);
        res.status(500).json({ error: 'Failed to run daily emails' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// ─── SESSION ──────────────────────────────────────────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET || 'fika-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true in production with HTTPS
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
}));

// ─── PASSPORT ─────────────────────────────────────────────────────────────────
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `http://localhost:${PORT}/auth/google/callback`,
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

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.use(passport.initialize());
app.use(passport.session());

// ─── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Not authenticated' });
};

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/auth?error=true` }),
    (_req, res) => {
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
    }
);

app.get('/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
        const { id, name, email, avatar } = req.user as any;
        res.json({ id, name, email, avatar });
    } else {
        res.json(null);
    }
});

app.post('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ ok: true });
    });
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
    const { name, cadence_interval_days, last_contacted_at, birthday, birthday_pre_reminder, snoozed_until, note } = req.body;
    try {
        const contact = await prisma.contact.create({
            data: {
                userId,
                name,
                cadence_interval_days: Number(cadence_interval_days) || 30,
                last_contacted_at: last_contacted_at ? new Date(last_contacted_at) : new Date(),
                birthday: birthday ? new Date(birthday) : null,
                birthday_pre_reminder: !!birthday_pre_reminder,
                snoozed_until: snoozed_until ? new Date(snoozed_until) : null,
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
    const { name, cadence_interval_days, last_contacted_at, birthday, birthday_pre_reminder, snoozed_until, note } = req.body;
    try {
        const contact = await prisma.contact.updateMany({
            where: { id, userId },
            data: {
                name,
                cadence_interval_days: Number(cadence_interval_days) || 30,
                last_contacted_at: last_contacted_at ? new Date(last_contacted_at) : undefined,
                birthday: birthday ? new Date(birthday) : null,
                birthday_pre_reminder: !!birthday_pre_reminder,
                snoozed_until: snoozed_until ? new Date(snoozed_until) : null,
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
        await prisma.contact.deleteMany({ where: { id, userId } });
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

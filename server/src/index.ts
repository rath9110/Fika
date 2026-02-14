import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Contacts API
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await prisma.contact.findMany({
            include: { interactions: true },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

app.post('/api/contacts', async (req, res) => {
    const { name, tier, notes, hooks, lastFika } = req.body;
    try {
        const contact = await prisma.contact.create({
            data: {
                name,
                tier,
                notes,
                hooks: hooks || {},
                lastFika: lastFika ? new Date(lastFika) : null
            }
        });
        res.status(201).json(contact);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create contact' });
    }
});

app.put('/api/contacts/:id', async (req, res) => {
    const { id } = req.params;
    const { tier, lastFika, notes, hooks } = req.body;
    try {
        const contact = await prisma.contact.update({
            where: { id },
            data: {
                tier,
                notes,
                hooks,
                lastFika: lastFika ? new Date(lastFika) : undefined
            }
        });
        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

// Interactions API
app.post('/api/interactions', async (req, res) => {
    const { contactId, type, notes } = req.body;
    try {
        const interaction = await prisma.interaction.create({
            data: { contactId, type, notes }
        });

        // Also update the contact's lastFika
        await prisma.contact.update({
            where: { id: contactId },
            data: { lastFika: new Date() }
        });

        res.status(201).json(interaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to log interaction' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

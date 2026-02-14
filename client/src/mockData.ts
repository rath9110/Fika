import type { Contact, Tier } from './types'

export const TIERS: Tier[] = [
    { id: 'daily', name: 'Daily Espresso', description: 'Immediate circle', color: 'bg-fika-600', cadenceInDays: 1 },
    { id: 'weekly', name: 'Weekly Brew', description: 'Close circle', color: 'bg-brew', cadenceInDays: 7 },
    { id: 'monthly', name: 'Monthly Sit-down', description: 'Extended friends', color: 'bg-fika-400', cadenceInDays: 30 },
    { id: 'quarterly', name: 'Quarterly Catch-up', description: 'Dormant circle', color: 'bg-fika-200', cadenceInDays: 90 },
];

export const MOCK_CONTACTS: Contact[] = [
    {
        id: '1',
        name: 'Sarah (Partner)',
        tier: 'daily',
        lastFika: new Date().toISOString(),
        hooks: { lastLaugh: 'The pancake incident' }
    },
    {
        id: '2',
        name: 'David (Best Friend)',
        tier: 'weekly',
        lastFika: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        hooks: { hobbies: ['Bouldering', 'Chess'], pets: 'Luna (Husky)' }
    },
    {
        id: '3',
        name: 'Mom',
        tier: 'weekly',
        lastFika: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '4',
        name: 'Marcus (Mentor)',
        tier: 'monthly',
        lastFika: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        hooks: { health: 'Recovering from knee surgery' }
    },
];

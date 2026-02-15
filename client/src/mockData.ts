import type { Contact } from './types'

export const MOCK_CONTACTS: Contact[] = [
    {
        id: '1',
        name: 'Sarah',
        cadence_interval_days: 1,
        last_contacted_at: new Date().toISOString(),
        birthday_pre_reminder: true,
        note: 'Partner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'David',
        cadence_interval_days: 7,
        last_contacted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        birthday_pre_reminder: false,
        note: 'Best friend',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

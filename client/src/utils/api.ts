import type { Contact } from '../types';

const STORAGE_KEY = 'fika_contacts_v2';

export const fetchContacts = async (): Promise<Contact[]> => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : [];

        if (!Array.isArray(data)) return [];

        // Migration/Sanitization
        return data.map((c: any) => ({
            id: c.id || Math.random().toString(36).substr(2, 9),
            name: c.name || 'Unknown',
            cadence_interval_days: Number(c.cadence_interval_days) || 30,
            last_contacted_at: c.last_contacted_at || new Date().toISOString(),
            birthday: c.birthday || undefined,
            birthday_pre_reminder: !!c.birthday_pre_reminder,
            snoozed_until: c.snoozed_until || null,
            note: c.note || '',
            created_at: c.created_at || new Date().toISOString(),
            updated_at: c.updated_at || new Date().toISOString()
        }));
    } catch (e) {
        return [];
    }
};

export const saveContacts = async (contacts: Contact[]): Promise<void> => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
};

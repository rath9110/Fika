import type { Contact } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Serialise a Contact (frontend shape) to the shape the server expects
const toServer = (c: Partial<Contact>) => ({
    name: c.name,
    cadence_interval_days: c.cadence_interval_days,
    last_contacted_at: c.last_contacted_at,
    birthday: c.birthday || null,
    birthday_pre_reminder: c.birthday_pre_reminder,
    snoozed_until: c.snoozed_until || null,
    note: c.note || null,
});

// Serialise a server row back to the frontend Contact shape
const fromServer = (c: any): Contact => ({
    id: c.id,
    name: c.name,
    cadence_interval_days: c.cadence_interval_days,
    last_contacted_at: c.last_contacted_at,
    birthday: c.birthday ?? undefined,
    birthday_pre_reminder: c.birthday_pre_reminder,
    snoozed_until: c.snoozed_until ?? null,
    note: c.note ?? undefined,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
});

export const fetchContacts = async (): Promise<Contact[]> => {
    try {
        const res = await fetch(`${API}/api/contacts`, { credentials: 'include' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data.map(fromServer) : [];
    } catch {
        return [];
    }
};

export const createContact = async (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> => {
    const res = await fetch(`${API}/api/contacts`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toServer(data)),
    });
    return fromServer(await res.json());
};

export const updateContact = async (id: string, data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    await fetch(`${API}/api/contacts/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toServer(data)),
    });
};

export const deleteContact = async (id: string): Promise<void> => {
    await fetch(`${API}/api/contacts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
};

// Kept for backward compat (no-op — server saves automatically)
export const saveContacts = async (_contacts: Contact[]): Promise<void> => { };

import type { Contact } from '../types';

const API_BASE = 'http://localhost:5000/api';

export const fetchContacts = async (): Promise<Contact[]> => {
    try {
        const res = await fetch(`${API_BASE}/contacts`);
        if (!res.ok) throw new Error('API down');
        return await res.json();
    } catch (e) {
        console.warn('Using fallback mock data');
        throw e;
    }
};

export const createContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    const res = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
    });
    return await res.json();
};

export const updateContact = async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    const res = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return await res.json();
};

export const logFikaInteraction = async (contactId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, type: 'fika' }),
    });
    return await res.json();
};

import type { Contact } from '../types';

export const getDaysSince = (dateString: string): number => {
    if (!dateString) return 0;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 0;
    const diff = new Date().getTime() - d.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const isDue = (contact: Contact): boolean => {
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

export const isBirthdayToday = (birthday?: string): boolean => {
    if (!birthday) return false;
    const d = new Date(birthday);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
};

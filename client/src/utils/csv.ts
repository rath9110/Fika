import type { Contact, TierId } from '../types';

export const parseCSV = (csv: string): Omit<Contact, 'id'>[] => {
    const lines = csv.split('\n');
    const result: Omit<Contact, 'id'>[] = [];

    // Basic CSV parsing (assuming Name, Tier, Last Laugh)
    for (let i = 1; i < lines.length; i++) {
        const [name, tier, lastLaugh] = lines[i].split(',');
        if (name && tier) {
            result.push({
                name: name.trim(),
                tier: (tier.trim().toLowerCase() as TierId) || 'weekly',
                lastFika: new Date().toISOString(),
                hooks: { lastLaugh: lastLaugh?.trim() }
            });
        }
    }

    return result;
};

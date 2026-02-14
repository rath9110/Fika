export type TierId = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface Contact {
    id: string;
    name: string;
    tier: TierId;
    lastFika?: string; // ISO string
    notes?: string;
    hooks?: {
        pets?: string;
        health?: string;
        hobbies?: string[];
        lastLaugh?: string;
    };
}

export interface Tier {
    id: TierId;
    name: string;
    description: string;
    color: string;
    cadenceInDays: number;
}

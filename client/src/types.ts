export interface Contact {
    id: string;
    name: string;
    cadence_interval_days: number;
    last_contacted_at: string;
    birthday?: string;
    birthday_pre_reminder: boolean;
    snoozed_until?: string | null;
    note?: string;
    created_at: string;
    updated_at: string;
}

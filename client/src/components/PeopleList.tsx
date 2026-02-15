import React from 'react';
import type { Contact } from '../types';
import { getDaysSince, isDue, isBirthdayToday } from '../utils/date';

interface Props {
    contacts: Contact[];
    onSelect: (c: Contact) => void;
}

const PeopleList: React.FC<Props> = ({ contacts, onSelect }) => {
    const sortedByDue = [...contacts].sort((a, b) => {
        const aDueIn = (a.cadence_interval_days || 30) - getDaysSince(a.last_contacted_at);
        const bDueIn = (b.cadence_interval_days || 30) - getDaysSince(b.last_contacted_at);
        return aDueIn - bDueIn;
    });

    if (contacts.length === 0) {
        return (
            <div className="py-32 text-center animate-in">
                <div className="w-24 h-24 bg-fika-100/30 rounded-full flex items-center justify-center mx-auto mb-8 text-fika-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <p className="text-fika-500 font-bold text-xl leading-relaxed max-w-xs mx-auto">Start by adding the people who matter most to you.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in font-sans">
            <h2 className="text-[11px] font-black text-fika-300 uppercase tracking-[0.25em] px-2">Your People</h2>
            <div className="bg-white rounded-[3rem] border border-fika-50 overflow-hidden shadow-soft divide-y divide-fika-50">
                {sortedByDue.map((c) => {
                    const daysSince = getDaysSince(c.last_contacted_at);
                    const needsContact = isDue(c);
                    const isBday = isBirthdayToday(c.birthday);

                    return (
                        <button
                            key={c.id}
                            onClick={() => onSelect(c)}
                            className="w-full flex justify-between items-center p-8 text-left hover:bg-fika-50/50 transition-colors group relative overflow-hidden"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black text-fika-900 group-hover:text-fika-700 transition-colors tracking-tight">{c.name}</h3>
                                    {(needsContact || isBday) && (
                                        <div className={`w-2.5 h-2.5 rounded-full ${isBday ? 'bg-orange-400' : 'bg-fika-500 shadow-sm'}`} title={isBday ? 'Birthday' : 'Ready to connect'} />
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-fika-400 font-bold uppercase tracking-wider">Every {c.cadence_interval_days} days</p>
                                    <span className="text-fika-100">•</span>
                                    <p className="text-sm text-fika-400 font-bold uppercase tracking-wider">Last {daysSince}d ago</p>
                                </div>
                            </div>

                            <div className="shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                <div className="w-12 h-12 bg-fika-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                </div>
                            </div>

                            {/* Subtle hover indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 transform scale-y-0 group-hover:scale-y-100 
                ${isBday ? 'bg-orange-400' : 'bg-fika-900'}`} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PeopleList;

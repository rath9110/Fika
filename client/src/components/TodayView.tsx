import React from 'react';
import type { Contact } from '../types';
import { getDaysSince, isDue, isBirthdayToday } from '../utils/date';

interface Props {
    contacts: Contact[];
    onConnect: (id: string) => void;
    onSnooze: (id: string) => void;
}

const TodayView: React.FC<Props> = ({ contacts, onConnect, onSnooze }) => {
    const due = contacts.filter(isDue);

    if (due.length === 0) {
        return (
            <div className="py-8 md:py-12 text-center animate-in">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-fika-100/30 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-fika-300"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-fika-900 tracking-tight">You’re up to date.</h2>
                <p className="text-fika-500 mt-2 md:mt-3 font-medium text-base md:text-lg leading-relaxed max-w-sm mx-auto">Everyone has been reached out to recently - nice work!</p>
            </div>
        );
    }

    return (
        <div className="animate-in font-sans">
            <h2 className="text-[11px] font-black text-fika-300 uppercase tracking-[0.25em] px-2 sticky top-0 bg-cream z-20 py-6 mb-2">Today’s Connections</h2>
            <div className="space-y-4 md:space-y-6">
                {due.map(c => {
                    const isBday = isBirthdayToday(c.birthday);
                    const days = getDaysSince(c.last_contacted_at);

                    return (
                        <div
                            key={c.id}
                            className={`bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 border shadow-soft card-interactive relative overflow-hidden group 
                ${isBday ? 'border-orange-100 bg-gradient-to-br from-white to-orange-50/20' : 'border-fika-50'}`}
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-black text-fika-900 tracking-tight leading-none mb-3 md:mb-4">{c.name}</h3>
                                        <div className="space-y-1">
                                            <p className="text-lg text-fika-600 font-bold leading-snug">
                                                {isBday
                                                    ? `It’s ${c.name}’s birthday today.`
                                                    : `It might feel good to reach out to ${c.name}.`}
                                            </p>
                                            <p className="text-sm text-fika-400 font-bold uppercase tracking-wider">
                                                {isBday ? 'Maybe reach out to celebrate?' : `Last contact ${days} days ago.`}
                                            </p>
                                        </div>
                                    </div>
                                    {isBday && (
                                        <span className="bg-orange-100 text-orange-600 p-3 rounded-2xl animate-pulse shrink-0 rotate-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 mt-6 md:mt-8">
                                    <button
                                        onClick={() => onConnect(c.id)}
                                        className="w-full bg-fika-900 text-white font-black py-4 md:py-5 px-8 rounded-2xl btn-interactive shadow-xl shadow-fika-100 text-lg flex items-center justify-center gap-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                                        Connected today
                                    </button>
                                    <button
                                        onClick={() => onSnooze(c.id)}
                                        className="w-full bg-fika-50 text-fika-600 font-black py-4 md:py-5 px-8 rounded-2xl btn-interactive hover:bg-fika-100/80 text-lg"
                                    >
                                        Remind me tomorrow
                                    </button>
                                </div>
                            </div>

                            {isBday && (
                                <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-orange-100/20 rounded-full blur-3xl" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TodayView;

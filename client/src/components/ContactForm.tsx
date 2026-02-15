import React, { useState } from 'react';
import type { Contact } from '../types';

interface Props {
    contact?: Contact;
    onSave: (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => void;
    onDelete?: (id: string) => void;
    onClose: () => void;
}

const ContactForm: React.FC<Props> = ({ contact, onSave, onDelete, onClose }) => {
    const [name, setName] = useState(contact?.name || '');
    const [days, setDays] = useState(contact?.cadence_interval_days || 30);
    const [note, setNote] = useState(contact?.note || '');

    return (
        <div className="fixed inset-0 bg-espresso/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full zoom-in shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-fika-200 hover:text-fika-900 transition-colors btn-interactive"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>

                <h2 className="text-3xl font-black text-fika-900 mb-8 tracking-tight">
                    {contact ? 'Edit profile' : 'Add Someone'}
                </h2>

                <form onSubmit={e => {
                    e.preventDefault();
                    onSave({
                        name,
                        cadence_interval_days: days,
                        last_contacted_at: contact?.last_contacted_at || new Date().toISOString(),
                        birthday_pre_reminder: true,
                        note: note || undefined,
                        snoozed_until: contact?.snoozed_until || null
                    });
                }} className="space-y-8">

                    <div className="space-y-2">
                        <label className="text-xs font-black text-fika-400 uppercase tracking-widest ml-1">Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Name"
                            className="w-full p-5 bg-fika-50 border-none rounded-2xl font-bold text-fika-900 focus:ring-4 focus:ring-fika-100 transition-all outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-fika-400 uppercase tracking-widest ml-1">Check-in Frequency</label>
                        <div className="flex items-center gap-4 bg-fika-50 p-2 rounded-2xl border border-fika-100/50">
                            <span className="text-sm font-bold text-fika-600 pl-4 whitespace-nowrap">Every</span>
                            <input
                                type="number"
                                value={days || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    setDays(val === '' ? 0 : Number(val));
                                }}
                                className="w-full p-4 bg-white border border-fika-100 rounded-xl text-center font-black text-xl text-fika-900 shadow-sm focus:ring-2 focus:ring-fika-50 outline-none"
                                min="1"
                            />
                            <span className="text-sm font-bold text-fika-600 pr-4">days</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-fika-400 uppercase tracking-widest ml-1">Why they matter</label>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="A short note..."
                            className="w-full p-5 bg-fika-50 border-none rounded-2xl font-medium text-fika-900 focus:ring-4 focus:ring-fika-100 transition-all outline-none resize-none h-28"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-fika-300 hover:text-fika-500 transition-colors">Cancel</button>
                        <button type="submit" className="flex-[2] bg-fika-900 text-white py-5 rounded-[1.25rem] font-black shadow-xl shadow-fika-200 btn-interactive">SAVE</button>
                    </div>

                    {contact && onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(contact.id)}
                            className="w-full text-red-400 font-bold text-sm pt-4 hover:text-red-500 transition-colors active:scale-95"
                        >
                            DELETE CONTACT
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ContactForm;

import React, { useState } from 'react';
import type { TierId, Contact } from '../types';
import { TIERS } from '../mockData';

interface ContactFormProps {
    onAdd: (contact: Omit<Contact, 'id'>) => void;
    onClose: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onAdd, onClose }) => {
    const [name, setName] = useState('');
    const [tier, setTier] = useState<TierId>('weekly');
    const [lastLaugh, setLastLaugh] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd({
            name,
            tier,
            lastFika: new Date().toISOString(),
            hooks: { lastLaugh }
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-espresso/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-float">
                <h2 className="text-2xl font-bold text-fika-900 mb-6 font-sans">New Connection</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-fika-800 mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-fika-50 border border-fika-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fika-300"
                            placeholder="Who are we connecting with?"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-fika-800 mb-2">Ritual Cadence</label>
                        <div className="grid grid-cols-2 gap-3">
                            {TIERS.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTier(t.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tier === t.id ? 'bg-fika-600 text-white shadow-lg' : 'bg-fika-50 text-fika-600 hover:bg-fika-100'
                                        }`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-fika-800 mb-2">Memory Hook (Optional)</label>
                        <input
                            type="text"
                            value={lastLaugh}
                            onChange={(e) => setLastLaugh(e.target.value)}
                            className="w-full bg-fika-50 border border-fika-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fika-300"
                            placeholder="The last thing we laughed about..."
                        />
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" className="btn-primary flex-1">Save Profile</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactForm;

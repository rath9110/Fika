import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LS_KEY = 'fika_contacts_v2';

interface Props { onClose: () => void; }

const AccountView: React.FC<Props> = ({ onClose }) => {
    const { user, logout } = useAuth();
    const [importing, setImporting] = useState(false);
    const [imported, setImported] = useState(false);

    const localContacts = (() => {
        try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : []; }
        catch { return []; }
    })();

    const handleImport = async () => {
        setImporting(true);
        try {
            await fetch(`${API}/api/contacts/import`, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contacts: localContacts }),
            });
            localStorage.removeItem(LS_KEY);
            setImported(true);
        } catch { /* fail silently */ } finally { setImporting(false); }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[200] flex flex-col justify-end"
            onClick={onClose}
        >
            {/* Dimmed overlay */}
            <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" />

            {/* Sheet */}
            <div
                className="relative bg-cream rounded-t-[2.5rem] px-6 pt-5 pb-12 max-w-2xl w-full mx-auto shadow-ritual flex flex-col gap-5"
                style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle */}
                <div className="w-10 h-1 bg-fika-200 rounded-full mx-auto mb-1" />

                {user ? (
                    <>
                        {/* User row */}
                        <div className="bg-white rounded-[2rem] p-6 flex items-center gap-4 shadow-soft border border-fika-100/50">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-[1.25rem] object-cover shadow-md ring-2 ring-fika-100 shrink-0" />
                            ) : (
                                <div className="w-16 h-16 rounded-[1.25rem] bg-fika-100 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fika-400">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-fika-300 uppercase tracking-widest mb-0.5">Signed in</p>
                                <h2 className="text-lg font-black text-fika-900 truncate">{user.name}</h2>
                                <p className="text-sm text-fika-400 truncate">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="w-2 h-2 bg-green-400 rounded-full" />
                                <span className="text-xs font-black text-green-700">Syncing</span>
                            </div>
                        </div>

                        {/* Import local contacts */}
                        {localContacts.length > 0 && !imported && (
                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className="w-full py-5 bg-white border-2 border-fika-100 text-fika-700 font-black rounded-[1.25rem] btn-interactive shadow-soft disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                {importing ? 'Importing…' : `Import ${localContacts.length} local contacts`}
                            </button>
                        )}

                        {imported && (
                            <div className="bg-green-50 border border-green-100 rounded-[1.25rem] p-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-green-500 rounded-[0.625rem] flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4" /></svg>
                                </span>
                                <p className="text-sm font-black text-green-800">Contacts imported and syncing!</p>
                            </div>
                        )}

                        {/* Sign out */}
                        <button
                            onClick={async () => { await logout(); onClose(); }}
                            className="w-full py-5 bg-fika-900 text-white font-black rounded-[1.5rem] shadow-2xl shadow-fika-200 btn-interactive"
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        {/* Hero */}
                        <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center gap-3 shadow-soft border border-fika-100/50 text-center">
                            <div className="w-16 h-16 bg-fika-900 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-fika-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-fika-900">Sync across devices</h2>
                                <p className="text-sm text-fika-400 mt-1 leading-relaxed">Sign in and your contacts follow you everywhere.</p>
                            </div>
                        </div>

                        {/* Google sign-in — same dark CTA style as "+" button */}
                        <button
                            id="google-signin-btn"
                            onClick={() => { window.location.href = `${API}/auth/google`; }}
                            className="w-full py-5 bg-fika-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-fika-200 btn-interactive flex items-center justify-center gap-3"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <p className="text-center text-xs text-fika-300 font-medium leading-relaxed">
                            Only your name, email, and contacts are stored.
                        </p>
                    </>
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AccountView;

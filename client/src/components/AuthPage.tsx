import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LS_KEY = 'fika_contacts_v2';

const AuthPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user, logout } = useAuth();
    const [importing, setImporting] = useState(false);
    const [imported, setImported] = useState(false);

    const localContacts = (() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    })();

    const handleImport = async () => {
        setImporting(true);
        try {
            await fetch(`${API}/api/contacts/import`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contacts: localContacts }),
            });
            localStorage.removeItem(LS_KEY);
            setImported(true);
        } catch {
            // fail silently, user can retry
        } finally {
            setImporting(false);
        }
    };

    const handleSignIn = () => {
        window.location.href = `${API}/auth/google`;
    };

    const handleSignOut = async () => {
        await logout();
    };

    return (
        <div className="fixed inset-0 bg-espresso/60 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-4 animate-in">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full zoom-in shadow-2xl relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-fika-200 hover:text-fika-900 transition-colors btn-interactive"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>

                {user ? (
                    /* ── Signed-In State ───────────────────────────────── */
                    <div className="flex flex-col items-center text-center gap-6">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-20 h-20 rounded-full shadow-xl ring-4 ring-fika-100"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-fika-100 flex items-center justify-center shadow-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fika-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                        )}

                        <div>
                            <p className="text-xs font-black text-fika-300 uppercase tracking-widest mb-1">Signed in as</p>
                            <h2 className="text-2xl font-black text-fika-900 tracking-tight">{user.name}</h2>
                            <p className="text-sm text-fika-400 mt-1">{user.email}</p>
                        </div>

                        <div className="w-full space-y-3">
                            {/* Import local contacts */}
                            {localContacts.length > 0 && !imported && (
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="w-full py-4 bg-fika-50 hover:bg-fika-100 text-fika-700 font-black rounded-2xl transition-all text-sm btn-interactive disabled:opacity-50"
                                >
                                    {importing
                                        ? 'Importing...'
                                        : `Import ${localContacts.length} contacts from this device`}
                                </button>
                            )}
                            {imported && (
                                <p className="text-sm font-bold text-green-600 bg-green-50 rounded-2xl py-3 px-4 text-center">
                                    ✓ {localContacts.length} contacts imported and synced!
                                </p>
                            )}

                            <button
                                onClick={handleSignOut}
                                className="w-full py-4 bg-fika-900 text-white font-black rounded-2xl shadow-xl shadow-fika-200 btn-interactive"
                            >
                                Sign out
                            </button>
                        </div>

                        <p className="text-xs text-fika-200 leading-relaxed">
                            Your contacts sync across all signed-in devices automatically.
                        </p>
                    </div>
                ) : (
                    /* ── Signed-Out State ──────────────────────────────── */
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="w-20 h-20 rounded-[1.75rem] bg-fika-900 flex items-center justify-center shadow-2xl shadow-fika-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-fika-900 tracking-tight">Sync your contacts</h2>
                            <p className="text-sm text-fika-400 mt-2 leading-relaxed">
                                Sign in to access your contacts on every device.
                            </p>
                        </div>

                        <button
                            onClick={handleSignIn}
                            id="google-signin-btn"
                            className="w-full py-4 bg-white border-2 border-fika-100 hover:border-fika-200 text-fika-900 font-black rounded-2xl transition-all flex items-center justify-center gap-3 btn-interactive shadow-md"
                        >
                            {/* Google 'G' logo */}
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <p className="text-xs text-fika-200 leading-relaxed">
                            We only store your name, email, and contacts. Nothing else.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;

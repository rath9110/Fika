import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { useState, useEffect } from 'react'
import TodayView from './components/TodayView'
import PeopleList from './components/PeopleList'
import ContactForm from './components/ContactForm'
import AuthPage from './components/AuthPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { Contact } from './types'
import { fetchContacts, createContact, updateContact, deleteContact } from './utils/api'

const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
    try {
        await Haptics.impact({ style });
    } catch {
        // Fallback for web
    }
}

function AppContent() {
    const { user, loading } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [view, setView] = useState<'today' | 'people'>('today');
    const [showModal, setShowModal] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [editing, setEditing] = useState<Contact | undefined>();
    const [toast, setToast] = useState<{ msg: string; exiting: boolean } | null>(null);

    // Load contacts from backend when user signs in
    useEffect(() => {
        if (user) {
            fetchContacts().then(data => setContacts(data));
        } else if (!loading) {
            setContacts([]);
        }
    }, [user, loading]);

    const showFeedback = (msg: string) => {
        setToast({ msg, exiting: false });
        setTimeout(() => {
            setToast(prev => prev ? { ...prev, exiting: true } : null);
            setTimeout(() => setToast(null), 500);
        }, 3000);
    };

    const handleConnect = async (id: string) => {
        const c = contacts.find(x => x.id === id);
        if (!c) return;
        const updated = { ...c, last_contacted_at: new Date().toISOString(), snoozed_until: null };
        setContacts(prev => prev.map(x => x.id === id ? updated : x));
        await updateContact(id, updated);
        triggerHaptic(ImpactStyle.Medium);
        showFeedback("Connected today — good work!");
    };

    const handleSnooze = async (id: string) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const c = contacts.find(x => x.id === id);
        if (!c) return;
        const updated = { ...c, snoozed_until: tomorrow.toISOString() };
        setContacts(prev => prev.map(x => x.id === id ? updated : x));
        await updateContact(id, updated);
        triggerHaptic(ImpactStyle.Light);
        showFeedback("Remind me tomorrow — no worries.");
    };

    const handleSave = async (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
        if (editing) {
            const updated = { ...editing, ...data, updated_at: new Date().toISOString() };
            setContacts(prev => prev.map(c => c.id === editing.id ? updated : c));
            await updateContact(editing.id, data);
            triggerHaptic(ImpactStyle.Medium);
            showFeedback("Profile updated.");
        } else {
            const created = await createContact(data);
            setContacts(prev => [created, ...prev]);
            triggerHaptic(ImpactStyle.Medium);
            showFeedback("Contact added.");
        }
        setShowModal(false);
        setEditing(undefined);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Remove this person from your ritual?')) {
            setContacts(prev => prev.filter(c => c.id !== id));
            await deleteContact(id);
            showFeedback("Contact removed.");
            setShowModal(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream">
                <div className="w-8 h-8 rounded-full border-4 border-fika-200 border-t-fika-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen md:h-screen md:overflow-hidden md:flex md:flex-col bg-cream selection:bg-fika-200">
            <header className="pt-10 md:pt-12 pb-6 md:pb-8 px-6 max-w-2xl mx-auto flex justify-between items-end w-full shrink-0">
                <div>
                    <h1 className="text-[3rem] md:text-[3.5rem] font-black text-fika-900 tracking-[-0.04em] leading-[0.9]">Fika</h1>
                    <p className="text-fika-500 font-bold mt-2 md:mt-3 text-base tracking-wide flex items-center gap-2 uppercase tracking-[0.1em] text-[10px]">
                        <span className="w-1.5 h-1.5 bg-fika-400 rounded-full" />
                        Stay in touch.
                    </p>
                </div>

                <div className="flex items-end gap-3">
                    {/* Profile / Account button */}
                    <button
                        id="account-btn"
                        onClick={() => setShowAuth(true)}
                        className="relative bg-white border-2 border-fika-100 w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-md btn-interactive overflow-hidden"
                        aria-label="Account"
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-fika-400">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        )}
                        {/* Green dot if signed in */}
                        {user && (
                            <span className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                        )}
                    </button>

                    {/* Add contact button */}
                    <button
                        onClick={() => { setEditing(undefined); setShowModal(true); showFeedback("Preparing profile..."); }}
                        className="bg-fika-900 text-white w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-fika-200 btn-interactive text-2xl"
                        aria-label="Add Someone"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 w-full flex-1 md:overflow-y-auto no-scrollbar pb-32 md:pb-48">
                {!user ? (
                    /* Not signed in — prompt to sign in */
                    <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-20">
                        <div className="w-20 h-20 rounded-[1.75rem] bg-fika-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fika-400">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-fika-900">Sign in to get started</h2>
                            <p className="text-fika-400 mt-2 text-sm leading-relaxed max-w-xs">
                                Your contacts sync across all your devices when you're signed in.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAuth(true)}
                            className="bg-fika-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-fika-200 btn-interactive"
                        >
                            Sign in with Google
                        </button>
                    </div>
                ) : view === 'today' ? (
                    <TodayView contacts={contacts} onConnect={handleConnect} onSnooze={handleSnooze} />
                ) : (
                    <PeopleList contacts={contacts} onSelect={c => { setEditing(c); setShowModal(true); showFeedback(`Opening ${c.name}'s profile...`); }} />
                )}
            </main>

            {/* Navigation */}
            <nav className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-2xl border border-fika-100/50 p-2 md:p-2.5 rounded-[2.5rem] md:rounded-[3rem] shadow-ritual flex gap-1 md:gap-1.5 z-50">
                <button
                    onClick={() => { setView('today'); triggerHaptic(ImpactStyle.Light); }}
                    className={`px-10 py-5 rounded-[2.5rem] font-black transition-all duration-300 flex items-center gap-3 text-sm uppercase tracking-widest
            ${view === 'today' ? 'bg-fika-900 text-white shadow-xl translate-y-[-2px]' : 'text-fika-300 hover:text-fika-600'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    Today
                </button>
                <button
                    onClick={() => { setView('people'); triggerHaptic(ImpactStyle.Light); }}
                    className={`px-10 py-5 rounded-[2.5rem] font-black transition-all duration-300 flex items-center gap-3 text-sm uppercase tracking-widest
            ${view === 'people' ? 'bg-fika-900 text-white shadow-xl translate-y-[-2px]' : 'text-fika-300 hover:text-fika-600'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    People
                </button>
            </nav>

            {/* Feedback Toast */}
            {toast && (
                <div className="status-toast-wrapper">
                    <div className={`status-toast-inner ${toast.exiting ? 'status-toast-exit' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-orange-300"><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                        <span className="text-base">{toast.msg}</span>
                        <div className="toast-timer" />
                    </div>
                </div>
            )}

            {showModal && (
                <ContactForm
                    contact={editing}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onClose={() => setShowModal(false)}
                />
            )}

            {showAuth && (
                <AuthPage onClose={() => { setShowAuth(false); }} />
            )}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App

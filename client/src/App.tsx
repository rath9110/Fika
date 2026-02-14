import { useState, useEffect } from 'react'
import RitualDashboard from './components/RitualDashboard'
import ContactForm from './components/ContactForm'
import Vault from './components/Vault'
import { MOCK_CONTACTS } from './mockData'
import type { Contact } from './types'
import { isVaultLocked, getMasterKey, encryptData } from './utils/encryption'
import { fetchContacts } from './utils/api'
import { parseCSV } from './utils/csv'

function App() {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [showModal, setShowModal] = useState(false);
  const [isLocked, setIsLocked] = useState(isVaultLocked());

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const imported = parseCSV(csv);
      imported.forEach(c => handleAddContact(c));
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchContacts();
        if (data && data.length > 0) setContacts(data);
      } catch (e) {
        console.warn('API not available yet, using mock data.');
      }
    };
    load();
  }, []);

  const handleAddContact = async (newContact: Omit<Contact, 'id'>) => {
    const key = getMasterKey();
    let hooks = newContact.hooks;
    let notes = newContact.notes;

    // Encrypt sensitive parts if key exists
    if (key) {
      if (hooks) {
        hooks = JSON.parse(encryptData(JSON.stringify(hooks), key));
      }
      if (notes) {
        notes = encryptData(notes, key);
      }
    }

    try {
      // For now, optimistic update
      const contact: Contact = {
        ...newContact,
        hooks,
        notes,
        id: Math.random().toString(36).substr(2, 9),
      };
      setContacts([...contacts, contact]);
    } catch (e) { }
  };

  return (
    <div className="min-h-screen">
      {isLocked && <Vault onUnlock={() => setIsLocked(false)} />}

      <header className="py-8 px-6 max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-fika-900 tracking-tight font-sans">Fika</h1>
          <p className="text-fika-600 font-medium font-sans">Your social maintenance ritual.</p>
        </div>
        <nav className="flex space-x-4">
          <label className="btn-secondary font-sans cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </label>
          <button onClick={() => setShowModal(true)} className="btn-primary font-sans">Add Contact</button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <RitualDashboard contacts={contacts} setContacts={setContacts} />
      </main>

      {showModal && (
        <ContactForm
          onAdd={handleAddContact}
          onClose={() => setShowModal(false)}
        />
      )}

      <footer className="py-12 px-6 text-center text-fika-400 text-sm font-sans">
        <p>© 2026 Fika. Privacy-first, always.</p>
      </footer>
    </div>
  )
}

export default App

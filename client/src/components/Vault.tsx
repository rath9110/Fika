import React, { useState } from 'react';
import { saveMasterKey, isVaultLocked } from '../utils/encryption';

interface VaultProps {
    onUnlock: () => void;
}

const Vault: React.FC<VaultProps> = ({ onUnlock }) => {
    const [password, setPassword] = useState('');
    const [isSettingUp, setIsSettingUp] = useState(isVaultLocked());

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 4) return;
        saveMasterKey(password);
        onUnlock();
    };

    return (
        <div className="fixed inset-0 bg-espresso/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-fika-100 text-center space-y-8 animate-in zoom-in duration-300">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-fika-50 flex items-center justify-center text-fika-600 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-fika-900">Unlock your Vault</h2>
                    <p className="text-fika-500 text-sm">Your social context is encrypted. Only you can read it.</p>
                </div>

                <form onSubmit={handleUnlock} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your Master Password"
                        className="w-full bg-fika-50 border border-fika-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-fika-300 text-center text-lg"
                        autoFocus
                    />
                    <button type="submit" className="w-full btn-primary py-4 text-lg">
                        Open the Brew
                    </button>
                </form>

                <p className="text-[10px] text-fika-300 uppercase tracking-widest font-bold">
                    Zero-Knowledge Execution • Powered by AES-256
                </p>
            </div>
        </div>
    );
};

export default Vault;

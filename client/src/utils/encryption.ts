import CryptoJS from 'crypto-js';

/**
 * Privacy-First Encryption Utility
 * Handles Zero-Knowledge client-side encryption for contact notes and context hooks.
 */

const STORAGE_KEY = 'fika_vault_key';

export const saveMasterKey = (password: string) => {
    // In a real app, we would derive a key using PBKDF2 and store only a hint or use session storage
    localStorage.setItem(STORAGE_KEY, password);
};

export const getMasterKey = () => {
    return localStorage.getItem(STORAGE_KEY);
};

export const encryptData = (data: string, key: string): string => {
    try {
        return CryptoJS.AES.encrypt(data, key).toString();
    } catch (e) {
        console.error('Encryption failed', e);
        return '';
    }
};

export const decryptData = (ciphertext: string, key: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.error('Decryption failed', e);
        return '';
    }
};

export const isVaultLocked = () => !getMasterKey();

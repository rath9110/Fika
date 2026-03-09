import React, { createContext, useContext, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'fika_auth_token';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    refetch: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    loading: true,
    refetch: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

/** Read the stored JWT (if any) */
export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // On mount: capture ?token= from the OAuth redirect URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
            // Clean the token out of the URL without a reload
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
        }
    }, []);

    const refetch = async () => {
        const token = getAuthToken();
        if (!token) { setUser(null); setLoading(false); return; }
        try {
            const res = await fetch(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    };

    useEffect(() => { refetch(); }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refetch, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

import React, { createContext, useContext, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refetch = async () => {
        try {
            const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
            const data = await res.json();
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
        setUser(null);
    };

    useEffect(() => { refetch(); }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refetch, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

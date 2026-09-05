import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
    clearAuthStorage,
    getCurrentUser,
    getStoredUser,
    getToken,
    login as loginRequest,
    logout as logoutRequest,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getStoredUser);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        if (!getToken()) {
            setLoading(false);
            return () => {
                mounted = false;
            };
        }

        getCurrentUser()
            .then((currentUser) => {
                if (mounted) setUser(currentUser);
            })
            .catch(() => {
                // Stale/expired token: /api/auth/me returns 401. Clear the
                // old session so we do NOT re-fetch (and re-log that 401) on
                // every page load. This is session cleanup, not weakening auth.
                clearAuthStorage();
                if (mounted) setUser(null);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const refreshUser = useCallback(async () => {
        if (!getToken()) {
            setUser(null);
            return null;
        }

        setLoading(true);

        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            return currentUser;
        } catch (error) {
            clearAuthStorage();
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const result = await loginRequest(credentials);
        setUser(result.user || getStoredUser());
        return result;
    };

    const logout = async () => {
        await logoutRequest();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}

export default AuthContext;
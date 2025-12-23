import type { AuthContextType, AuthState, Credentials, User } from "@/interfaces/auth";
import supabase from "@/lib/supabase";
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";


const STORAGE_KEY = "pf:auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthState>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { user: null, token: null };
            return JSON.parse(raw) as AuthState;
        } catch {
            return { user: null, token: null };
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // ignore storage errors
        }
    }, [state]);

    const signIn = async (credentials: Credentials) => {
        setLoading(true);
        setError(null);
        try {
            // Replace the endpoint and response handling with your API contract.

            const { data, error } = await supabase.auth.signInWithPassword(credentials);

            if (error) {
                throw new Error(error.message || "Authentication failed");
                
            }

            setState({ user: {
                email: data.user.email || "",
                id: ""
            }, token: data.session?.access_token });
        } catch (err: any) {
            setError(err?.message ?? "Sign in error");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signOut = () => {
        setState({ user: null, token: null });
    };

    const updateUser = (partial: Partial<User>) => {
        setState((s) => ({ ...s, user: s.user ? { ...s.user, ...partial } : s.user }));
    };

    const value: AuthContextType = {
        user: state.user,
        token: state.token,
        isAuthenticated: Boolean(state.token),
        loading,
        error,
        signIn,
        signOut,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
};
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerAccount, getCurrentUser, RegisterInput } from '@/lib/queries/auth';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isStaff: boolean;
    dateJoined: string;
    defaultShippingAddress?: {
        streetAddress1: string;
        streetAddress2: string;
        city: string;
        postalCode: string;
        country: {
            code: string;
            country: string;
        };
        phone: string;
    } | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (input: RegisterInput) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state
    useEffect(() => {
        async function initAuth() {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await getCurrentUser(token);
                    if (data?.me) {
                        setUser(data.me);
                    } else {
                        // Token invalid or expired
                        localStorage.removeItem('token');
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        }
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await loginUser(email, password);

            if (data.tokenCreate?.errors && data.tokenCreate.errors.length > 0) {
                return { success: false, error: data.tokenCreate.errors[0].message };
            }

            if (data.tokenCreate?.token) {
                const token = data.tokenCreate.token;
                localStorage.setItem('token', token);

                // Fetch user data
                const userData = await getCurrentUser(token);
                if (userData?.me) {
                    setUser(userData.me);
                }

                router.push('/'); // Redirect to home after login
                return { success: true };
            }

            return { success: false, error: 'Login failed' };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    };

    const register = async (input: RegisterInput) => {
        try {
            const data = await registerAccount(input);

            if (data.accountRegister?.errors && data.accountRegister.errors.length > 0) {
                return { success: false, error: data.accountRegister.errors[0].message };
            }

            if (data.accountRegister?.user) {
                // Registration successful
                // Depending on configuration, user might need to verify email
                return { success: true };
            }

            return { success: false, error: 'Registration failed' };
        } catch (error: any) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

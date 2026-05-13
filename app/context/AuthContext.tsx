'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerAccount, getCurrentUser, RegisterInput, getExternalAuthUrl, obtainExternalAccessTokens } from '@/lib/queries/auth';
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
    loginWithGoogle: () => Promise<void>;
    handleGoogleCallback: (code: string, state: string) => Promise<{ success: boolean; error?: string }>;
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
                // محاولة تسجيل دخول تلقائي
                // إذا كان التحقق من الإيميل مفعّلاً في Saleor، سيفشل وسنعيد { success: true, requiresVerification: true }
                const loginResult = await login(input.email, input.password);
                if (loginResult.success) {
                    return { success: true };
                }
                // تسجيل الدخول فشل = Saleor يطلب تحقق الإيميل
                return { success: true, requiresVerification: true } as any;
            }

            return { success: false, error: 'Registration failed' };
        } catch (error: any) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const redirectUri = `${window.location.origin}/callback`;
            const data = await getExternalAuthUrl(redirectUri);
            
            if (data.externalAuthenticationUrl?.errors?.length > 0) {
                console.error('Failed to get Google Auth URL:', data.externalAuthenticationUrl.errors);
                return;
            }

            const authDataString = data.externalAuthenticationUrl?.authenticationData;
            if (authDataString) {
                const authData = JSON.parse(authDataString);
                if (authData.authorizationUrl) {
                    window.location.href = authData.authorizationUrl;
                }
            }
        } catch (error) {
            console.error('Error initiating Google login:', error);
        }
    };

    const handleGoogleCallback = async (code: string, state: string) => {
        try {
            const data = await obtainExternalAccessTokens(code, state);
            
            if (data.externalObtainAccessTokens?.errors?.length > 0) {
                return { success: false, error: data.externalObtainAccessTokens.errors[0].message };
            }

            const { token, user: authUser } = data.externalObtainAccessTokens || {};
            
            if (token) {
                localStorage.setItem('token', token);
                
                // Fetch full user data including addresses etc
                const userData = await getCurrentUser(token);
                if (userData?.me) {
                    setUser(userData.me);
                } else if (authUser) {
                    // Fallback to basic user data if full fetch fails
                    setUser(authUser as User);
                }
                
                router.push('/');
                return { success: true };
            }

            return { success: false, error: 'Failed to obtain access token' };
        } catch (error: any) {
            console.error('Google callback error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, loginWithGoogle, handleGoogleCallback, logout }}>
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

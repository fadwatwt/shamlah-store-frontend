'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void;
    /** Optional message shown above the form (e.g. "Login to purchase") */
    message?: string;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, message }: LoginModalProps) {
    const { t, language, dir } = useLanguage();
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);

    // Reset state + autofocus when opening; lock body scroll while open
    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setEmail('');
        setPassword('');
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const t = setTimeout(() => emailRef.current?.focus(), 50);
        return () => {
            document.body.style.overflow = original;
            clearTimeout(t);
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                onLoginSuccess?.();
                onClose();
            } else {
                setError(result.error || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
            }
        } catch {
            setError(language === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
            dir={dir}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#F9F4F4] w-full max-w-md rounded-lg shadow-2xl p-8 md:p-10 animate-in zoom-in-95 duration-200">
                {/* Close */}
                <button
                    onClick={onClose}
                    aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
                    className="absolute top-4 end-4 p-1 text-gray-500 hover:text-accent smooth-transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 id="login-modal-title" className="text-2xl font-bold text-gray-900 mb-2 text-center font-serif">
                    {t.auth.loginTitle}
                    <span className="block w-12 h-1 bg-[#D4B8B8] mx-auto mt-3 rounded-full"></span>
                </h2>

                {message && (
                    <p className="text-center text-gray-600 text-sm mb-6 mt-4">{message}</p>
                )}

                <form className="space-y-5 mt-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-500 text-sm mb-2 text-start">{t.profile.email}</label>
                        <input
                            ref={emailRef}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-start bg-white"
                            placeholder="example@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-500 text-sm mb-2 text-start">{t.auth.password}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-start bg-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full bg-accent text-white font-bold py-3 rounded-md hover:bg-[#500000] smooth-transition shadow-lg shadow-accent/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoggingIn ? (
                            <>
                                <LoadingSpinner size="sm" color="white" />
                                <span>{language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...'}</span>
                            </>
                        ) : t.auth.loginButton}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#F9F4F4] text-gray-500">{t.auth.or}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            disabled={isGoogleLoading || isLoggingIn}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-md hover:bg-gray-50 smooth-transition disabled:opacity-70"
                            onClick={async () => {
                                setIsGoogleLoading(true);
                                await loginWithGoogle();
                                // We don't setIsGoogleLoading(false) here because the page redirects
                            }}
                        >
                            {isGoogleLoading ? (
                                <LoadingSpinner size="sm" color="accent" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            {isGoogleLoading ? (language === 'ar' ? 'جاري التحويل...' : 'Redirecting...') : t.auth.google}
                        </button>
                        {/* <button
                            type="button"
                            className="w-full flex items-center justify-center gap-3 bg-black text-white font-bold py-3 rounded-md hover:bg-gray-800 smooth-transition"
                            onClick={() => alert('Social login not implemented yet')}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78.78-.04 1.85-.81 3.16-.69 1.16.11 2.23.59 2.94 1.5-2.63 1.58-2.18 4.9.44 5.92-.61 1.66-1.55 3.3-2.61 4.54-1 1.18-2.03 2.15-3.11 2.1zm-3.69-14.8c.18-2.14-1.39-4.04-3.52-4.14-1.78 2.06.13 4.41 2.15 4.39.01-.08.01-.17 1.37-.25z" />
                            </svg>
                            {t.auth.apple}
                        </button> */}
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-gray-500 text-sm">
                            {t.auth.noAccount}{' '}
                            <Link href="/register" onClick={onClose} className="text-accent font-bold hover:underline">
                                {t.auth.createAccount}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

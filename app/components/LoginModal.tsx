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
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
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

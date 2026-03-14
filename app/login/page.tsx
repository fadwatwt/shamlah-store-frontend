'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { t, dir } = useLanguage();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);
        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.error || 'Login failed');
            }
        } catch {
            setError('An error occurred');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <main className="min-h-screen pt-32 pb-20 bg-white" dir={dir}>
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 items-center lg:items-stretch justify-center lg:justify-evenly">

                    {/* Login Form Container */}
                    <div className="w-full max-w-lg lg:max-w-none lg:w-1/3 bg-[#F9F4F4] p-8 md:p-12 rounded-lg flex flex-col justify-center shadow-sm">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center font-serif">
                            {t.auth.loginTitle}
                            <span className="block w-12 h-1 bg-[#D4B8B8] mx-auto mt-4 rounded-full"></span>
                        </h1>

                        <form className="space-y-6 max-w-md mx-auto w-full" onSubmit={handleLogin}>
                            {/* Social Login Buttons ... */}
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-md text-gray-700 font-medium hover:bg-gray-50 smooth-transition shadow-sm"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    <span>{t.auth.google}</span>
                                </button>

                                <button
                                    type="button"
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 smooth-transition shadow-sm"
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M17.05 20.28c-.98.95-2.05.87-3.08.4-.98-.44-2.03-.49-3.02.06-1.06.57-2.47.54-3.53-.87-1.5-1.98-2.58-4.9-1.09-7.5 1.15-2.01 3.21-2.3 4.21-1.34.82.78 1.63.78 2.37.03.95-.97 2.92-1.39 4.34-.14.3.26.54.51.72.69-2.32 1.05-2.92 4.1-1.15 5.56.55.45 1.17 1.48 1.54 2.29.35.79 0 1.62-.28 2.58-.28.96-.86 1.74-1.58 2.45-.66.65-1.12.87-1.63.87-.51 0-.96-.22-1.58-.87zm-4.79-11.7c.45-2.5 2.39-4.22 4.96-4.32.22 2.66-2.54 4.54-4.96 4.32z" />
                                    </svg>
                                    <span>{t.auth.apple}</span>
                                </button>
                            </div>

                            <div className="relative flex items-center justify-center my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative bg-[#F9F4F4] px-4 text-sm text-gray-500">
                                    {t.auth.or}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-500 text-sm mb-2 text-start">{t.profile.email}</label>
                                <input
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
                                    placeholder="........"
                                    required
                                />
                            </div>

                            <div className="text-start">
                                <Link href="#" className="text-sm text-gray-500 hover:text-accent smooth-transition">
                                    {t.auth.forgotPassword}
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full bg-accent text-white font-bold py-3.5 rounded-md hover:bg-[#500000] smooth-transition shadow-lg shadow-accent/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoggingIn ? 'Logging in...' : t.auth.loginButton}
                            </button>

                            <div className="text-center pt-4">
                                <p className="text-gray-500 text-sm">
                                    {t.auth.noAccount}{' '}
                                    <Link href="/register" className="text-accent font-bold hover:underline">
                                        {t.auth.createAccount}
                                    </Link>
                                </p>
                            </div>

                            <div className="text-center mt-6">
                                <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
                                    {t.product.breadcrumb.home}
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Branding/Info Section */}
                    <div className="hidden lg:flex lg:w-1/2 flex-col justify-center text-center lg:px-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-accent mb-2 font-serif">SHMLH</h2>
                        <h3 className="text-2xl text-gray-600 mb-8 font-serif">{t.footer.slogan.sub}</h3>

                        <p className="text-lg text-gray-800 font-medium mb-2">{t.home.heroTitle}</p>
                        <p className="text-xl text-gray-600 mb-8">{t.home.heroSubtitle}</p>

                        <p className="text-gray-500 leading-relaxed max-w-lg mx-auto mb-12">
                            {t.home.philosophy}
                        </p>

                        <div className="border-t border-gray-200 w-full pt-8"></div>

                        <div className="grid grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-accent mb-1 font-english">100%</div>
                                <div className="text-sm text-gray-500">{dir === 'rtl' ? 'أصالة' : 'Authenticity'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-accent mb-1">{dir === 'rtl' ? 'منتج' : 'Product'}</div>
                                <div className="text-sm text-gray-500">{dir === 'rtl' ? 'يدوي فاخر' : 'Luxury Handcraft'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-accent mb-1">{dir === 'rtl' ? 'تراث' : 'Heritage'}</div>
                                <div className="text-sm text-gray-500">{dir === 'rtl' ? 'فلسطيني' : 'Palestinian'}</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

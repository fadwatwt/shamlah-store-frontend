'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { t, dir, language } = useLanguage();
    const { user, loading, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <main className="min-h-screen pt-32 pb-20 md:px-24 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-accent border-r-transparent animate-spin"></div>
            </main>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
        }).format(date);
    };

    const fullName = `${user.firstName} ${user.lastName}`;
    const address = user.defaultShippingAddress;

    return (
        <main className="min-h-screen pt-32 pb-20 md:px-24" dir={dir}>
            <div className="container mx-auto px-6 lg:px-12">

                {/* Page Title */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif text-accent mb-6">{t.profile.title}</h1>
                    <div className="w-24 h-[1px] bg-accent/40 mx-auto"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl mx-auto">

                    {/* Sidebar */}
                    <div className="lg:w-[300px] shrink-0">
                        <div className="bg-[#F6F5F2] p-8 text-center">
                            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                                <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-serif text-gray-900 mb-1">{fullName}</h2>
                            <p className="text-xs text-gray-500 mb-8 font-english">{user.email}</p>

                            <nav className="space-y-1 text-left" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                <Link href="/profile" className="flex items-center gap-4 px-6 py-4 bg-white text-accent font-serif text-sm border-l-2 border-accent transition-all">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {t.profile.personalInfo}
                                </Link>
                                <Link href="/orders" className="flex items-center gap-4 px-6 py-4 text-gray-600 font-serif text-sm hover:bg-white/50 transition-all border-l-2 border-transparent">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    {t.profile.orders}
                                </Link>
                                <Link href="/wishlist" className="flex items-center gap-4 px-6 py-4 text-gray-600 font-serif text-sm hover:bg-white/50 transition-all border-l-2 border-transparent">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {t.profile.wishlist}
                                </Link>
                            </nav>

                            <div className="border-t border-gray-200 mt-6 pt-6 text-left" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-4 px-6 py-3 text-accent hover:text-red-700 font-serif text-sm w-full transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    {t.profile.logout}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-full space-y-6 flex-1">

                        {/* Personal Info Card */}
                        <div className="bg-white p-8 border border-gray-200">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3 text-accent">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h2 className="text-xl font-serif text-gray-900">{t.profile.personalInfo}</h2>
                                </div>
                                <button className="text-accent hover:opacity-80 flex items-center gap-2 text-xs font-serif italic">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    {t.profile.edit}
                                </button>
                            </div>

                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-y-8 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                <div>
                                    <label className="block text-gray-400 text-xs mb-2 font-serif">{t.profile.fullName}</label>
                                    <div className="font-serif text-sm text-gray-800">{fullName}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div>
                                        <label className="block text-gray-400 text-xs mb-2 font-serif">{t.profile.email}</label>
                                        <div className="font-serif text-sm text-gray-800 font-english flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs mb-2 font-serif">{t.profile.phone}</label>
                                    <div className="font-serif text-sm text-gray-800 font-english flex items-center gap-2" dir="ltr">
                                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {address?.phone || '+970 599 123 456'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address Card */}
                        <div className="bg-white p-8 border border-gray-200">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3 text-accent">
                                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <h2 className="text-xl font-serif text-gray-900">{t.profile.shippingAddress}</h2>
                                </div>
                                <button className="text-accent hover:opacity-80 flex items-center gap-2 text-xs font-serif italic">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    {t.profile.edit}
                                </button>
                            </div>

                            {address ? (
                                <div className="bg-[#F6F5F2] p-8">
                                    <p className="font-serif text-sm text-gray-800 mb-6">{address.streetAddress1} {address.streetAddress2 ? `, ${address.streetAddress2}` : ''}</p>
                                    <div className="flex flex-wrap gap-x-16 gap-y-6">
                                        <div>
                                            <span className="block text-xs text-gray-400 mb-2 font-serif">{t.profile.city}</span>
                                            <span className="font-serif text-sm text-gray-800">{address.city}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400 mb-2 font-serif">{t.profile.country}</span>
                                            <span className="font-serif text-sm text-gray-800">{address.country.country}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400 mb-2 font-serif">{t.profile.postalCode}</span>
                                            <span className="font-english text-sm text-gray-800">{address.postalCode}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#F6F5F2] p-8">
                                    <p className="font-serif text-sm text-gray-800 mb-6">Ramallah, Palestine, Al-Ersal Street, Building 5</p>
                                    <div className="flex flex-wrap gap-x-16 gap-y-6">
                                        <div>
                                            <span className="block text-xs text-gray-400 mb-2 font-serif">{t.profile.city}</span>
                                            <span className="font-serif text-sm text-gray-800">Ramallah</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400 mb-2 font-serif">{t.profile.country}</span>
                                            <span className="font-serif text-sm text-gray-800">Palestine</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400 mb-2 font-serif">{t.profile.postalCode}</span>
                                            <span className="font-english text-sm text-gray-800">12345</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Change Password Card */}
                        <div className="bg-white p-8 border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-serif text-gray-900">{t.profile.changePassword}</h2>
                                <button className="text-accent hover:opacity-80 flex items-center gap-2 text-xs font-serif italic">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    {t.profile.change}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 font-serif">{t.profile.lastUpdated}</p>
                        </div>

                        {/* Stats - Placeholder for now as we don't have order history in context yet */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#F6F5F2] p-8 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[160px]">
                                <div className="w-8 h-8 mx-auto mb-4 text-accent">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div className={language === 'ar' ? "text-2xl font-serif text-accent mb-2 font-english" : "text-2xl font-serif text-accent mb-2"}>12</div>
                                <div className="text-xs text-gray-500 font-serif">{t.profile.ordersCompleted}</div>
                            </div>
                            <div className="bg-[#F6F5F2] p-8 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[160px]">
                                <div className="w-8 h-8 mx-auto mb-4 text-accent">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div className={language === 'ar' ? "text-2xl font-serif text-accent mb-2 font-english" : "text-2xl font-serif text-accent mb-2"}>8</div>
                                <div className="text-xs text-gray-500 font-serif">{t.profile.favoriteItems}</div>
                            </div>
                            <div className="bg-[#F0EEEB] p-8 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[160px]">
                                <div className="w-8 h-8 mx-auto mb-4 text-accent">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="text-sm font-serif text-gray-800 mb-2">{formatDate(user.dateJoined) || 'January 2024'}</div>
                                <div className="text-xs text-gray-500 font-serif">{t.profile.memberSince}</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}

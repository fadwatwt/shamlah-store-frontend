'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { getCurrentUserOrdersCount, getUserOrders, updateAccount, updateAccountAddress, createAccountAddress, setDefaultAddress, changePassword } from '@/lib/queries/auth';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, isCountryCode, countryName } from '@/lib/utils/countries';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const { t, dir, language } = useLanguage();
    const { user, loading, logout, isAuthenticated, applyAccountPatch, applyAddressPatch } = useAuth();
    const { items: wishlistItems } = useWishlist();
    const router = useRouter();
    const [ordersCount, setOrdersCount] = useState<number | null>(null);
    const [orderAddress, setOrderAddress] = useState<any | null>(null);

    // Edit modals state
    const [editing, setEditing] = useState<'info' | 'address' | 'password' | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [infoForm, setInfoForm] = useState({ firstName: '', lastName: '' });
    const [addressForm, setAddressForm] = useState({
        streetAddress1: '',
        streetAddress2: '',
        city: '',
        country: 'PS',
        phone: '',
    });
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });

    const openInfoEditor = () => {
        setInfoForm({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
        });
        setFormError('');
        setFormSuccess('');
        setEditing('info');
    };

    const openAddressEditor = () => {
        const a = displayAddress || {};
        const rawCountry = a.country?.code || (typeof a.country === 'string' ? a.country : '') || DEFAULT_COUNTRY_CODE;
        setAddressForm({
            streetAddress1: a.streetAddress1 || '',
            streetAddress2: a.streetAddress2 || '',
            city: a.city || '',
            country: isCountryCode(rawCountry) ? rawCountry : DEFAULT_COUNTRY_CODE,
            phone: a.phone || (displayPhone as string) || '',
        });
        setFormError('');
        setFormSuccess('');
        setEditing('address');
    };

    const openPasswordEditor = () => {
        setPasswordForm({ oldPassword: '', newPassword: '', confirm: '' });
        setFormError('');
        setFormSuccess('');
        setEditing('password');
    };

    const saveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!infoForm.firstName.trim() || !infoForm.lastName.trim()) {
            setFormError(t.profile.requiredField);
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) return;
        setSaving(true);
        setFormError('');
        try {
            const accountInput: any = {
                firstName: infoForm.firstName.trim(),
                lastName: infoForm.lastName.trim(),
            };
            const res = await updateAccount(token, accountInput);
            if (res?.accountUpdate?.errors?.length) {
                setFormError(res.accountUpdate.errors[0].message || t.profile.saveError);
                return;
            }
            if (res?.accountUpdate?.user) {
                applyAccountPatch({
                    firstName: res.accountUpdate.user.firstName,
                    lastName: res.accountUpdate.user.lastName,
                });
            }
            setEditing(null);
        } catch (err: any) {
            setFormError(err?.message || t.profile.saveError);
        } finally {
            setSaving(false);
        }
    };

    // Backend validation errors come back raw in English — translate the known ones.
    // Note: Saleor's address phone check returns NO field, only the message
    // "This value is not valid for the address.", so match on both.
    const addressErrorMessage = (err: any): string => {
        const field = String(err?.field || '').toLowerCase();
        const message = String(err?.message || '');
        if (field.includes('phone') || message.toLowerCase().includes('not valid for the address')) {
            return t.profile.invalidPhoneForCountry;
        }
        if (message.startsWith('Variable "')) return t.profile.saveError;
        return message || t.profile.saveError;
    };

    const upsertAddressFields = async (token: string, fields: any) => {
        const existingId = savedAddresses[0]?.id;
        if (existingId) {
            const res = await updateAccountAddress(token, existingId, fields);
            if (res?.accountAddressUpdate?.errors?.length) {
                const e = res.accountAddressUpdate.errors[0];
                throw { field: e?.field, message: e?.message };
            }
            return res?.accountAddressUpdate?.address || null;
        }
        const res = await createAccountAddress(token, fields);
        if (res?.accountAddressCreate?.errors?.length || !res?.accountAddressCreate?.address?.id) {
            const e = res?.accountAddressCreate?.errors?.[0];
            throw { field: e?.field, message: e?.message };
        }
        const newId = res.accountAddressCreate.address.id;
        await Promise.all([
            setDefaultAddress(token, newId, 'SHIPPING').catch(() => {}),
            setDefaultAddress(token, newId, 'BILLING').catch(() => {}),
        ]);
        return res?.accountAddressCreate?.address || null;
    };

    const saveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addressForm.streetAddress1.trim() || !addressForm.city.trim()) {
            setFormError(t.profile.requiredField);
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) return;
        setSaving(true);
        setFormError('');
        try {
            const payload: any = {
                firstName: user?.firstName || 'User',
                lastName: user?.lastName || 'User',
                streetAddress1: addressForm.streetAddress1.trim(),
                city: addressForm.city.trim(),
                country: (isCountryCode(addressForm.country.trim()) ? addressForm.country.trim() : DEFAULT_COUNTRY_CODE) as any,
            };
            if (addressForm.streetAddress2.trim()) payload.streetAddress2 = addressForm.streetAddress2.trim();
            // NOTE: postalCode is intentionally NOT sent — this Saleor instance strips it server-side.
            if (addressForm.phone.trim()) payload.phone = addressForm.phone.trim();

            const saved = await upsertAddressFields(token, payload);
            if (saved) applyAddressPatch(saved);
            setEditing(null);
        } catch (err: any) {
            setFormError(addressErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const savePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordForm.oldPassword || !passwordForm.newPassword) {
            setFormError(t.profile.requiredField);
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            setFormError(t.profile.passwordTooShort);
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirm) {
            setFormError(t.profile.passwordMismatch);
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) return;
        setSaving(true);
        setFormError('');
        try {
            const res = await changePassword(token, passwordForm.oldPassword, passwordForm.newPassword);
            if (res?.passwordChange?.errors?.length) {
                setFormError(res.passwordChange.errors[0].message || t.profile.saveError);
            } else {
                setEditing(null);
            }
        } catch {
            setFormError(t.profile.saveError);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        const token = localStorage.getItem('token');
        if (!token) return;
        getCurrentUserOrdersCount(token)
            .then(setOrdersCount)
            .catch(() => setOrdersCount(0));
        // Fetch last order's shipping address as fallback for real address
        getUserOrders(token)
            .then((nodes: any[]) => {
                const withAddress = nodes.find((n: any) => n.shippingAddress);
                if (withAddress?.shippingAddress) setOrderAddress(withAddress.shippingAddress);
            })
            .catch(() => {});
    }, [isAuthenticated]);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <main className="min-h-screen pt-28 md:pt-32 pb-12 md:pb-20 md:px-24 flex items-center justify-center">
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
        return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
            year: 'numeric',
            month: 'long',
        }).format(date);
    };

    const fullName = `${user.firstName} ${user.lastName}`;
    const savedAddress = user.defaultShippingAddress;
    const savedAddresses = (user as any)?.addresses || [];
    const displayAddress = savedAddress || savedAddresses[0] || orderAddress;
    const displayPhone = (displayAddress as any)?.phone || null;

    return (
        <main className="min-h-screen pt-28 md:pt-32 pb-12 md:pb-20 md:px-24" dir={dir}>
            <div className="container mx-auto px-6 lg:px-12">

                {/* Page Title */}
                <div className="text-center mb-8 md:mb-16">
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
                                <button onClick={openInfoEditor} className="text-accent hover:opacity-80 flex items-center gap-2 text-xs font-serif italic">
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
                                        {displayPhone || (language === 'ar' ? 'لم يُحدد' : 'Not set')}
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
                                <button onClick={openAddressEditor} className="text-accent hover:opacity-80 flex items-center gap-2 text-xs font-serif italic">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    {t.profile.edit}
                                </button>
                            </div>

                            {displayAddress ? (
                                <div className="bg-[#F6F5F2] p-8">
                                    <p className="font-serif text-sm text-gray-800 mb-6">{displayAddress.streetAddress1} {displayAddress.streetAddress2 ? `, ${displayAddress.streetAddress2}` : ''}</p>
                                    <div className="flex flex-wrap gap-x-16 gap-y-6">
                                        <div>
                                            <span className="block text-xs text-gray-400 mb-2 font-serif">{t.profile.city}</span>
                                            <span className="font-serif text-sm text-gray-800">{displayAddress.city}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400 mb-2 font-serif">{t.profile.country}</span>
                                            <span className="font-serif text-sm text-gray-800">{displayAddress.country?.country || countryName(displayAddress.country || '', language)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#F6F5F2] p-8 text-center">
                                    <p className="font-serif text-sm text-gray-500">{language === 'ar' ? 'لم تقم بحفظ عنوان شحن بعد' : 'No shipping address saved yet'}</p>
                                    <p className="font-serif text-xs text-gray-400 mt-2">{language === 'ar' ? 'سيظهر عنوانك هنا بعد أول طلب أو حفظه من الإعدادات' : 'Your address will appear here after your first order or saving it'}</p>
                                </div>
                            )}
                        </div>

                        {/* Change Password Card */}
                        <div className="bg-white p-8 border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-serif text-gray-900">{t.profile.changePassword}</h2>
                                <button onClick={openPasswordEditor} className="text-accent hover:opacity-80 flex items-center gap-2 text-xs font-serif italic">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    {t.profile.change}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 font-serif">{t.profile.lastUpdated}</p>
                        </div>

                        {/* Stats - real data */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#F6F5F2] p-8 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[160px]">
                                <div className="w-8 h-8 mx-auto mb-4 text-accent">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div className={language === 'ar' ? "text-2xl font-serif text-accent mb-2 font-english" : "text-2xl font-serif text-accent mb-2"}>{ordersCount ?? '-'}</div>
                                <div className="text-xs text-gray-500 font-serif">{t.profile.ordersCompleted}</div>
                            </div>
                            <div className="bg-[#F6F5F2] p-8 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[160px]">
                                <div className="w-8 h-8 mx-auto mb-4 text-accent">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div className={language === 'ar' ? "text-2xl font-serif text-accent mb-2 font-english" : "text-2xl font-serif text-accent mb-2"}>{wishlistItems.length}</div>
                                <div className="text-xs text-gray-500 font-serif">{t.profile.favoriteItems}</div>
                            </div>
                            <div className="bg-[#F0EEEB] p-8 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[160px]">
                                <div className="w-8 h-8 mx-auto mb-4 text-accent">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="text-sm font-serif text-gray-800 mb-2">{formatDate(user.dateJoined)}</div>
                                <div className="text-xs text-gray-500 font-serif">{t.profile.memberSince}</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Edit Modals */}
            {editing && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => !saving && setEditing(null)}
                >
                    <div
                        className="bg-white w-full max-w-md p-8 shadow-xl"
                        dir={dir}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Personal Info */}
                        {editing === 'info' && (
                            <form onSubmit={saveInfo}>
                                <h3 className="text-xl font-serif text-gray-900 mb-6">{t.profile.personalInfo}</h3>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pe-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-500 text-xs mb-2">{t.profile.firstName}</label>
                                            <input
                                                value={infoForm.firstName}
                                                onChange={(e) => setInfoForm({ ...infoForm, firstName: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-xs mb-2">{t.profile.lastName}</label>
                                            <input
                                                value={infoForm.lastName}
                                                onChange={(e) => setInfoForm({ ...infoForm, lastName: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-2">{t.profile.email}</label>
                                        <div
                                            dir="ltr"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm bg-gray-50 text-gray-500"
                                            style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}
                                        >
                                            {user?.email || ''}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{t.profile.emailNotEditable}</p>
                                    </div>
                                </div>
                                {formError && <p className="mt-4 text-sm text-red-500">{formError}</p>}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-accent text-white py-3 text-sm font-bold rounded-sm hover:bg-[#5a1214] smooth-transition disabled:opacity-60"
                                    >
                                        {saving ? t.profile.saving : t.profile.save}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => setEditing(null)}
                                        className="flex-1 border border-gray-300 text-gray-600 py-3 text-sm rounded-sm hover:bg-gray-50 smooth-transition"
                                    >
                                        {t.profile.cancel}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Shipping Address */}
                        {editing === 'address' && (
                            <form onSubmit={saveAddress}>
                                <h3 className="text-xl font-serif text-gray-900 mb-6">{t.profile.shippingAddress}</h3>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pe-1">
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-2">{t.profile.streetAddress} *</label>
                                        <input
                                            value={addressForm.streetAddress1}
                                            onChange={(e) => setAddressForm({ ...addressForm, streetAddress1: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-500 text-xs mb-2">{t.profile.city} *</label>
                                            <input
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-xs mb-2">{t.profile.country}</label>
                                            <select
                                                value={addressForm.country}
                                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm bg-white focus:outline-none focus:border-accent"
                                            >
                                                {COUNTRY_CODES.map((c) => (
                                                    <option key={c.code} value={c.code}>
                                                        {language === 'ar' ? c.ar : c.en}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-2">{t.profile.phone}</label>
                                        <input
                                            value={addressForm.phone}
                                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                            dir="ltr"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>
                                {formError && <p className="mt-4 text-sm text-red-500">{formError}</p>}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-accent text-white py-3 text-sm font-bold rounded-sm hover:bg-[#5a1214] smooth-transition disabled:opacity-60"
                                    >
                                        {saving ? t.profile.saving : t.profile.save}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => setEditing(null)}
                                        className="flex-1 border border-gray-300 text-gray-600 py-3 text-sm rounded-sm hover:bg-gray-50 smooth-transition"
                                    >
                                        {t.profile.cancel}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Change Password */}
                        {editing === 'password' && (
                            <form onSubmit={savePassword}>
                                <h3 className="text-xl font-serif text-gray-900 mb-6">{t.profile.changePassword}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-2">{t.profile.oldPassword}</label>
                                        <input
                                            type="password"
                                            value={passwordForm.oldPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                            dir="ltr"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-2">{t.profile.newPassword}</label>
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            dir="ltr"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-2">{t.profile.confirmPassword}</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirm}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                            dir="ltr"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>
                                {formError && <p className="mt-4 text-sm text-red-500">{formError}</p>}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-accent text-white py-3 text-sm font-bold rounded-sm hover:bg-[#5a1214] smooth-transition disabled:opacity-60"
                                    >
                                        {saving ? t.profile.saving : t.profile.save}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => setEditing(null)}
                                        className="flex-1 border border-gray-300 text-gray-600 py-3 text-sm rounded-sm hover:bg-gray-50 smooth-transition"
                                    >
                                        {t.profile.cancel}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

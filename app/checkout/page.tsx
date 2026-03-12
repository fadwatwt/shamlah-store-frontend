'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CheckoutPage() {
    const { t, dir, language } = useLanguage();
    const { items, subtotal } = useCart();
    const [step, setStep] = useState(1);
    const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        zipCode: '',
    });

    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [cardData, setCardData] = useState({
        number: '',
        holder: '',
        expiry: '',
        cvv: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        const errorMsg = language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields';

        if (!formData.fullName) newErrors.fullName = errorMsg;
        if (!formData.email) newErrors.email = errorMsg;
        if (!formData.phone) newErrors.phone = errorMsg;
        if (!formData.address) newErrors.address = errorMsg;
        if (!formData.city) newErrors.city = errorMsg;
        if (!formData.country) newErrors.country = errorMsg;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        if (paymentMethod === 'credit_card') {
            const newErrors: Record<string, string> = {};
            if (!cardData.number) newErrors.cardNumber = 'Required';
            if (!cardData.holder) newErrors.cardHolder = 'Required';
            if (!cardData.expiry) newErrors.expiry = 'Required';
            if (!cardData.cvv) newErrors.cvv = 'Required';

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }
        return true;
    };

    const handleNext = () => {
        setShowErrors(true);
        if (validateStep1()) {
            setStep(2);
            setShowErrors(false);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowErrors(true);
        if (validateStep2()) {
            // Success! Redirect to success page
            window.location.href = '/checkout/success';
        }
    };

    const shippingCosts: Record<string, number> = {
        standard: 25,
        express: 45,
        overnight: 65
    };

    const shippingPrice = shippingCosts[shippingMethod] || 0;
    const total = (subtotal?.amount || 0) + shippingPrice;
    const currency = subtotal?.currency || (language === 'ar' ? 'ر.س' : 'SAR');

    // SVGs
    const UserIcon = () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    const MailIcon = () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );

    const PhoneIcon = () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    );

    const LocationIcon = ({ className = "w-5 h-5 text-accent" }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    const ShippingIcon = ({ className = "w-5 h-5 text-accent" }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
    );

    const CardIcon = ({ className = "w-5 h-5 text-accent" }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-background" dir={dir}>
            <Header />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-[700px] mx-auto">
                    {/* Page Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-[36px] md:text-[48px] font-serif text-accent mb-4">
                            {t.checkout.title}
                        </h1>
                        <div className="w-20 h-0.5 bg-accent/20 mx-auto"></div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-center items-center gap-8 md:gap-16 mb-16">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full ${step >= 1 ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'border border-gray-200 text-gray-300'} flex items-center justify-center`}>
                                <ShippingIcon className={`w-5 h-5 ${step >= 1 ? 'text-white' : 'text-gray-300'}`} />
                            </div>
                            <span className={`text-sm font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>{t.checkout.steps.shipping}</span>
                        </div>

                        <div className={`flex-grow max-w-[60px] h-[1px] ${step >= 2 ? 'bg-accent' : 'bg-gray-200'}`}></div>

                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full ${step >= 2 ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'border border-gray-200 text-gray-300'} flex items-center justify-center`}>
                                <CardIcon className={`w-5 h-5 ${step >= 2 ? 'text-white' : 'text-gray-300'}`} />
                            </div>
                            <span className={`text-sm font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>{t.checkout.steps.payment}</span>
                        </div>
                    </div>

                    {/* Order Summary Accordion */}
                    <div className="mb-10 border border-gray-100 rounded-lg overflow-hidden bg-secondary">
                        <button
                            onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                            className="w-full flex items-center justify-between p-5 hover:bg-secondary transition-colors"
                        >
                            <div className="flex items-center gap-3 text-gray-800 font-medium">
                                <div className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center text-accent">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <span className="text-[17px]">{t.cart.summary}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-accent" dir="ltr">{currency} {total}</span>
                                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-500 ${isOrderSummaryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        {isOrderSummaryOpen && (
                            <div className="p-6 space-y-4 border-t border-gray-100 animate-in slide-in-from-top-2 bg-secondary">
                                {items.length > 0 ? items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-white border border-gray-100">
                                            <Image
                                                src={item.variant?.product?.thumbnail?.url || 'https://placehold.co/100x100?text=Product'}
                                                alt={item.variant?.product?.name || ''}
                                                fill
                                                className="object-cover"
                                            />
                                            <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.variant?.product?.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{item.variant?.name !== item.variant?.id ? item.variant?.name : ''}</p>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900" dir="ltr">
                                            {currency} {item.variant?.pricing?.price?.gross?.amount || 0}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-gray-400 text-sm py-4">{t.cart.empty}</p>
                                )}

                                <div className="border-t border-gray-100 pt-5 mt-4 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>{t.cart.subtotal}</span>
                                        <span dir="ltr">{currency} {subtotal?.amount || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>{t.cart.shipping}</span>
                                        <span dir="ltr">{currency} {shippingPrice}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-accent pt-2">
                                        <span>{t.cart.total}</span>
                                        <span dir="ltr">{currency} {total}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {step === 1 ? (
                        <>
                            {/* Shipping Form Header */}
                            <div className="flex items-center gap-3 mb-8">
                                <LocationIcon />
                                <h2 className="text-[20px] font-semibold text-gray-800">{t.checkout.shippingInfo}</h2>
                            </div>

                            {/* Form Step 1 */}
                            <div className="space-y-8">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.fullName} *</label>
                                    <div className="relative group">
                                        <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center text-gray-400 group-focus-within:text-accent transition-colors`}>
                                            <UserIcon />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={language === 'ar' ? "أدخل اسمك الكامل" : "Enter your full name"}
                                            className={`w-full bg-[#fdfdfd] border ${showErrors && errors.fullName ? 'border-red-400' : 'border-gray-200'} rounded-lg py-4 ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all`}
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                    {showErrors && errors.fullName && <p className="text-[11px] text-red-500 ml-1 mt-1">{errors.fullName}</p>}
                                </div>

                                {/* Email & Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.email} *</label>
                                        <div className="relative group">
                                            <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center text-gray-400 group-focus-within:text-accent transition-colors`}>
                                                <MailIcon />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder={language === 'ar' ? "عنوان بريدك الإلكتروني" : "Your email address"}
                                                className={`w-full bg-[#fdfdfd] border ${showErrors && errors.email ? 'border-red-400' : 'border-gray-200'} rounded-lg py-4 ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all`}
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        {showErrors && errors.email && <p className="text-[11px] text-red-500 ml-1 mt-1">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.phone} *</label>
                                        <div className="relative group">
                                            <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center text-gray-400 group-focus-within:text-accent transition-colors`}>
                                                <PhoneIcon />
                                            </div>
                                            <input
                                                type="tel"
                                                placeholder="+970 XXX XXX XXX"
                                                className={`w-full bg-[#fdfdfd] border ${showErrors && errors.phone ? 'border-red-400' : 'border-gray-200'} rounded-lg py-4 ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all`}
                                                dir="ltr"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        {showErrors && errors.phone && <p className="text-[11px] text-red-500 ml-1 mt-1">{errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.address} *</label>
                                    <input
                                        type="text"
                                        placeholder={language === 'ar' ? "الشارع، رقم المبنى، الحي" : "Street, Building No., District"}
                                        className={`w-full bg-[#fdfdfd] border ${showErrors && errors.address ? 'border-red-400' : 'border-gray-200'} rounded-lg py-4 px-5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all`}
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                    {showErrors && errors.address && <p className="text-[11px] text-red-500 ml-1 mt-1">{errors.address}</p>}
                                </div>

                                {/* City, Country, Zip */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.city} *</label>
                                        <input
                                            type="text"
                                            placeholder={language === 'ar' ? "المدينة" : "City"}
                                            className={`w-full bg-[#fdfdfd] border ${showErrors && errors.city ? 'border-red-400' : 'border-gray-200'} rounded-lg py-4 px-5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all`}
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        />
                                        {showErrors && errors.city && <p className="text-[11px] text-red-500 ml-1 mt-1">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.country} *</label>
                                        <input
                                            type="text"
                                            placeholder={language === 'ar' ? "الدولة" : "Country"}
                                            className={`w-full bg-[#fdfdfd] border ${showErrors && errors.country ? 'border-red-400' : 'border-gray-200'} rounded-lg py-4 px-5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all`}
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        />
                                        {showErrors && errors.country && <p className="text-[11px] text-red-500 ml-1 mt-1">{errors.country}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.postalCode}</label>
                                        <input
                                            type="text"
                                            placeholder="12345"
                                            className="w-full bg-[#fdfdfd] border border-gray-200 rounded-lg py-4 px-5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="w-full bg-accent text-white py-4 font-bold text-lg hover:bg-[#500000] smooth-transition shadow-xl shadow-accent/20 mt-10"
                                >
                                    {t.checkout.continueToPayment}
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Shipping Method */}
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <ShippingIcon />
                                    <h2 className="text-[20px] font-semibold text-gray-800">{t.checkout.shippingCompany}</h2>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { id: 'standard', title: t.checkout.shippingMethods.standard, time: '3-5', price: 25 },
                                        { id: 'express', title: t.checkout.shippingMethods.express, time: '1-2', price: 45 },
                                        { id: 'overnight', title: t.checkout.shippingMethods.overnight, time: '24', price: 65 }
                                    ].map((method) => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center justify-between p-5 rounded-lg border-2 cursor-pointer transition-all ${shippingMethod === method.id ? 'border-accent bg-accent/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="radio"
                                                    name="shipping"
                                                    checked={shippingMethod === method.id}
                                                    onChange={() => setShippingMethod(method.id)}
                                                    className="w-5 h-5 accent-accent"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{method.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{method.time} {t.checkout.shippingMethods.days}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900" dir="ltr">{currency} {method.price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <CardIcon />
                                    <h2 className="text-[20px] font-semibold text-gray-800">{t.checkout.paymentMethod}</h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Methods Selection */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-accent bg-accent/5' : 'border-gray-100 bg-white'}`}>
                                            <input type="radio" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="w-5 h-5 accent-accent" />
                                            <span className="font-medium text-gray-800">{t.checkout.paymentMethods.creditCard}</span>
                                        </label>
                                        <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'apple_pay' ? 'border-accent bg-accent/5' : 'border-gray-100 bg-white'}`}>
                                            <input type="radio" checked={paymentMethod === 'apple_pay'} onChange={() => setPaymentMethod('apple_pay')} className="w-5 h-5 accent-accent" />
                                            <span className="font-medium text-gray-800">{t.checkout.paymentMethods.applePay}</span>
                                        </label>
                                    </div>

                                    {/* Card Details */}
                                    {paymentMethod === 'credit_card' && (
                                        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {/* Card Number */}
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.cardNumber} *</label>
                                                <input
                                                    type="text"
                                                    placeholder="1234 5678 9012 3456"
                                                    className={`w-full bg-[#fdfdfd] border ${showErrors && errors.cardNumber ? 'border-red-400' : 'border-gray-200'} rounded-lg py-4 px-5 focus:outline-none focus:border-accent transition-all`}
                                                    value={cardData.number}
                                                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                                                />
                                            </div>

                                            {/* Card Holder */}
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.cardHolder} *</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        placeholder={t.checkout.cardHolderPlaceholder}
                                                        className={`w-full bg-[#fdfdfd] border ${showErrors && errors.cardHolder ? 'border-red-400' : 'border-gray-200'} rounded-lg py-4 px-5 focus:outline-none focus:border-accent transition-all`}
                                                        value={cardData.holder}
                                                        onChange={(e) => setCardData({ ...cardData, holder: e.target.value })}
                                                    />
                                                    <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'left-4' : 'right-4'} flex items-center text-gray-300`}>
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3-0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expiry & CVV */}
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.expiryDate} *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        className={`w-full bg-[#fdfdfd] border ${showErrors && errors.expiry ? 'border-red-400' : 'border-gray-200'} rounded-lg py-4 px-5 focus:outline-none focus:border-accent transition-all`}
                                                        value={cardData.expiry}
                                                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-medium text-gray-600 block">{t.checkout.cvv} *</label>
                                                    <div className="relative group">
                                                        <input
                                                            type="text"
                                                            placeholder="123"
                                                            className={`w-full bg-[#fdfdfd] border ${showErrors && errors.cvv ? 'border-red-400' : 'border-gray-200'} rounded-lg py-4 px-5 focus:outline-none focus:border-accent transition-all`}
                                                            value={cardData.cvv}
                                                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                                        />
                                                        <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'left-4' : 'right-4'} flex items-center text-gray-300`}>
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-gray-400 flex items-center gap-2">
                                                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                                {t.checkout.securePayment}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex-1 bg-white text-gray-600 py-4 font-bold border-2 border-gray-100 hover:border-gray-200 rounded-lg smooth-transition"
                                >
                                    {t.checkout.back}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-accent text-white py-4 font-bold text-lg hover:bg-[#500000] rounded-lg smooth-transition shadow-xl shadow-accent/20"
                                >
                                    {t.checkout.placeOrder}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            {/* WhatsApp Float */}
            <a
                href="https://wa.me/yournumber"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-8 right-8 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 z-40"
            >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>

        </div>
    );
}

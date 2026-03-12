'use client';

import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function SuccessPage() {
    const { t, dir, language } = useLanguage();

    // Mock order data
    const orderData = {
        number: 'SHM-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        address: 'Palestinian Territories, Gaza, Rimal St, Bldg 45',
        paymentMethod: language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'
    };

    return (
        <div className="min-h-screen bg-white" dir={dir}>
            <Header />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-[600px] mx-auto text-center">
                    {/* Success Icon */}
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 animate-bounce">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-[32px] md:text-[40px] font-serif text-accent mb-4">
                        {t.checkout.success.title}
                    </h1>
                    <p className="text-gray-500 text-lg mb-12">
                        {t.checkout.success.subtitle}
                    </p>

                    {/* Order Details Card */}
                    <div className="bg-[#FBFBFB] border border-gray-100 rounded-2xl p-8 mb-12 text-start">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <span className="text-gray-500 text-sm font-medium">{t.checkout.success.orderNumber}</span>
                                <span className="text-gray-900 font-bold">#{orderData.number}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <span className="text-gray-500 text-sm font-medium">{t.checkout.success.orderDate}</span>
                                <span className="text-gray-900 font-medium">{orderData.date}</span>
                            </div>
                            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                                <span className="text-gray-500 text-sm font-medium">{t.checkout.success.shippingAddress}</span>
                                <span className="text-gray-900 font-medium text-end max-w-[200px]">{orderData.address}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-gray-500 text-sm font-medium">{t.checkout.success.paymentMethod}</span>
                                <span className="text-gray-900 font-medium">{orderData.paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    {/* Information Messages */}
                    <div className="space-y-4 mb-12">
                        <div className="flex justify-center items-center gap-3 text-sm text-gray-500">
                            <svg className="w-5 h-5 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {t.checkout.success.emailConfirmation}
                        </div>
                        <div className="flex justify-center items-center gap-3 text-sm text-gray-500">
                            <svg className="w-5 h-5 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t.checkout.success.shippingNotice}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <Link
                            href="/profile?tab=orders"
                            className="flex-1 bg-white text-gray-700 py-4 font-bold border-2 border-gray-100 hover:border-gray-200 rounded-lg transition-all"
                        >
                            {t.checkout.success.viewOrders}
                        </Link>
                        <Link
                            href="/collections"
                            className="flex-1 bg-accent text-white py-4 font-bold rounded-lg hover:bg-[#500000] shadow-xl shadow-accent/20 transition-all"
                        >
                            {t.checkout.success.continueShopping}
                        </Link>
                    </div>
                </div>
            </main>

        </div>
    );
}

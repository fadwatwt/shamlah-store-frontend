'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';
import { processTransaction, completeCheckout } from '@/lib/queries/cart';

export default function SuccessPage() {
    const { t, dir, language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const { clearCart } = useCart();
    const searchParams = useSearchParams();
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [processing, setProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handlePaymentCompletion = async () => {
            const checkoutId = searchParams.get('checkoutId');
            const transactionId = searchParams.get('transactionId');
            const orderId = searchParams.get('orderId');
            const paymentIntent = searchParams.get('payment_intent');

            // If orderId is provided directly (from successful payment)
            if (orderId) {
                setOrderNumber(orderId);
                clearCart();
                setProcessing(false);
                return;
            }

            // If coming from Stripe redirect with checkoutId and transactionId
            if (checkoutId && transactionId) {
                try {
                    // Process transaction to sync with Saleor
                    await processTransaction(transactionId);

                    // Complete the checkout
                    const result = await completeCheckout(checkoutId);

                    if (result.checkoutComplete?.order) {
                        setOrderNumber(result.checkoutComplete.order.number || result.checkoutComplete.order.id);
                        clearCart();
                    } else if (result.checkoutComplete?.errors?.length > 0) {
                        console.error('Checkout complete errors:', result.checkoutComplete.errors);
                        // Fallback: payment succeeded but checkoutComplete failed (webhook delay) — show payment reference instead of N/A
                        if (paymentIntent) {
                            setOrderNumber(paymentIntent.slice(-8).toUpperCase());
                        } else if (checkoutId) {
                            setOrderNumber(checkoutId.slice(-8).toUpperCase());
                        }
                        setError(result.checkoutComplete.errors.map((e: any) => e.message).join(', '));
                    } else {
                        // No order and no errors — still fall back to reference
                        if (paymentIntent) setOrderNumber(paymentIntent.slice(-8).toUpperCase());
                    }
                } catch (err) {
                    console.error('Payment completion error:', err);
                    setError(language === 'ar' ? 'حدث خطأ أثناء معالجة الدفع' : 'Error processing payment');
                } finally {
                    setProcessing(false);
                }
                return;
            }

            // Fallback: Stripe redirect with checkoutId but without transactionId (legacy return_url)
            if (checkoutId) {
                try {
                    // Try to complete directly — Stripe may have confirmed via webhook
                    const result = await completeCheckout(checkoutId);
                    if (result.checkoutComplete?.order) {
                        setOrderNumber(result.checkoutComplete.order.number || result.checkoutComplete.order.id);
                        clearCart();
                    } else if (result.checkoutComplete?.errors?.length > 0) {
                        console.error('Checkout complete (fallback) errors:', result.checkoutComplete.errors);
                        // Payment likely succeeded — show reference instead of N/A so user has something
                        if (paymentIntent) {
                            setOrderNumber(paymentIntent.slice(-8).toUpperCase());
                        } else {
                            setOrderNumber(checkoutId.slice(-8).toUpperCase());
                        }
                        setError(result.checkoutComplete.errors.map((e: any) => `${e.field}: ${e.message}`).join(' | '));
                    } else if (paymentIntent) {
                        // No order yet but we have payment_intent — order is being processed
                        setOrderNumber(paymentIntent.slice(-8).toUpperCase());
                    }
                } catch (err) {
                    console.error('Fallback checkoutComplete error:', err);
                    if (paymentIntent) setOrderNumber(paymentIntent.slice(-8).toUpperCase());
                    else setOrderNumber(checkoutId.slice(-8).toUpperCase());
                } finally {
                    setProcessing(false);
                }
                return;
            }

            // No payment params - show success anyway (direct access)
            setProcessing(false);
        };

        handlePaymentCompletion();
    }, [searchParams, language]);

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
                            {processing ? (
                                <div className="flex flex-col items-center py-8">
                                    <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mb-4"></div>
                                    <p className="text-gray-500">
                                        {language === 'ar' ? 'جاري تأكيد الطلب...' : 'Confirming your order...'}
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="py-8 text-center">
                                    <p className="text-red-500 mb-4">{error}</p>
                                    <p className="text-gray-500 text-sm">
                                        {language === 'ar'
                                            ? 'يمكنك مراجعة طلبك من صفحة الطلبات'
                                            : 'You can check your order from the orders page'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                        <span className="text-gray-500 text-sm font-medium">{t.checkout.success.orderNumber}</span>
                                        <span className="text-gray-900 font-bold">#{orderNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                        <span className="text-gray-500 text-sm font-medium">{t.checkout.success.orderDate}</span>
                                        <span className="text-gray-900 font-medium" suppressHydrationWarning>{new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2">
                                        <span className="text-gray-500 text-sm font-medium">{t.checkout.success.paymentMethod}</span>
                                        <span className="text-gray-900 font-medium">{language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Information Messages */}
                    <div className="space-y-4 mb-12">
                        {!isAuthenticated && (
                            <div className="flex justify-center items-center gap-3 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    {language === 'ar'
                                        ? 'تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني. يمكنك تتبع طلبك من خلال الرابط في البريد.'
                                        : 'Order details have been sent to your email. You can track your order using the link in the email.'}
                                </span>
                            </div>
                        )}
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
                        {isAuthenticated && (
                            <Link
                                href="/profile?tab=orders"
                                className="flex-1 bg-white text-gray-700 py-4 font-bold border-2 border-gray-100 hover:border-gray-200 rounded-lg transition-all"
                            >
                                {t.checkout.success.viewOrders}
                            </Link>
                        )}
                        <Link
                            href="/collections"
                            className={`${isAuthenticated ? 'flex-1' : 'w-full'} bg-accent text-white py-4 font-bold rounded-lg hover:bg-[#500000] shadow-xl shadow-accent/20 transition-all`}
                        >
                            {t.checkout.success.continueShopping}
                        </Link>
                    </div>
                </div>
            </main>

        </div>
    );
}

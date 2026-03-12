'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function OrdersPage() {
    const { t, dir, language } = useLanguage();
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    // Mock Data for Orders
    const orders = [
        {
            id: 'SHMLH-A7K9M2D3X',
            date: { ar: '15 ديسمبر 2024', en: 'December 15, 2024' },
            total: 1035,
            status: 'delivered', // delivered, shipped, processing
            items: [
                {
                    id: 1,
                    name: { ar: 'حقيبة الذاكرة الفلسطينية', en: 'Palestinian Memory Bag' },
                    price: 450,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=200',
                },
                {
                    id: 2,
                    name: { ar: 'شال التراث المطرز', en: 'Embroidered Heritage Shawl' },
                    price: 280,
                    quantity: 2,
                    image: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=200',
                },
            ],
            subtotal: 1010,
            shipping: 25,
        },
        {
            id: 'SHMLH-B4N8P1Q5Z',
            date: { ar: '28 نوفمبر 2024', en: 'November 28, 2024' },
            total: 720,
            status: 'shipped',
            items: [
                {
                    id: 3,
                    name: { ar: 'أقراط الريتون الذهبية', en: 'Golden Riton Earrings' },
                    price: 320,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80&w=200',
                },
                {
                    id: 4,
                    name: { ar: 'طقم تطريز يدوي', en: 'Hand Embroidery Kit' },
                    price: 400,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1605364850069-b5f7e7f7b311?auto=format&fit=crop&q=80&w=200'
                }
            ],
            subtotal: 720,
            shipping: 0,
        },
        {
            id: 'SHMLH-C6M7L3K9Y',
            date: { ar: '10 أكتوبر 2024', en: 'October 10, 2024' },
            total: 890,
            status: 'processing',
            items: [
                {
                    id: 5,
                    name: { ar: 'فستان الحرير الفلسطيني', en: 'Palestinian Silk Dress' },
                    price: 890,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200',
                },
            ],
            subtotal: 865,
            shipping: 25,
        },
    ];

    const toggleOrder = (orderId: string) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-50 text-green-600 border-green-100';
            case 'shipped':
                return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'processing':
                return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusLabel = (status: string) => {
        const statuses = t.orders.statuses;
        switch (status) {
            case 'delivered': return statuses.delivered;
            case 'shipped': return statuses.shipped;
            case 'processing': return statuses.processing;
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return (
                    <svg className={`w-4 h-4 ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'shipped':
                return (
                    <svg className={`w-4 h-4 ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'processing':
                return (
                    <svg className={`w-4 h-4 ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default: return null;
        }
    }

    return (
        <main className="min-h-screen pt-32 pb-20 bg-white md:px-24" dir={dir}>
            <div className="container mx-auto px-6 lg:px-12">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-accent font-serif mb-4">{t.orders.title}</h1>
                    <div className="w-16 h-1 bg-accent/20 mx-auto rounded-full"></div>
                </div>

                <div className="max-w-4xl mx-auto space-y-8">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-sm smooth-transition hover:shadow-md">
                            {/* Order Summary Header */}
                            <div className="bg-[#FAF9F6] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex flex-wrap gap-x-12 gap-y-4 text-sm w-full md:w-auto">
                                    <div>
                                        <span className="block text-gray-400 mb-1">{t.orders.orderNumber}</span>
                                        <span className="font-bold text-gray-800 font-english">{order.id}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 mb-1">{t.orders.date}</span>
                                        <span className="font-medium text-gray-800">{order.date[language]}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 mb-1">{t.orders.total}</span>
                                        <span className="font-bold text-accent font-english" dir="ltr">${order.total}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                    <div className={`flex items-center px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {getStatusLabel(order.status)}
                                    </div>

                                    <button
                                        onClick={() => toggleOrder(order.id)}
                                        className="flex items-center gap-2 px-4 py-2 border border-accent/20 text-accent rounded-md hover:bg-accent hover:text-white smooth-transition text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        {t.orders.viewDetails}
                                    </button>
                                </div>
                            </div>

                            {/* Order Items Preview (Collapsed) */}
                            {(!expandedOrderId || expandedOrderId !== order.id) ? (
                                <div className="p-6 bg-white flex gap-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-100">
                                            <Image
                                                src={item.image}
                                                alt={item.name[language]}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {/* Expanded Details */}
                            {expandedOrderId === order.id && (
                                <div className="p-6 bg-white border-t border-gray-100 animate-fadeIn">
                                    <h3 className="font-bold text-lg text-gray-900 mb-6 border-b border-gray-100 pb-2">{t.orders.viewDetails}</h3>

                                    <div className="space-y-6 mb-8">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex gap-6 items-center">
                                                <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name[language]}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between mb-1">
                                                        <h4 className="font-bold text-gray-800">{item.name[language]}</h4>
                                                        <span className="font-bold text-accent font-english" dir="ltr">${item.price * item.quantity}</span>
                                                    </div>
                                                    <p className="text-gray-500 text-sm">{language === 'ar' ? 'الكمية' : 'Quantity'}: <span className="font-english">{item.quantity}</span></p>

                                                    <p className="text-gray-400 text-xs font-english" dir="ltr">${item.price} / Item</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span>{t.cart.subtotal}</span>
                                            <span className="font-english" dir="ltr">${order.subtotal}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span>{t.cart.shipping}</span>
                                            <span className="font-english" dir="ltr">${order.shipping}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-accent">
                                            <span>{t.cart.total}</span>
                                            <span className="font-english" dir="ltr">${order.total}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Back Button */}
                <div className="text-center mt-12">
                    <Link href="/profile" className="inline-block px-8 py-3 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 smooth-transition font-medium">
                        {language === 'ar' ? 'العودة لحسابي' : 'Back to My Account'}
                    </Link>
                </div>

            </div>
        </main>
    );
}

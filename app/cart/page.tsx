'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

export default function CartPage() {
    const { t, dir, language } = useLanguage();
    const { items, loading, updateLineQuantity, removeFromCart, subtotal } = useCart();

    // Map Saleor items to UI structure if needed, or use directly
    // Saleor Item Structure:
    // { id, quantity, variant: { product: { name, thumbnail: { url } }, pricing: { price: { gross: { amount } } } } }

    const shipping = 0; // Calculated based on rules usually, defaulting to 0 or fixed for now
    const total = (subtotal?.amount || 0) + shipping;
    const currency = subtotal?.currency || 'USD';

    if (loading && items.length === 0) {
        return (
            <main className="min-h-screen pt-32 pb-20 px-4 md:px-24" dir={dir}>
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <p className="text-xl">Loading cart...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-32 pb-20 px-4 md:px-24" dir={dir}>
            <div className="container mx-auto px-6 lg:px-12">
                {/* Page Title */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-accent font-serif mb-4">{t.cart.title}</h1>
                    <div className="w-16 h-1 bg-accent/20 mx-auto rounded-full"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Cart Items */}
                    <div className="lg:w-2/3 space-y-6">
                        {items.length > 0 ? (
                            items.map((line) => {
                                const products = line.variant?.product;
                                const price = line.variant?.pricing?.price?.gross?.amount || 0;
                                const lineTotal = price * line.quantity;
                                const image = products?.thumbnail?.url || 'https://placehold.co/100x100?text=No+Image';
                                const name = products?.name || 'Unknown Product';
                                // Attributes can be finding in variant.attributes or product.attributes if needed

                                return (
                                    <div key={line.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex gap-6 items-center">
                                        {/* Product Image */}
                                        <div className="relative w-24 h-24 flex-shrink-0">
                                            <Image
                                                src={image}
                                                alt={name}
                                                fill
                                                className="object-cover rounded-md"
                                                unoptimized={image.startsWith('http://localhost')}
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-gray-800">{name}</h3>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900" dir="ltr">{currency} {price}</div>
                                                    {/* <div className="text-xs text-gray-500">Total: {currency} {lineTotal}</div> */}
                                                </div>
                                            </div>
                                            {/* Variant Name (Size/Color) */}
                                            <p className="text-sm text-gray-500 mb-4">{line.variant?.name !== line.variant?.id ? line.variant?.name : ''}</p>

                                            <div className="flex justify-between items-end">
                                                {/* Quantity Selector */}
                                                <div className="flex items-center border border-gray-200 rounded-lg">
                                                    <button
                                                        onClick={() => updateLineQuantity(line.id, line.quantity - 1)}
                                                        className={`w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 ${dir === 'rtl' ? 'rounded-r-lg' : 'rounded-l-lg'}`}
                                                        disabled={loading}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-medium">{line.quantity}</span>
                                                    <button
                                                        onClick={() => updateLineQuantity(line.id, line.quantity + 1)}
                                                        className={`w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 ${dir === 'rtl' ? 'rounded-l-lg' : 'rounded-r-lg'}`}
                                                        disabled={loading}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => removeFromCart(line.id)}
                                                    className="text-gray-400 hover:text-red-500 smooth-transition p-2"
                                                    aria-label="Delete item"
                                                    disabled={loading}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-4">{t.cart.empty}</p>
                                <Link href="/collections" className="text-accent underline hover:text-[#500000]">
                                    {t.cart.browse}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-[#F5F3F0] p-8 rounded-lg shadow-sm sticky top-32">
                            <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b border-gray-200 pb-4">
                                {t.cart.summary}
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-600">
                                    <span>{t.cart.subtotal}</span>
                                    <span className={language === 'ar' ? 'font-english' : ''} dir="ltr">{currency} {subtotal?.amount || 0}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>{t.cart.shipping}</span>
                                    <span className={language === 'ar' ? 'font-english' : ''} dir="ltr">{shipping > 0 ? `${currency} ${shipping}` : (language === 'ar' ? 'مجاني' : 'Free')}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between text-xl font-bold text-accent">
                                        <span>{t.cart.total}</span>
                                        <span className={language === 'ar' ? 'font-english' : ''} dir="ltr">{currency} {total}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Link
                                    href="/checkout"
                                    className="block w-full text-center bg-accent text-white py-4 rounded-lg font-bold hover:bg-[#500000] smooth-transition shadow-lg shadow-accent/20"
                                >
                                    {t.cart.checkout}
                                </Link>
                                <Link
                                    href="/collections"
                                    className="block w-full text-center bg-transparent border-2 border-gray-300 text-gray-600 py-3.5 rounded-lg font-bold hover:border-gray-400 hover:text-gray-800 smooth-transition"
                                >
                                    {t.cart.continue}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

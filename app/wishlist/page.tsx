'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
    const { t, dir, language } = useLanguage();
    const { items: wishlistItems, removeFromWishlist } = useWishlist();

    return (
        <main className="min-h-screen pt-32 pb-20 bg-white md:px-24" dir={dir}>
            <div className="container mx-auto px-6 lg:px-12">

                {/* Header */}
                <div className="text-center mb-12 mt-12">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/image.png"
                            alt="Separator"
                            width={32}
                            height={32}
                            className="object-contain opacity-80"
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-accent font-serif mb-4">{t.wishlist.title}</h1>
                    <p className="text-gray-500 mb-8">{wishlistItems.length} {t.wishlist.inYourWishlist}</p>
                </div>

                {wishlistItems.length > 0 ? (
                    <>
                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
                            {wishlistItems.map((item) => (
                                <ProductCard key={item.id} {...item} />
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-4">
                            <Link href="/products" className="inline-block px-12 py-3 bg-[#5a1214] text-white rounded-md hover:bg-[#4a0f10] smooth-transition font-medium">
                                {t.wishlist.continueShopping}
                            </Link>
                            <Link href="/profile" className="inline-block px-12 py-3 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 smooth-transition font-medium">
                                {t.common.backToProfile}
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 ">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.wishlist.empty}</h2>
                        <Link href="/products" className="inline-block px-8 py-3 bg-accent text-white rounded-md hover:bg-[#6B0000] smooth-transition">
                            {t.cart.continue}
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}

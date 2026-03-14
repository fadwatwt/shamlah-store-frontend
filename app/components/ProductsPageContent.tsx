'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    isBestSeller?: boolean;
    quantityAvailable?: number;
    isPreorder?: boolean;
    attributes?: Array<{
        attribute: { name: string };
        values: Array<{ name: string }>;
    }>;
}

interface ProductsPageContentProps {
    initialProducts: Product[];
}

export default function ProductsPageContent({ initialProducts }: ProductsPageContentProps) {
    const { dir, language } = useLanguage();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    return (
        <main className="pt-32 pb-24 px-6 min-h-screen" dir={dir}>
            <div className="container mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/image2.png"
                            alt="Separator"
                            width={32}
                            height={32}
                            className="object-contain opacity-80"
                        />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-accent mb-4">
                        {language === 'ar' ? 'المنتجات' : 'Products'}
                    </h1>
                    <p className="text-gray-600 text-base max-w-2xl mx-auto">
                        {language === 'ar'
                            ? 'اكتشف قطعاً خالدة مصنوعة من التراث الفلسطيني'
                            : 'Discover timeless pieces crafted with Palestinian heritage'}
                    </p>
                </div>

                {/* Toolbar (Filter Toggle & Sort) */}
                <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                            className="flex items-center gap-2 text-gray-700 hover:text-accent font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span>{language === 'ar' ? 'الفلترة' : 'Filter'}</span>
                        </button>
                        <span className="text-gray-500 text-sm hidden lg:block">
                            {initialProducts.length} {language === 'ar' ? 'منتج' : 'Products'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm">{language === 'ar' ? 'فرز حسب:' : 'Sort by:'}</span>
                        <select className="bg-transparent text-gray-800 font-medium focus:outline-none cursor-pointer">
                            <option>{language === 'ar' ? 'الافتراضي' : 'Default'}</option>
                            <option>{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                            <option>{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                            <option>{language === 'ar' ? 'الأحدث' : 'Newest'}</option>
                        </select>
                    </div>
                </div>

                <div className="relative">
                    {/* Sidebar Filters (Drawer) */}
                    <FilterSidebar
                        mobileFiltersOpen={mobileFiltersOpen}
                        setMobileFiltersOpen={setMobileFiltersOpen}
                    />

                    {/* Product Grid */}
                    <div className="w-full">
                        {initialProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {initialProducts.map((product) => (
                                    <ProductCard key={product.id} {...product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-lg">
                                <p className="text-gray-500 text-lg">
                                    {language === 'ar'
                                        ? 'جاري تحميل المنتجات...'
                                        : 'Loading products...'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

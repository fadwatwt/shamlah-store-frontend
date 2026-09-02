'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';
import { Collection } from '../../lib/types/saleor';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface ProductAttribute {
    attribute: { name: string; slug?: string };
    values: Array<{ name: string }>;
}

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    isBestSeller?: boolean;
    quantityAvailable?: number;
    isPreorder?: boolean;
    attributes?: ProductAttribute[];
    variants?: any[];
}

interface CollectionContentProps {
    collection: Collection;
    initialProducts: Product[];
}

type SortKey = 'default' | 'name_asc' | 'name_desc' | 'price_desc' | 'price_asc' | 'date_asc' | 'date_desc';

function filterProducts(products: Product[], searchParams: ReturnType<typeof useSearchParams>): Product[] {
    let result = [...products];

    // Stock availability
    const stockStatuses = searchParams.getAll('stockStatus');
    if (stockStatuses.length > 0) {
        result = result.filter(p => {
            const qty = p.quantityAvailable ?? 0;
            if (stockStatuses.includes('IN_STOCK') && qty > 0) return true;
            if (stockStatuses.includes('OUT_OF_STOCK') && qty === 0) return true;
            return false;
        });
    }

    // Price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

    // Attributes — format: attribute:slug:value
    const attrParams = searchParams.getAll('attributes');
    if (attrParams.length > 0) {
        const attrMap = new Map<string, string[]>();
        attrParams.forEach(attrStr => {
            const parts = attrStr.split(':');
            if (parts.length >= 3 && parts[0] === 'attribute') {
                const slug = parts[1];
                const value = parts.slice(2).join(':').toLowerCase();
                if (!attrMap.has(slug)) attrMap.set(slug, []);
                attrMap.get(slug)!.push(value);
            }
        });

        attrMap.forEach((values, slug) => {
            result = result.filter(product => {
                if (!product.attributes) return false;
                return product.attributes.some(group => {
                    const groupSlug = group.attribute.slug?.toLowerCase()
                        ?? group.attribute.name.toLowerCase().replace(/\s+/g, '-');
                    if (groupSlug !== slug) return false;
                    return group.values.some(v => values.includes(v.name.toLowerCase()));
                });
            });
        });
    }

    return result;
}

function sortProducts(products: Product[], key: SortKey): Product[] {
    const arr = [...products];
    switch (key) {
        case 'name_asc':     return arr.sort((a, b) => a.name.localeCompare(b.name));
        case 'name_desc':    return arr.sort((a, b) => b.name.localeCompare(a.name));
        case 'price_asc':    return arr.sort((a, b) => a.price - b.price);
        case 'price_desc':   return arr.sort((a, b) => b.price - a.price);
        case 'date_asc':     return arr.reverse();
        case 'date_desc':    return arr;
        default:             return arr;
    }
}

const SORT_OPTIONS: { value: SortKey; label: string; labelAr: string }[] = [
    { value: 'default',       label: 'Default sorting',        labelAr: 'مميز' },
    { value: 'name_asc',      label: 'Alphabetically, A-Z',    labelAr: 'أبجدياً، A-Z' },
    { value: 'name_desc',     label: 'Alphabetically, Z-A',    labelAr: 'أبجدياً، Z-A' },
    { value: 'price_desc',    label: 'Price, high to low',     labelAr: 'السعر من الأعلى للأدنى' },
    { value: 'price_asc',     label: 'Price, low to high',     labelAr: 'السعر من الأدنى للأعلى' },
    { value: 'date_asc',      label: 'Date, old to new',       labelAr: 'التاريخ، من القديم إلى الجديد' },
    { value: 'date_desc',     label: 'Date, new to old',       labelAr: 'التاريخ، من الأحدث إلى الأقدم' },
];

export default function CollectionContent({ collection, initialProducts }: CollectionContentProps) {
    const { dir, language } = useLanguage();
    const searchParams = useSearchParams();
    const [sortKey, setSortKey] = useState<SortKey>('default');

    const getName = () => {
        if (language === 'ar' && collection.translation?.name) return collection.translation.name;
        return collection.name;
    };

    const getDescription = () => {
        if (language === 'ar' && collection.translation?.description) return collection.translation.description;
        return collection.description || '';
    };

    const name = getName();
    const description = getDescription();
    const bgImage = collection.backgroundImage?.url;

    const displayProducts = useMemo(
        () => sortProducts(filterProducts(initialProducts, searchParams), sortKey),
        [initialProducts, searchParams, sortKey]
    );

    return (
        <main className="pt-32 pb-24 px-6 min-h-screen" dir={dir}>
            <div className="container mx-auto">
                {/* Collection Header */}
                <div className="relative rounded-lg overflow-hidden mb-16">
                    {bgImage && (
                        <div className="absolute inset-0">
                            <Image
                                src={bgImage}
                                alt={name}
                                fill
                                sizes="100vw"
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>
                    )}
                    <div className={`relative py-16 md:py-24 px-6 md:px-12 text-center ${bgImage ? 'text-white' : 'text-accent'}`}>
                        <div className="flex justify-center mb-4">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L14.4 7.2L20 8.4L16 12.6L16.8 18.4L12 16L7.2 18.4L8 12.6L4 8.4L9.6 7.2L12 2Z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{name}</h1>
                        {description && (
                            <p className={`text-base max-w-2xl mx-auto ${bgImage ? 'text-white/80' : 'text-gray-600'}`}>
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-4 items-center border-b border-gray-200 pb-4 mb-8">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm">{language === 'ar' ? 'ترتيب حسب:' : 'Sort by:'}</span>
                        <select
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value as SortKey)}
                            className="bg-transparent text-gray-800 font-medium focus:outline-none cursor-pointer text-sm"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {language === 'ar' ? opt.labelAr : opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <span className="text-gray-500 text-sm hidden lg:block ms-auto">
                        {displayProducts.length} {language === 'ar' ? 'منتج' : 'Products'}
                    </span>
                </div>

                {displayProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {displayProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">
                            {language === 'ar'
                                ? 'لا توجد منتجات متاحة في هذه المجموعة حالياً'
                                : 'No products available in this collection yet'}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

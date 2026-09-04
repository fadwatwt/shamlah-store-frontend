'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';
import { Category, SaleorAttribute } from '../../lib/types/saleor';
import FilterSidebar from './FilterSidebar';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface ProductAttribute {
    attribute: { name: string; slug?: string; translation?: { name?: string } | null };
    values: Array<{ name: string; slug?: string; translation?: { name?: string } | null }>;
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

interface CategoryContentProps {
    category: Category;
    initialProducts: Product[];
    channel?: string;
    attributeOptions?: SaleorAttribute[];
}

type SortKey = 'default' | 'most_relevant' | 'best_selling' | 'name_asc' | 'name_desc' | 'price_desc' | 'price_asc' | 'date_asc' | 'date_desc';

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
        // Group by attribute slug (AND between groups, OR within group)
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
                    return group.values.some(v =>
                        values.includes(v.name.toLowerCase()) ||
                        (v.slug ? values.includes(v.slug.toLowerCase()) : false)
                    );
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
        case 'best_selling': return arr.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        default:             return arr;
    }
}

const SORT_OPTIONS: { value: SortKey; label: string; labelAr: string }[] = [
    { value: 'default',       label: 'Default sorting',        labelAr: 'مميز' },
    { value: 'most_relevant', label: 'Most Relevant',           labelAr: 'الأكثر صلة' },
    { value: 'best_selling',  label: 'Best Selling',            labelAr: 'الأكثر مبيعاً' },
    { value: 'name_asc',      label: 'Alphabetically, A-Z',    labelAr: 'أبجدياً، A-Z' },
    { value: 'name_desc',     label: 'Alphabetically, Z-A',    labelAr: 'أبجدياً، Z-A' },
    { value: 'price_desc',    label: 'Price, high to low',     labelAr: 'السعر من الأعلى للأدنى' },
    { value: 'price_asc',     label: 'Price, low to high',     labelAr: 'السعر من الأدنى للأعلى' },
    { value: 'date_asc',      label: 'Date, old to new',       labelAr: 'التاريخ، من القديم إلى الجديد' },
    { value: 'date_desc',     label: 'Date, new to old',       labelAr: 'التاريخ، من الأحدث إلى الأقدم' },
];

export default function CategoryContent({ category, initialProducts, channel, attributeOptions }: CategoryContentProps) {
    const { dir, language } = useLanguage();
    const searchParams = useSearchParams();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>('default');

    const categoryName = category.translation?.name || category.name;
    const categoryDescription = category.translation?.description || category.description;

    // Filter then sort — both happen instantly on the client
    const displayProducts = useMemo(
        () => sortProducts(filterProducts(initialProducts, searchParams), sortKey),
        [initialProducts, searchParams, sortKey]
    );

    return (
        <main className="pt-32 pb-24 px-6 min-h-screen" dir={dir}>
            <div className="container mx-auto">
                {/* Category Header */}
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-4">
                        <Image src="/image2.png" alt="Separator" width={32} height={32} className="object-contain opacity-80" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-accent mb-4">{categoryName}</h1>
                    {categoryDescription && (
                        <p className="text-gray-600 text-base max-w-2xl mx-auto">{categoryDescription}</p>
                    )}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-4 items-center border-b border-gray-200 pb-4 mb-8">
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

                        <span className="text-gray-300">|</span>

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

                <div className="relative">
                    <FilterSidebar
                        mobileFiltersOpen={mobileFiltersOpen}
                        setMobileFiltersOpen={setMobileFiltersOpen}
                        categorySlug={category.slug}
                        products={initialProducts}
                        attributeOptions={attributeOptions}
                    />

                    <div className="w-full">
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
                                        ? 'لا توجد منتجات تطابق الفلتر المحدد'
                                        : 'No products match the selected filters'}
                                </p>
                                {channel && process.env.NODE_ENV === 'development' && (
                                    <div className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded max-w-md mx-auto text-left">
                                        <p>Channel: {channel} | Category: {category.name} ({category.id})</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

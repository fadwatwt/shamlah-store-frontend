'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterSidebarProps {
    mobileFiltersOpen: boolean;
    setMobileFiltersOpen: (open: boolean) => void;
    categorySlug?: string;
}

type LocalFilters = Record<string, string[]>;

function parseParams(params: ReturnType<typeof useSearchParams>): LocalFilters {
    const result: LocalFilters = {};
    params.forEach((value, key) => {
        if (!result[key]) result[key] = [];
        result[key].push(value);
    });
    return result;
}

export default function FilterSidebar({ mobileFiltersOpen, setMobileFiltersOpen, categorySlug }: FilterSidebarProps) {
    const { language, t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    const isClothing = !categorySlug || categorySlug.includes('clothing') || categorySlug.includes('apparel') || categorySlug === 'default';
    const isBags = categorySlug?.includes('bag') || categorySlug?.includes('accessories');

    const filters = {
        availability: [
            { id: 'IN_STOCK', name: { en: 'In stock', ar: 'متوفر الآن' } },
            { id: 'OUT_OF_STOCK', name: { en: 'Out of stock', ar: 'نفد من المخزون' } },
            { id: 'attribute:availability:coming-soon', name: { en: 'Coming soon / Back in stock', ar: 'متوفر قريبًا' } },
        ],
        sizes: isBags
            ? ['small', 'medium', 'large']
            : ['xs', 's', 'm', 'l', 'xl', 'xxl'],
        genders: [
            { id: 'man', name: { en: 'Men', ar: 'رجالي' } },
            { id: 'woman', name: { en: 'Women', ar: 'نسائي' } },
            { id: 'unisex', name: { en: 'Unisex', ar: 'لكلا الجنسين' } },
        ],
        features: [
            { id: 'lightweight', name: { en: 'Lightweight', ar: 'خفيف الوزن' } },
            { id: 'versatile', name: { en: 'Versatile', ar: 'متعدد الاستخدامات' } },
            { id: 'water-resistant', name: { en: 'Water-resistant', ar: 'مقاوم للماء' } },
            { id: 'easy-care', name: { en: 'Easy care', ar: 'سهل العناية' } },
            ...(isClothing && !isBags ? [
                { id: 'breathable', name: { en: 'Breathable', ar: 'قابل للتنفس' } },
                { id: 'wrinkle-resistant', name: { en: 'Wrinkle-resistant', ar: 'لا يتجعّد / مقاوم للتجعّد' } },
                { id: 'no-iron', name: { en: 'No-iron / Iron-free', ar: 'لا يحتاج كيّ' } },
                { id: 'non-see-through', name: { en: 'Non-see-through', ar: 'غير شفّاف' } },
                { id: 'lined', name: { en: 'Lined', ar: 'مبطن' } },
            ] : []),
            ...(isBags ? [
                { id: 'multiple-pockets', name: { en: 'Multiple pockets', ar: 'جيوب متعددة' } },
                { id: 'adjustable-strap', name: { en: 'Adjustable strap', ar: 'حزام قابل للتعديل' } },
                { id: 'travel-friendly', name: { en: 'Travel-friendly', ar: 'مناسب للسفر' } },
            ] : []),
        ]
    };

    const [expandedSections, setExpandedSections] = useState({
        availability: true,
        price: true,
        size: true,
        gender: false,
        features: false,
    });

    // Optimistic local filter state — updates immediately on click
    const [localFilters, setLocalFilters] = useState<LocalFilters>(() => parseParams(searchParams));

    // Sync local state when URL params change (e.g. browser back/forward, external navigation)
    const paramsKey = searchParams.toString();
    useEffect(() => {
        setLocalFilters(parseParams(searchParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsKey]);

    const [priceMin, setPriceMin] = useState(searchParams.get('minPrice') || '');
    const [priceMax, setPriceMax] = useState(searchParams.get('maxPrice') || '');

    useEffect(() => {
        setPriceMin(searchParams.get('minPrice') || '');
        setPriceMax(searchParams.get('maxPrice') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsKey]);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const isChecked = useCallback((key: string, value: string) => {
        return localFilters[key]?.includes(value) ?? false;
    }, [localFilters]);

    // Only updates local UI state — no request sent until "View Results"
    const updateFilter = useCallback((key: string, value: string, checked: boolean) => {
        setLocalFilters(prev => {
            const current = prev[key] ?? [];
            if (checked) {
                if (current.includes(value)) return prev;
                return { ...prev, [key]: [...current, value] };
            } else {
                const next = current.filter(v => v !== value);
                if (next.length === 0) {
                    const copy = { ...prev };
                    delete copy[key];
                    return copy;
                }
                return { ...prev, [key]: next };
            }
        });
    }, []);

    // Applies all pending localFilters + price to the URL (triggers server fetch)
    const applyFilters = useCallback(() => {
        const params = new URLSearchParams();
        Object.entries(localFilters).forEach(([key, values]) => {
            values.forEach(v => params.append(key, v));
        });
        if (priceMin) params.set('minPrice', priceMin);
        if (priceMax) params.set('maxPrice', priceMax);
        router.push(`?${params.toString()}`, { scroll: false });
        setMobileFiltersOpen(false);
    }, [localFilters, priceMin, priceMax, router, setMobileFiltersOpen]);

    const clearAll = () => {
        setLocalFilters({});
        setPriceMin('');
        setPriceMax('');
        router.push(window.location.pathname, { scroll: false });
    };

    const renderSizeLabel = (size: string) => {
        if (language === 'ar') {
            switch (size.toLowerCase()) {
                case 'small': return 'صغير';
                case 'medium': return 'وسط';
                case 'large': return 'كبير';
                default: return size.toUpperCase();
            }
        }
        if (isBags || ['small', 'medium', 'large'].includes(size.toLowerCase())) {
            return size.charAt(0).toUpperCase() + size.slice(1);
        }
        return size.toUpperCase();
    };

    return (
        <>
            {/* Backdrop */}
            {mobileFiltersOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                    onClick={() => setMobileFiltersOpen(false)}
                />
            )}

            {/* Sidebar Drawer */}
            <aside
                className={`fixed top-0 bottom-0 z-50 w-80 bg-white p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out shadow-2xl ${mobileFiltersOpen
                    ? language === 'ar' ? 'right-0' : 'left-0'
                    : language === 'ar' ? '-right-full' : '-left-full'
                    }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{language === 'ar' ? 'الفلترة' : 'Filters'}</h2>
                    <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="p-2 hover:bg-gray-100 rounded-full smooth-transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Availability Filter */}
                <div className="border-b border-gray-100 pb-6">
                    <button onClick={() => toggleSection('availability')} className="flex items-center justify-between w-full mb-4 group">
                        <span className="font-semibold text-gray-800">{language === 'ar' ? 'التوفر' : 'Availability'}</span>
                        <svg className={`w-4 h-4 transition-transform ${expandedSections.availability ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {expandedSections.availability && (
                        <div className="space-y-3">
                            {filters.availability.map((item) => {
                                const key = item.id.includes('attribute') ? 'attributes' : 'stockStatus';
                                return (
                                    <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={isChecked(key, item.id)}
                                            onChange={(e) => updateFilter(key, item.id, e.target.checked)}
                                            className="w-4 h-4 border-gray-300 rounded text-accent focus:ring-accent"
                                        />
                                        <span className="text-gray-600 group-hover:text-accent transition-colors">
                                            {language === 'ar' ? item.name.ar : item.name.en}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Price Filter */}
                <div className="border-b border-gray-100 pb-6">
                    <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full mb-4 group">
                        <span className="font-semibold text-gray-800">{language === 'ar' ? 'السعر' : 'Price'}</span>
                        <svg className={`w-4 h-4 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {expandedSections.price && (
                        <div className="flex items-center gap-4 mb-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{t.common.currency}</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceMin}
                                    onChange={(e) => setPriceMin(e.target.value)}
                                    className="w-full pl-12 pr-3 py-2 border border-gray-200 rounded text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                                />
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{t.common.currency}</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceMax}
                                    onChange={(e) => setPriceMax(e.target.value)}
                                    className="w-full pl-12 pr-3 py-2 border border-gray-200 rounded text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Size Filter */}
                <div className="border-b border-gray-100 pb-6">
                    <button onClick={() => toggleSection('size')} className="flex items-center justify-between w-full mb-4 group">
                        <span className="font-semibold text-gray-800">{language === 'ar' ? 'الحجم' : 'Size'}</span>
                        <svg className={`w-4 h-4 transition-transform ${expandedSections.size ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {expandedSections.size && (
                        <div className="grid grid-cols-4 gap-2">
                            {filters.sizes.map((size) => {
                                const value = `attribute:size:${size}`;
                                const active = isChecked('attributes', value);
                                return (
                                    <button
                                        key={size}
                                        onClick={() => updateFilter('attributes', value, !active)}
                                        className={`h-10 border rounded text-sm font-medium transition-colors ${active
                                            ? 'border-accent bg-accent text-white'
                                            : 'border-gray-200 hover:border-accent hover:text-accent'
                                            }`}
                                    >
                                        {renderSizeLabel(size)}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Features Filter */}
                {filters.features.length > 0 && (
                    <div className="border-b border-gray-100 pb-6">
                        <button onClick={() => toggleSection('features')} className="flex items-center justify-between w-full mb-4 group">
                            <span className="font-semibold text-gray-800">{language === 'ar' ? 'الميزات' : 'Features'}</span>
                            <svg className={`w-4 h-4 transition-transform ${expandedSections.features ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {expandedSections.features && (
                            <div className="space-y-3">
                                {filters.features.map((feature) => {
                                    const value = `attribute:features:${feature.id}`;
                                    return (
                                        <label key={feature.id} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={isChecked('attributes', value)}
                                                onChange={(e) => updateFilter('attributes', value, e.target.checked)}
                                                className="w-4 h-4 border-gray-300 rounded text-accent focus:ring-accent"
                                            />
                                            <span className="text-gray-600 group-hover:text-accent transition-colors">
                                                {language === 'ar' ? feature.name.ar : feature.name.en}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Gender Filter */}
                <div className="border-b border-gray-100 pb-6">
                    <button onClick={() => toggleSection('gender')} className="flex items-center justify-between w-full mb-4 group">
                        <span className="font-semibold text-gray-800">{language === 'ar' ? 'الجنس' : 'Gender'}</span>
                        <svg className={`w-4 h-4 transition-transform ${expandedSections.gender ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {expandedSections.gender && (
                        <div className="space-y-3">
                            {filters.genders.map((item) => {
                                const value = `attribute:sex:${item.id}`;
                                return (
                                    <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={isChecked('attributes', value)}
                                            onChange={(e) => updateFilter('attributes', value, e.target.checked)}
                                            className="w-4 h-4 border-gray-300 rounded text-accent focus:ring-accent"
                                        />
                                        <span className="text-gray-600 group-hover:text-accent transition-colors">
                                            {language === 'ar' ? item.name.ar : item.name.en}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        onClick={clearAll}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:border-gray-400"
                    >
                        {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                    </button>
                    <button
                        onClick={applyFilters}
                        className="flex-1 px-4 py-2 bg-accent text-white rounded text-sm hover:bg-[#5a1214]"
                    >
                        {language === 'ar' ? 'عرض النتائج' : 'View Results'}
                    </button>
                </div>
            </aside>
        </>
    );
}

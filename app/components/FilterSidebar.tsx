'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterSidebarProps {
    mobileFiltersOpen: boolean;
    setMobileFiltersOpen: (open: boolean) => void;
    categorySlug?: string;
}

export default function FilterSidebar({ mobileFiltersOpen, setMobileFiltersOpen, categorySlug }: FilterSidebarProps) {
    const { language, t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    const isClothing = !categorySlug || categorySlug.includes('clothing') || categorySlug.includes('apparel') || categorySlug === 'default';
    const isBags = categorySlug?.includes('bag') || categorySlug?.includes('accessories');

    // Filter Options
    const filters = {
        availability: [
            { id: 'IN_STOCK', name: { en: 'In stock', ar: 'متوفر الآن' } },
            { id: 'OUT_OF_STOCK', name: { en: 'Out of stock', ar: 'نفد من المخزون' } },
            // 'Coming soon' is handled as an attribute usually, but user asked for it in Availability context
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
            // Common
            { id: 'lightweight', name: { en: 'Lightweight', ar: 'خفيف الوزن' } },
            { id: 'versatile', name: { en: 'Versatile', ar: 'متعدد الاستخدامات' } },
            { id: 'water-resistant', name: { en: 'Water-resistant', ar: 'مقاوم للماء' } },
            { id: 'easy-care', name: { en: 'Easy care', ar: 'سهل العناية' } },
            // Clothing Specific
            ...(isClothing && !isBags ? [
                { id: 'breathable', name: { en: 'Breathable', ar: 'قابل للتنفس' } },
                { id: 'wrinkle-resistant', name: { en: 'Wrinkle-resistant', ar: 'لا يتجعّد / مقاوم للتجعّد' } },
                { id: 'no-iron', name: { en: 'No-iron / Iron-free', ar: 'لا يحتاج كيّ' } },
                { id: 'non-see-through', name: { en: 'Non-see-through', ar: 'غير شفّاف' } },
                { id: 'lined', name: { en: 'Lined', ar: 'مبطن' } },
            ] : []),
            // Bag Specific
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

    // Local state for filters to allow batch applying or instant apply
    // For sidebar UX, often instant apply is expected on desktop, but apply button on mobile. 
    // Let's implement instant apply for now via URL updates.

    const [priceMin, setPriceMin] = useState(searchParams.get('minPrice') || '');
    const [priceMax, setPriceMax] = useState(searchParams.get('maxPrice') || '');

    useEffect(() => {
        setPriceMin(searchParams.get('minPrice') || '');
        setPriceMax(searchParams.get('maxPrice') || '');
    }, [searchParams]);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updateFilter = (key: string, value: string, checked: boolean) => {
        const params = new URLSearchParams(searchParams.toString());
        const current = params.getAll(key);

        if (checked) {
            if (!current.includes(value)) {
                params.append(key, value);
            }
        } else {
            params.delete(key);
            current.filter(v => v !== value).forEach(v => params.append(key, v));
        }

        // Reset page on filter change
        params.delete('page');

        router.push(`?${params.toString()}`, { scroll: false });
    };

    const updatePrice = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (priceMin) params.set('minPrice', priceMin); else params.delete('minPrice');
        if (priceMax) params.set('maxPrice', priceMax); else params.delete('maxPrice');
        params.delete('page');
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePriceKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            updatePrice();
        }
    };

    const clearAll = () => {
        router.push(window.location.pathname, { scroll: false });
    };

    const isChecked = (key: string, value: string) => {
        return searchParams.getAll(key).includes(value);
    };

    // Helper to render size label
    const renderSizeLabel = (size: string) => {
        if (language === 'ar') {
            switch (size.toLowerCase()) {
                case 'small': return 'صغير';
                case 'medium': return 'وسط';
                case 'large': return 'كبير';
                case 'xs': return 'XS';
                case 's': return 'S';
                case 'm': return 'M';
                case 'l': return 'L';
                case 'xl': return 'XL';
                case 'xxl': return 'XXL';
                default: return size.toUpperCase();
            }
        }
        // Capitalize specific bag sizes, uppercase otherwise (for clothing codes like XS, S, M)
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
                    <button
                        onClick={() => toggleSection('availability')}
                        className="flex items-center justify-between w-full mb-4 group"
                    >
                        <span className="font-semibold text-gray-800">{language === 'ar' ? 'التوفر' : 'Availability'}</span>
                        <svg className={`w-4 h-4 transition-transform ${expandedSections.availability ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {expandedSections.availability && (
                        <div className="space-y-3">
                            {filters.availability.map((item) => (
                                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isChecked(item.id.includes('attribute') ? 'attributes' : 'stockStatus', item.id)}
                                        onChange={(e) => updateFilter(item.id.includes('attribute') ? 'attributes' : 'stockStatus', item.id, e.target.checked)}
                                        className="w-4 h-4 border-gray-300 rounded text-accent focus:ring-accent"
                                    />
                                    <span className="text-gray-600 group-hover:text-accent transition-colors">
                                        {language === 'ar' ? item.name.ar : item.name.en}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Filter */}
                <div className="border-b border-gray-100 pb-6">
                    <button
                        onClick={() => toggleSection('price')}
                        className="flex items-center justify-between w-full mb-4 group"
                    >
                        <span className="font-semibold text-gray-800">{language === 'ar' ? 'السعر' : 'Price'}</span>
                        <svg className={`w-4 h-4 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {expandedSections.price && (
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{t.common.currency}</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        onKeyDown={handlePriceKeyDown}
                                        onBlur={updatePrice}
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
                                        onKeyDown={handlePriceKeyDown}
                                        onBlur={updatePrice}
                                        className="w-full pl-12 pr-3 py-2 border border-gray-200 rounded text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Size Filter */}
                <div className="border-b border-gray-100 pb-6">
                    <button
                        onClick={() => toggleSection('size')}
                        className="flex items-center justify-between w-full mb-4 group"
                    >
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
                        <button
                            onClick={() => toggleSection('features')}
                            className="flex items-center justify-between w-full mb-4 group"
                        >
                            <span className="font-semibold text-gray-800">{language === 'ar' ? 'الميزات' : 'Features'}</span>
                            <svg className={`w-4 h-4 transition-transform ${expandedSections.features ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {expandedSections.features && (
                            <div className="space-y-3">
                                {filters.features.map((feature) => {
                                    // Assuming 'features' is the attribute slug for features
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
                    <button
                        onClick={() => toggleSection('gender')}
                        className="flex items-center justify-between w-full mb-4 group"
                    >
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
                        onClick={() => setMobileFiltersOpen(false)}
                        className="flex-1 px-4 py-2 bg-accent text-white rounded text-sm hover:bg-[#5a1214]"
                    >
                        {language === 'ar' ? 'عرض النتائج' : 'View Results'}
                    </button>
                </div>
            </aside>
        </>
    );
}

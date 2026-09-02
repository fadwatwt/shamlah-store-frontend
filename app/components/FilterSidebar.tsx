'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCategoryFilterConfig, FilterGroup, attributeParam } from './filterConfig';

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
    const { language } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    const config = getCategoryFilterConfig(categorySlug);
    const groups: FilterGroup[] = config.groups;

    const initialExpanded: Record<string, boolean> = {
        availability: true,
        price: true,
    };
    groups.forEach((g, i) => {
        initialExpanded[g.key] = i < 2; // expand first two attribute groups by default
    });
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(initialExpanded);

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

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            // Lazy-expand new groups as they're added (e.g. user navigates between categories)
            if (!(section in prev)) return { ...prev, [section]: true };
            return { ...prev, [section]: !prev[section] };
        });
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

    const label = (item: { en: string; ar: string }) => (language === 'ar' ? item.ar : item.en);

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
                            {[{ id: 'IN_STOCK', label: { en: 'In stock', ar: 'متوفر الآن' } }, { id: 'OUT_OF_STOCK', label: { en: 'Out of stock', ar: 'نفد من المخزون' } }].map((item) => (
                                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isChecked('stockStatus', item.id)}
                                        onChange={(e) => updateFilter('stockStatus', item.id, e.target.checked)}
                                        className="w-4 h-4 border-gray-300 rounded text-accent focus:ring-accent"
                                    />
                                    <span className="text-gray-600 group-hover:text-accent transition-colors">
                                        {label(item.label)}
                                    </span>
                                </label>
                            ))}
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
                            <input
                                type="number"
                                placeholder={language === 'ar' ? 'الحد الأدنى' : 'Min'}
                                value={priceMin}
                                onChange={(e) => setPriceMin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="number"
                                placeholder={language === 'ar' ? 'الحد الأقصى' : 'Max'}
                                value={priceMax}
                                onChange={(e) => setPriceMax(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                            />
                        </div>
                    )}
                </div>

                {/* Category-specific Attribute Filters */}
                {groups.map((group) => {
                    const expanded = !!expandedSections[group.key];
                    return (
                        <div key={group.key} className="border-b border-gray-100 pb-6">
                            <button onClick={() => toggleSection(group.key)} className="flex items-center justify-between w-full mb-4 group">
                                <span className="font-semibold text-gray-800">{label(group.label)}</span>
                                <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {expanded && (
                                <div className="space-y-3">
                                    {group.values.map((item) => {
                                        const value = attributeParam(group.attributeSlug, item.value);
                                        return (
                                            <label key={item.value} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked('attributes', value)}
                                                    onChange={(e) => updateFilter('attributes', value, e.target.checked)}
                                                    className="w-4 h-4 border-gray-300 rounded text-accent focus:ring-accent"
                                                />
                                                <span className="text-gray-600 group-hover:text-accent transition-colors">
                                                    {label(item.label)}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

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

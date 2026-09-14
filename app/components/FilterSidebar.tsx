'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { SaleorAttribute } from '../../lib/types/saleor';
import { isColorAttribute, displayAttributeName } from '../../lib/utils/attributes';
import { normalizeDigits } from '../../lib/utils/formatPrice';

// Builds the attribute URL param value. The backend filter matches by value slug.
function attributeParam(attributeSlug: string, valueSlug: string): string {
    return `attribute:${attributeSlug}:${valueSlug}`;
}

interface FilterProductAttribute {
    attribute: {
        name: string;
        slug?: string;
        translation?: { name?: string } | null;
    };
    values: Array<{
        name: string;
        slug?: string;
        translation?: { name?: string } | null;
    }>;
}

interface FilterProduct {
    attributes?: FilterProductAttribute[];
    categorySlug?: string | null;
}

interface FilterCategory {
    slug: string;
    label: string;
}

interface FilterSidebarProps {
    mobileFiltersOpen: boolean;
    setMobileFiltersOpen: (open: boolean) => void;
    products?: FilterProduct[];
    attributeOptions?: SaleorAttribute[];
    // When provided (general products page), a "Category" step shows FIRST and
    // the attribute groups below narrow to the selected category's products.
    categories?: FilterCategory[];
}

// A single filterable group derived from Saleor attributes
interface FilterGroup {
    attributeSlug: string;
    label: string;
    values: Array<{ value: string; label: string }>;
}

type LocalFilters = Record<string, string[]>;

// Internal/system attributes that should not appear as user-facing filters
// (color is presented as native swatches, notes/labels/best seller are metadata).
// NOTE: the primary control is the Saleor Dashboard toggle
// "Filterable in storefront" per attribute — this list is only a safety net
// for system attributes that must never appear as filters.
const EXCLUDED_ATTRIBUTE_SLUGS = new Set([
    'color',
    'colors',
    'product-notes',
    'product-label',
    'label',
    'best-seller',
    'care-instructions',
]);
const EXCLUDED_ATTRIBUTE_NAMES = new Set([
    'color',
    'colors',
    'product notes',
    'product label',
    'label',
    'best seller',
    'care instructions',
    'اللون',
    'ألوان',
    'ملاحظات المنتج',
    'الأكثر مبيعاً',
    'تعليمات العناية',
]);

function isExcludedAttribute(attr: FilterProductAttribute): boolean {
    // Color attributes store hex codes as value names —
    // they render as swatches, not as filter checkboxes.
    if (isColorAttribute(attr.attribute)) return true;
    const slug = attr.attribute.slug?.toLowerCase() || '';
    const name = attr.attribute.name?.toLowerCase() || '';
    if (slug && EXCLUDED_ATTRIBUTE_SLUGS.has(slug)) return true;
    if (name && EXCLUDED_ATTRIBUTE_NAMES.has(name)) return true;
    return false;
}

function parseParams(params: ReturnType<typeof useSearchParams>): LocalFilters {
    const result: LocalFilters = {};
    params.forEach((value, key) => {
        if (!result[key]) result[key] = [];
        result[key].push(value);
    });
    return result;
}

export default function FilterSidebar({ mobileFiltersOpen, setMobileFiltersOpen, products, attributeOptions, categories }: FilterSidebarProps) {
    const { language, t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Category-first step (general products page): single-select via URL param.
    const selectedCategory = searchParams.get('category') || '';
    const hasCategoryStep = !!categories && categories.length > 0;

    const selectCategory = useCallback((slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        // Switching category invalidates attribute selections from another category
        params.delete('attributes');
        if (slug) params.set('category', slug);
        else params.delete('category');
        const qs = params.toString();
        router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    }, [router, searchParams]);

    // Products scoped to the selected category — attribute groups below are
    // derived from this subset, so details follow the category choice.
    const scopedProducts = useMemo(() => {
        if (!products) return products;
        if (!selectedCategory) return products;
        const want = selectedCategory.toLowerCase();
        return products.filter(p => (p.categorySlug || '').toLowerCase() === want);
    }, [products, selectedCategory]);

    // Category options with live product counts (only categories present on this page)
    const categoryOptions = useMemo(() => {
        if (!hasCategoryStep) return [];
        const counts = new Map<string, number>();
        for (const p of products || []) {
            const slug = (p.categorySlug || '').toLowerCase();
            if (!slug) continue;
            counts.set(slug, (counts.get(slug) || 0) + 1);
        }
        return (categories || [])
            .filter(c => (counts.get(c.slug.toLowerCase()) || 0) > 0)
            .map(c => ({ slug: c.slug, label: c.label, count: counts.get(c.slug.toLowerCase()) || 0 }));
    }, [categories, products, hasCategoryStep]);

    // Build filter groups dynamically from Saleor attribute definitions + products.
    // - Attribute definitions (attributeOptions) provide EVERY predefined value + translation.
    // - Products contribute any extra values (e.g. free-text attributes with no choices).
    // Groups only include attributes actually used by the listed (scoped) products.
    const groups: FilterGroup[] = useMemo(() => {
        const source = scopedProducts;
        if (!source || source.length === 0) return [];

        // Index Saleor attribute definitions by slug for full value lists
        const definitions = new Map<string, SaleorAttribute>();
        for (const def of attributeOptions || []) {
            if (def.slug) definitions.set(def.slug, def);
        }

        const attrGroups = new Map<string, { attributeSlug: string; label: string; values: Map<string, string> }>();

        // Seed groups + full value lists from Saleor definitions (only for attributes
        // present on the listed products, so filters stay relevant to the category).
        // Attributes with the Dashboard toggle "Filterable in storefront" OFF are skipped.
        const usedSlugs = new Set<string>();
        for (const product of source) {
            for (const attr of product.attributes || []) {
                if (isExcludedAttribute(attr)) continue;
                if (attr.attribute.slug) usedSlugs.add(attr.attribute.slug);
            }
        }
        for (const slug of usedSlugs) {
            const def = definitions.get(slug);
            if (!def) continue;
            if (def.filterableInStorefront === false) continue;
            const label = def.translation?.name || def.name;
            const values = new Map<string, string>();
            for (const choice of def.choices || []) {
                const valueSlug = choice.slug || choice.name;
                if (!valueSlug) continue;
                values.set(valueSlug, choice.translation?.name || choice.name);
            }
            attrGroups.set(slug, { attributeSlug: slug, label, values });
        }

        // Merge in values found on products (covers values missing from definitions)
        for (const product of source) {
            if (!product.attributes) continue;
            for (const attr of product.attributes) {
                if (isExcludedAttribute(attr)) continue;
                const slug = attr.attribute.slug;
                if (!slug) continue;
                // Respect the Dashboard "Filterable in storefront" toggle
                if (definitions.get(slug)?.filterableInStorefront === false) continue;

                // Attribute group name — prefer Saleor translation, fallback to original name
                const attrName = attr.attribute.translation?.name || attr.attribute.name;

                if (!attrGroups.has(slug)) {
                    attrGroups.set(slug, { attributeSlug: slug, label: attrName, values: new Map() });
                }
                const group = attrGroups.get(slug)!;
                if (group.label === attr.attribute.name && attr.attribute.translation?.name) {
                    group.label = attr.attribute.translation.name;
                }

                // Collect each value (slug -> display label). Prefer Saleor translation.
                for (const val of attr.values) {
                    const valueSlug = val.slug || val.name;
                    if (!valueSlug) continue;
                    const valueLabel = val.translation?.name || val.name;
                    if (!group.values.has(valueSlug)) {
                        group.values.set(valueSlug, valueLabel);
                    } else if (group.values.get(valueSlug) === val.name && val.translation?.name) {
                        group.values.set(valueSlug, val.translation.name);
                    }
                }
            }
        }

        return Array.from(attrGroups.values()).map(g => ({
            attributeSlug: g.attributeSlug,
            // Display-only: hide the organizational prefix ("Bag Carry" -> "Carry").
            // Slugs are untouched, so filtering keeps working.
            label: displayAttributeName({ name: g.label, slug: g.attributeSlug }),
            values: Array.from(g.values.entries()).map(([value, label]) => ({ value, label })),
        }));
    }, [scopedProducts, attributeOptions]);

    const initialExpanded: Record<string, boolean> = {
        category: true,
        availability: true,
        price: true,
    };
    groups.forEach((g, i) => {
        // Category-first mode: attribute details stay collapsed until the user
        // picks a category; otherwise expand the first two groups by default.
        initialExpanded[g.attributeSlug] = hasCategoryStep ? false : i < 2;
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

    const [priceMin, setPriceMin] = useState(() => normalizeDigits(searchParams.get('minPrice') || ''));
    const [priceMax, setPriceMax] = useState(() => normalizeDigits(searchParams.get('maxPrice') || ''));

    useEffect(() => {
        setPriceMin(normalizeDigits(searchParams.get('minPrice') || ''));
        setPriceMax(normalizeDigits(searchParams.get('maxPrice') || ''));
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
        if (priceMin) params.set('minPrice', normalizeDigits(priceMin));
        if (priceMax) params.set('maxPrice', normalizeDigits(priceMax));
        router.push(`?${params.toString()}`, { scroll: false });
        setMobileFiltersOpen(false);
    }, [localFilters, priceMin, priceMax, router, setMobileFiltersOpen]);

    const clearAll = () => {
        setLocalFilters({});
        setPriceMin('');
        setPriceMax('');
        router.push(window.location.pathname, { scroll: false });
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
                    <h2 className="text-xl font-bold">{t.filters.title}</h2>
                    <button onClick={() => setMobileFiltersOpen(false)} aria-label={t.filters.close} className="p-2 hover:bg-gray-100 rounded-full smooth-transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Category Step — first on the general products page.
                    Picking a category narrows the attribute details below. */}
                {hasCategoryStep && categoryOptions.length > 0 && (
                    <div className="border-b border-gray-100 pb-6">
                        <button onClick={() => toggleSection('category')} className="flex items-center justify-between w-full mb-4 group">
                            <span className="font-semibold text-gray-800">{t.filters.category}</span>
                            <svg className={`w-4 h-4 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {expandedSections.category !== false && (
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="filter-category"
                                        checked={!selectedCategory}
                                        onChange={() => selectCategory('')}
                                        className="w-4 h-4 border-gray-300 text-accent focus:ring-accent"
                                    />
                                    <span className="text-gray-600 group-hover:text-accent transition-colors">
                                        {t.filters.allCategories}
                                    </span>
                                </label>
                                {categoryOptions.map((cat) => (
                                    <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="filter-category"
                                            checked={selectedCategory.toLowerCase() === cat.slug.toLowerCase()}
                                            onChange={() => selectCategory(cat.slug)}
                                            className="w-4 h-4 border-gray-300 text-accent focus:ring-accent"
                                        />
                                        <span className="text-gray-600 group-hover:text-accent transition-colors flex-1">
                                            {cat.label}
                                        </span>
                                        <span className="text-xs text-gray-400">{cat.count}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Availability Filter */}
                <div className="border-b border-gray-100 pb-6">
                    <button onClick={() => toggleSection('availability')} className="flex items-center justify-between w-full mb-4 group">
                        <span className="font-semibold text-gray-800">{t.filters.availability}</span>
                        <svg className={`w-4 h-4 transition-transform ${expandedSections.availability ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {expandedSections.availability && (
                        <div className="space-y-3">
                            {[{ id: 'IN_STOCK', label: t.filters.inStock }, { id: 'OUT_OF_STOCK', label: t.filters.outOfStock }].map((item) => (
                                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isChecked('stockStatus', item.id)}
                                        onChange={(e) => updateFilter('stockStatus', item.id, e.target.checked)}
                                        className="w-4 h-4 border-gray-300 rounded text-accent focus:ring-accent"
                                    />
                                    <span className="text-gray-600 group-hover:text-accent transition-colors">
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Filter */}
                <div className="border-b border-gray-100 pb-6">
                    <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full mb-4 group">
                        <span className="font-semibold text-gray-800">{t.filters.price}</span>
                        <svg className={`w-4 h-4 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {expandedSections.price && (
                        <div className="flex items-center gap-4 mb-3">
                            <input
                                type="number"
                                inputMode="decimal"
                                dir="ltr"
                                min="0"
                                placeholder={t.filters.minPrice}
                                value={priceMin}
                                onChange={(e) => setPriceMin(normalizeDigits(e.target.value))}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyFilters(); } }}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                dir="ltr"
                                min="0"
                                placeholder={t.filters.maxPrice}
                                value={priceMax}
                                onChange={(e) => setPriceMax(normalizeDigits(e.target.value))}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyFilters(); } }}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                            />
                        </div>
                    )}
                </div>

                {/* Category-specific Attribute Filters (built from Saleor attributes) */}
                {groups.map((group) => {
                    const expanded = !!expandedSections[group.attributeSlug];
                    return (
                        <div key={group.attributeSlug} className="border-b border-gray-100 pb-6">
                            <button onClick={() => toggleSection(group.attributeSlug)} className="flex items-center justify-between w-full mb-4 group">
                                <span className="font-semibold text-gray-800">{group.label}</span>
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
                                                    {item.label}
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
                        {t.filters.clearAll}
                    </button>
                    <button
                        onClick={applyFilters}
                        className="flex-1 px-4 py-2 bg-accent text-white rounded text-sm hover:bg-[#5a1214]"
                    >
                        {t.filters.viewResults}
                    </button>
                </div>
            </aside>
        </>
    );
}

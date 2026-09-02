// Per-category filter configuration.
// Each category maps to the attribute groups that are actually used by its
// product type in Saleor. Each group references an attribute by its slug and
// lists the selectable values (display + value slug used in URL params).

export interface FilterValue {
    value: string; // slug used in the URL param (attribute:<attrSlug>:<value>)
    label: { en: string; ar: string };
}

export interface FilterGroup {
    key: string; // stable key used for state (but URL param uses the attribute slug)
    attributeSlug: string; // Saleor attribute slug
    label: { en: string; ar: string };
    values: FilterValue[];
}

export interface CategoryFilterConfig {
    groups: FilterGroup[];
}

// Builds the attribute URL param value. The backend filter matches by value slug.
export function attributeParam(attributeSlug: string, valueSlug: string): string {
    return `attribute:${attributeSlug}:${valueSlug}`;
}

const CATEGORY_FILTERS: Record<string, CategoryFilterConfig> = {
    'bags': {
        groups: [
            {
                key: 'features',
                attributeSlug: 'features',
                label: { en: 'Features', ar: 'الميزات' },
                values: [
                    { value: 'lightweight', label: { en: 'Lightweight', ar: 'خفيف الوزن' } },
                    { value: 'versatile', label: { en: 'Versatile', ar: 'متعدد الاستخدامات' } },
                    { value: 'water-resistant', label: { en: 'Water-resistant', ar: 'مقاوم للماء' } },
                    { value: 'easy-care', label: { en: 'Easy care', ar: 'سهل العناية' } },
                ],
            },
            {
                key: 'bagFeatures',
                attributeSlug: 'bag-features',
                label: { en: 'Bag Features', ar: 'مميزات الحقيبة' },
                values: [
                    { value: 'multiple-pockets', label: { en: 'Multiple pockets', ar: 'جيوب متعددة' } },
                    { value: 'adjustable-strap', label: { en: 'Adjustable strap', ar: 'حزام قابل للتعديل' } },
                    { value: 'travel-friendly', label: { en: 'Travel-friendly', ar: 'مناسب للسفر' } },
                ],
            },
            {
                key: 'bestSeller',
                attributeSlug: 'best-seller',
                label: { en: 'Best Seller', ar: 'الأكثر مبيعاً' },
                values: [
                    { value: 'yes', label: { en: 'Yes', ar: 'نعم' } },
                ],
            },
        ],
    },
    'scarves': {
        groups: [
            {
                key: 'material',
                attributeSlug: 'scarves-material',
                label: { en: 'Material', ar: 'الخامة' },
                values: [
                    { value: 'spanish-armani-satin', label: { en: 'Spanish Armani Satin', ar: 'ساتان أرمات إسباني' } },
                    { value: 'winter-felt', label: { en: 'Winter Felt', ar: 'لباد شتوي' } },
                ],
            },
            {
                key: 'size',
                attributeSlug: 'scarves-size',
                label: { en: 'Size', ar: 'الحجم' },
                values: [
                    { value: '95x95-cm', label: { en: '95x95 cm', ar: '95x95 سم' } },
                    { value: '70x70-cm', label: { en: '70x70 cm', ar: '70x70 سم' } },
                    { value: '70x200-cm', label: { en: '70x200 cm', ar: '70x200 سم' } },
                    { value: '8x120-cm', label: { en: '8x120 cm', ar: '8x120 سم' } },
                ],
            },
            {
                key: 'usage',
                attributeSlug: 'scarves-usage',
                label: { en: 'Usage', ar: 'الاستخدام' },
                values: [
                    { value: 'head', label: { en: 'Head', ar: 'الرأس' } },
                    { value: 'neck', label: { en: 'Neck', ar: 'الرقبة' } },
                    { value: 'shoulder', label: { en: 'Shoulder', ar: 'الكتف' } },
                    { value: 'hair', label: { en: 'Hair', ar: 'الشعر' } },
                    { value: 'bag', label: { en: 'Bag', ar: 'الحقيبة' } },
                    { value: 'waist', label: { en: 'Waist', ar: 'الخصر' } },
                ],
            },
            {
                key: 'season',
                attributeSlug: 'season',
                label: { en: 'Season', ar: 'الموسم' },
                values: [
                    { value: 'all-seasons', label: { en: 'All Seasons', ar: 'كل الفصول' } },
                    { value: 'summer', label: { en: 'Summer', ar: 'الصيف' } },
                    { value: 'winter', label: { en: 'Winter', ar: 'الشتاء' } },
                ],
            },
            {
                key: 'style',
                attributeSlug: 'scarves-style',
                label: { en: 'Style', ar: 'النمط' },
                values: [
                    { value: 'minimal', label: { en: 'Minimal', ar: 'بسيط' } },
                    { value: 'balanced', label: { en: 'Balanced', ar: 'متوازن' } },
                    { value: 'rich', label: { en: 'Rich', ar: 'غني' } },
                ],
            },
        ],
    },
    'ceramics': {
        groups: [
            {
                key: 'category',
                attributeSlug: 'ceramics-category',
                label: { en: 'Category', ar: 'الفئة' },
                values: [
                    { value: 'tableware', label: { en: 'Tableware', ar: 'أدوات مائدة' } },
                    { value: 'decor', label: { en: 'Decor', ar: 'ديكور' } },
                    { value: 'mirrors', label: { en: 'Mirrors', ar: 'مرايا' } },
                    { value: 'other-pieces', label: { en: 'Other Pieces', ar: 'قطع أخرى' } },
                ],
            },
            {
                key: 'material',
                attributeSlug: 'ceramics-material',
                label: { en: 'Material', ar: 'الخامة' },
                values: [
                    { value: 'ceramic', label: { en: 'Ceramic', ar: 'سيراميك' } },
                    { value: 'ceramic-wood', label: { en: 'Ceramic & Wood', ar: 'سيراميك وخشب' } },
                ],
            },
            {
                key: 'size',
                attributeSlug: 'ceramics-size',
                label: { en: 'Size', ar: 'الحجم' },
                values: [
                    { value: 'small', label: { en: 'Small', ar: 'صغير' } },
                    { value: 'medium', label: { en: 'Medium', ar: 'وسط' } },
                    { value: 'large', label: { en: 'Large', ar: 'كبير' } },
                ],
            },
            {
                key: 'handmade',
                attributeSlug: 'handmade',
                label: { en: 'Handmade', ar: 'صناعة يدوية' },
                values: [
                    { value: 'yes', label: { en: 'Yes', ar: 'نعم' } },
                    { value: 'no', label: { en: 'No', ar: 'لا' } },
                ],
            },
        ],
    },
};

export function getCategoryFilterConfig(categorySlug?: string): CategoryFilterConfig {
    if (!categorySlug) {
        // Generic / all-products page: no attribute groups, universal filters only.
        return { groups: [] };
    }
    // Normalize: match by slug prefix to be resilient (e.g. "clothing").
    const normalized = categorySlug.toLowerCase();
    const exact = CATEGORY_FILTERS[normalized];
    if (exact) return exact;

    // Fallback: find a config whose slug is contained in the category slug.
    const matched = Object.keys(CATEGORY_FILTERS).find(slug => normalized.includes(slug) || slug.includes(normalized));
    if (matched) return CATEGORY_FILTERS[matched];

    return { groups: [] };
}

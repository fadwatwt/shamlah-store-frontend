export interface CountryOption {
    code: string; // ISO 3166-1 alpha-2 — Saleor CountryCode enum value
    en: string;
    ar: string;
}

// Saleor's AddressInput.country is an enum (ISO 3166-1 alpha-2), so the UI must only
// offer valid codes. "PS" (Palestine, State of) is the store default.
export const COUNTRY_CODES: CountryOption[] = [
    { code: 'PS', en: 'Palestine', ar: 'فلسطين' },
    { code: 'JO', en: 'Jordan', ar: 'الأردن' },
    { code: 'SA', en: 'Saudi Arabia', ar: 'السعودية' },
    { code: 'AE', en: 'United Arab Emirates', ar: 'الإمارات' },
    { code: 'KW', en: 'Kuwait', ar: 'الكويت' },
    { code: 'QA', en: 'Qatar', ar: 'قطر' },
    { code: 'BH', en: 'Bahrain', ar: 'البحرين' },
    { code: 'OM', en: 'Oman', ar: 'عُمان' },
    { code: 'EG', en: 'Egypt', ar: 'مصر' },
    { code: 'LB', en: 'Lebanon', ar: 'لبنان' },
    { code: 'SY', en: 'Syria', ar: 'سوريا' },
    { code: 'IQ', en: 'Iraq', ar: 'العراق' },
    { code: 'YE', en: 'Yemen', ar: 'اليمن' },
    { code: 'LY', en: 'Libya', ar: 'ليبيا' },
    { code: 'TN', en: 'Tunisia', ar: 'تونس' },
    { code: 'DZ', en: 'Algeria', ar: 'الجزائر' },
    { code: 'MA', en: 'Morocco', ar: 'المغرب' },
    { code: 'SD', en: 'Sudan', ar: 'السودان' },
    { code: 'TR', en: 'Turkey', ar: 'تركيا' },
    { code: 'US', en: 'United States', ar: 'الولايات المتحدة' },
    { code: 'CA', en: 'Canada', ar: 'كندا' },
    { code: 'GB', en: 'United Kingdom', ar: 'بريطانيا' },
    { code: 'FR', en: 'France', ar: 'فرنسا' },
    { code: 'DE', en: 'Germany', ar: 'ألمانيا' },
    { code: 'IT', en: 'Italy', ar: 'إيطاليا' },
    { code: 'ES', en: 'Spain', ar: 'إسبانيا' },
    { code: 'NL', en: 'Netherlands', ar: 'هولندا' },
    { code: 'BE', en: 'Belgium', ar: 'بلجيكا' },
    { code: 'AT', en: 'Austria', ar: 'النمسا' },
    { code: 'CH', en: 'Switzerland', ar: 'سويسرا' },
    { code: 'SE', en: 'Sweden', ar: 'السويد' },
    { code: 'NO', en: 'Norway', ar: 'النرويج' },
    { code: 'DK', en: 'Denmark', ar: 'الدنمارك' },
    { code: 'FI', en: 'Finland', ar: 'فنلندا' },
    { code: 'IE', en: 'Ireland', ar: 'أيرلندا' },
    { code: 'PT', en: 'Portugal', ar: 'البرتغال' },
    { code: 'GR', en: 'Greece', ar: 'اليونان' },
    { code: 'CY', en: 'Cyprus', ar: 'قبرص' },
    { code: 'MT', en: 'Malta', ar: 'مالطا' },
    { code: 'PL', en: 'Poland', ar: 'بولندا' },
    { code: 'CZ', en: 'Czechia', ar: 'التشيك' },
    { code: 'HU', en: 'Hungary', ar: 'المجر' },
    { code: 'RO', en: 'Romania', ar: 'رومانيا' },
    { code: 'BG', en: 'Bulgaria', ar: 'بلغاريا' },
    { code: 'HR', en: 'Croatia', ar: 'كرواتيا' },
    { code: 'RS', en: 'Serbia', ar: 'صربيا' },
    { code: 'UA', en: 'Ukraine', ar: 'أوكرانيا' },
    { code: 'RU', en: 'Russia', ar: 'روسيا' },
    { code: 'AU', en: 'Australia', ar: 'أستراليا' },
    { code: 'IN', en: 'India', ar: 'الهند' },
    { code: 'PK', en: 'Pakistan', ar: 'باكستان' },
    { code: 'BD', en: 'Bangladesh', ar: 'بنغلاديش' },
    { code: 'MY', en: 'Malaysia', ar: 'ماليزيا' },
    { code: 'ID', en: 'Indonesia', ar: 'إندونيسيا' },
    { code: 'TH', en: 'Thailand', ar: 'تايلاند' },
    { code: 'CN', en: 'China', ar: 'الصين' },
    { code: 'JP', en: 'Japan', ar: 'اليابان' },
    { code: 'KR', en: 'South Korea', ar: 'كوريا الجنوبية' },
    { code: 'BR', en: 'Brazil', ar: 'البرازيل' },
    { code: 'MX', en: 'Mexico', ar: 'المكسيك' },
];

export const DEFAULT_COUNTRY_CODE = 'PS';

export const isCountryCode = (code: string): boolean =>
    COUNTRY_CODES.some(c => c.code === code);

export const countryName = (code: string, language: 'ar' | 'en'): string => {
    const found = COUNTRY_CODES.find(c => c.code === code);
    if (!found) return code;
    return language === 'ar' ? found.ar : found.en;
};
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

// International dial prefixes (without '+') by ISO country code.
// Used to display the prefix at the phone field and to normalize the
// entered number to E.164 before sending it to Saleor, so Saleor's
// per-country phone validation accepts it for the SELECTED country
// (not just the store default).
export const COUNTRY_DIAL: Record<string, string> = {
    PS: '970', JO: '962', SA: '966', AE: '971', KW: '965', QA: '974',
    BH: '973', OM: '968', EG: '20', LB: '961', SY: '963', IQ: '964',
    YE: '967', LY: '218', TN: '216', DZ: '213', MA: '212', SD: '249',
    MR: '222', SO: '252', DJ: '253', KM: '269', TR: '90', IR: '98',
    PK: '92', AF: '93', MY: '60', ID: '62', BD: '880', IN: '91',
    CN: '86', JP: '81', KR: '82', TH: '66', PH: '63', VN: '84',
    SG: '65', US: '1', CA: '1', GB: '44', DE: '49', FR: '33',
    IT: '39', ES: '34', PT: '351', NL: '31', BE: '32', AT: '43',
    CH: '41', SE: '46', NO: '47', DK: '45', FI: '358', IE: '353',
    PL: '48', CZ: '420', RO: '40', HU: '36', GR: '30', CY: '357',
    MT: '356', BG: '359', HR: '385', RS: '381', UA: '380', RU: '7',
    AU: '61', NZ: '64', ZA: '27', NG: '234', KE: '254', GH: '233',
    ET: '251', TZ: '255', UG: '256', RW: '250', BR: '55', AR: '54',
    MX: '52', CL: '56', CO: '57', PE: '51',
};

export const countryDial = (code: string): string => COUNTRY_DIAL[code] || '';

// Normalize a typed phone number to E.164 for the given country:
// strips non-digits, drops trunk zero(s), and prepends the country dial
// code unless it is already present. Unknown country → trimmed raw input.
export const normalizePhoneForCountry = (phone: string, countryCode: string): string => {
    const dial = countryDial(countryCode);
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return (phone || '').trim();
    if (!dial) return (phone || '').trim();
    if (digits.startsWith(dial)) return `+${digits}`;
    const noTrunk = digits.replace(/^0+/, '');
    if (noTrunk.startsWith(dial)) return `+${noTrunk}`;
    return `+${dial}${noTrunk}`;
};
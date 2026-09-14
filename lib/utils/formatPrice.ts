import { CHANNEL_CURRENCY_MAP, DEFAULT_CHANNEL } from '@/lib/saleor/channel-mapping';

function getChannelSync(): string {
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/saleor-channel=([^;]+)/);
    if (match && match[1]) return match[1];
  }
  return process.env.NEXT_PUBLIC_SALEOR_CHANNEL || DEFAULT_CHANNEL;
}

// Store standard: Western digits (0-9) in BOTH languages.
// Plain 'ar-EG' would render Arabic-Indic digits (٠١٢٣), so every Arabic
// formatting path must use this locale (Arabic language + Latin numbering).
export const AR_LATN_LOCALE = 'ar-EG-u-nu-latn';

const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

// Convert Arabic-Indic / Persian digits typed by the user to Western digits,
// so Number() parsing works regardless of the keyboard language.
export function normalizeDigits(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/[٠-٩۰-۹]/g, (d) => {
    const ar = ARABIC_INDIC_DIGITS.indexOf(d);
    if (ar >= 0) return String(ar);
    return String(PERSIAN_DIGITS.indexOf(d));
  });
}

// Parse a price URL param robustly (Arabic-Indic digits, whitespace).
// Returns null when empty/invalid so callers can skip the constraint.
export function parsePriceParam(value: string | null): number | null {
  const normalized = normalizeDigits(value).trim();
  if (!normalized) return null;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

export function getCurrencyForChannel(channel?: string): string {
  const ch = (channel || getChannelSync()) as keyof typeof CHANNEL_CURRENCY_MAP;
  return CHANNEL_CURRENCY_MAP[ch] || 'USD';
}

// Explicit symbols — Intl cannot be trusted for these: the Arabic locale has
// no narrow "$" for USD, so even `currencyDisplay: 'narrowSymbol'` renders
// the long form ("US$ 80"). Unknown codes fall back to the code itself.
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
  SAR: 'ر.س',
  AED: 'د.إ',
  QAR: 'ر.ق',
  KWD: 'د.ك',
  EGP: 'ج.م',
  JOD: 'د.ا',
  GBP: '£',
};

export function formatPrice(amount: number, currencyCode?: string, locale?: string) {
  const currency = (currencyCode || getCurrencyForChannel()).toUpperCase();
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const loc = locale || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
  // Map Arabic locale to appropriate formatting - Arabic language but Latin
  // (Western) digits per store standard, en-US for English
  // Detect Arabic by locale prefix
  const isArabic = loc.startsWith('ar');
  const formatLocale = isArabic ? AR_LATN_LOCALE : 'en-US';
  try {
    // Number only via Intl (grouping + Western digits); symbol attached
    // manually in the locale's position: "$80" in English, "80 $" in Arabic.
    const numberPart = new Intl.NumberFormat(formatLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return isArabic ? `${numberPart} ${symbol}` : `${symbol}${numberPart}`;
  } catch {
    // Fallback to simple
    return isArabic ? `${Math.round(amount)} ${symbol}` : `${symbol}${Math.round(amount)}`;
  }
}

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

export function formatPrice(amount: number, currencyCode?: string, locale?: string) {
  const currency = (currencyCode || getCurrencyForChannel()).toUpperCase();
  const loc = locale || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
  // Map Arabic locale to appropriate formatting - Arabic language but Latin
  // (Western) digits per store standard, en-US for English
  // Detect Arabic by locale prefix
  const isArabic = loc.startsWith('ar');
  const formatLocale = isArabic ? AR_LATN_LOCALE : 'en-US';
  try {
    return new Intl.NumberFormat(formatLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback to simple
    const symbol = currency === 'EUR' ? '€' : currency === 'TRY' ? '₺' : currency === 'SAR' ? 'ر.س' : '$';
    return `${symbol}${Math.round(amount)}`;
  }
}

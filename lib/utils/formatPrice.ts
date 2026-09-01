import { CHANNEL_CURRENCY_MAP, DEFAULT_CHANNEL } from '@/lib/saleor/channel-mapping';

function getChannelSync(): string {
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/saleor-channel=([^;]+)/);
    if (match && match[1]) return match[1];
  }
  return process.env.NEXT_PUBLIC_SALEOR_CHANNEL || DEFAULT_CHANNEL;
}

export function getCurrencyForChannel(channel?: string): string {
  const ch = (channel || getChannelSync()) as keyof typeof CHANNEL_CURRENCY_MAP;
  return CHANNEL_CURRENCY_MAP[ch] || 'USD';
}

export function formatPrice(amount: number, currencyCode?: string, locale?: string) {
  const currency = (currencyCode || getCurrencyForChannel()).toUpperCase();
  const loc = locale || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
  // Map Arabic locale to appropriate formatting - use ar-EG for Arabic, en-US for English
  // Detect Arabic by locale prefix
  const isArabic = loc.startsWith('ar');
  const formatLocale = isArabic ? 'ar-EG' : 'en-US';
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

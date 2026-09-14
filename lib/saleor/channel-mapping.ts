
export type ChannelSlug = 'eu-eur' | 'global-usd' | 'tr-try';

export const CHANNELS: Record<string, { slug: ChannelSlug; id: string }> = {
  eu: { slug: 'eu-eur', id: 'Q2hhbm5lbDoy' },
  global: { slug: 'global-usd', id: 'Q2hhbm5lbDoz' },
  tr: { slug: 'tr-try', id: 'Q2hhbm5lbDo0' },
};

export const EUROPE_COUNTRIES = [
  // EU-27
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
  // Rest of Europe (non-EU)
  'GB', 'CH', 'NO', 'IS', 'LI', 'MC', 'SM', 'AD', 'VA', 'RS', 'BA', 'ME', 'MK', 'AL', 'MD', 'UA', 'BY',
];

export function getChannelByCountry(countryCode: string | null): ChannelSlug {
  if (!countryCode) return CHANNELS.global.slug;

  const upCode = countryCode.toUpperCase();
  
  if (upCode === 'TR') return CHANNELS.tr.slug;
  if (EUROPE_COUNTRIES.includes(upCode)) return CHANNELS.eu.slug;
  
  return CHANNELS.global.slug;
}

export const DEFAULT_CHANNEL = CHANNELS.global.slug;

export const CHANNEL_CURRENCY_MAP: Record<ChannelSlug, string> = {
  'global-usd': 'USD',
  'eu-eur': 'EUR',
  'tr-try': 'TRY',
};

// Guards against forged/unknown cookie values — only real Saleor channels pass.
export function isKnownChannelSlug(slug: string | null | undefined): boolean {
  return !!slug && (slug in CHANNEL_CURRENCY_MAP || slug === 'default-channel');
}

// Client-safe (also edge-safe): validated channel from the `saleor-channel`
// cookie set by middleware from geo-IP. Server components must use
// getRequestChannel() from './get-request-channel' instead.
export function getCookieChannel(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/saleor-channel=([^;]+)/);
  const slug = match?.[1]?.trim();
  return slug && isKnownChannelSlug(slug) ? slug : null;
}


export type ChannelSlug = 'eu-eur' | 'global-usd' | 'tr-try';

export const CHANNELS: Record<string, { slug: ChannelSlug; id: string }> = {
  eu: { slug: 'eu-eur', id: 'Q2hhbm5lbDoy' },
  global: { slug: 'global-usd', id: 'Q2hhbm5lbDoz' },
  tr: { slug: 'tr-try', id: 'Q2hhbm5lbDo0' },
};

export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
];

export function getChannelByCountry(countryCode: string | null): ChannelSlug {
  if (!countryCode) return CHANNELS.global.slug;

  const upCode = countryCode.toUpperCase();
  
  if (upCode === 'TR') return CHANNELS.tr.slug;
  if (EU_COUNTRIES.includes(upCode)) return CHANNELS.eu.slug;
  
  return CHANNELS.global.slug;
}

export const DEFAULT_CHANNEL = CHANNELS.global.slug;

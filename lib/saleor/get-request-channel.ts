import { cookies } from 'next/headers';
import { DEFAULT_CHANNEL, isKnownChannelSlug } from './channel-mapping';

// SERVER-ONLY (uses next/headers — never import from client components).
// Resolves the visitor's channel for the current request:
// validated `saleor-channel` cookie (set by middleware from geo-IP:
// TR → tr-try, Europe → eu-eur, else global-usd)
// → NEXT_PUBLIC_SALEOR_CHANNEL → default (global-usd = USD).
export async function getRequestChannel(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const slug = cookieStore.get('saleor-channel')?.value?.trim();
    if (slug && isKnownChannelSlug(slug)) return slug;
  } catch {
    // Outside a request scope (e.g. build-time prerender) — fall through.
  }
  return process.env.NEXT_PUBLIC_SALEOR_CHANNEL || DEFAULT_CHANNEL;
}

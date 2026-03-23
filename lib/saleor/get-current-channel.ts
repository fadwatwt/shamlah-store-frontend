import { cookies } from 'next/headers';
import { DEFAULT_CHANNEL } from './channel-mapping';

/**
 * Gets the current channel from cookies.
 * Handles both Server-side (via next/headers) and Client-side (via document.cookie).
 */
export async function getCurrentChannel(): Promise<string> {
  // 1. Try server-side (only inside Request Object/Action)
  if (typeof window === 'undefined') {
    try {
      const cookieStore = await cookies();
      const serverChannel = cookieStore.get('saleor-channel')?.value;
      if (serverChannel) return serverChannel;
    } catch (e) {
      // Cookies not accessible here (e.g. during build or static generation)
      // Fallback
    }
  }

  // 2. Try client-side
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/saleor-channel=([^;]+)/);
    if (match && match[1]) return match[1];
  }

  // 3. Fallback to ENV or Default
  return process.env.NEXT_PUBLIC_SALEOR_CHANNEL || DEFAULT_CHANNEL;
}

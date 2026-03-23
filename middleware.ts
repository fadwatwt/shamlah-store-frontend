import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getChannelByCountry, DEFAULT_CHANNEL } from './lib/saleor/channel-mapping';

export function middleware(request: NextRequest) {
  const { nextUrl, cookies, headers } = request;
  
  // 1. Check if channel is already set in cookies
  const channelCookie = cookies.get('saleor-channel')?.value;
  
  if (!channelCookie) {
    // 2. Detect country from headers (standard on Vercel and similar)
    const countryCode = headers.get('x-vercel-ip-country') || null;
    
    // 3. Map country to channel slug
    const mappedChannel = getChannelByCountry(countryCode);
    
    // 4. Set the cookie if it's different from default OR just always if missing
    const response = NextResponse.next();
    response.cookies.set('saleor-channel', mappedChannel, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax'
    });
    
    return response;
  }

  return NextResponse.next();
}

// Optional: Limit middleware to specific routes if needed
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

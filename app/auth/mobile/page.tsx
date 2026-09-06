'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getExternalAuthUrl, obtainExternalAccessTokens } from '@/lib/queries/auth';

/**
 * Mobile Google sign-in bridge.
 *
 * Google rejects non-HTTPS redirect_uris (e.g. shmlh://callback) for Web
 * OAuth clients, so the mobile app cannot complete OAuth directly.
 * Instead the app opens this page in the system browser:
 *  1. No ?code — request the Google authorization URL from Saleor with THIS
 *     page (an authorized HTTPS web redirect) and forward the browser there.
 *  2. Google returns here with ?code&state — exchange them for a Saleor
 *     token, then hand it to the app via the shmlh://auth deep link.
 */
function MobileAuthContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const started = useRef(false);
  const isAr =
    typeof document !== 'undefined'
      ? document.documentElement.lang === 'ar' ||
        localStorage.getItem('language') === 'ar'
      : false;

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const err = searchParams.get('error');

    if (err) {
      setError(err);
      return;
    }

    if (code && state) {
      obtainExternalAccessTokens(code, state)
        .then((data) => {
          if (data.externalObtainAccessTokens?.errors?.length > 0) {
            setError(data.externalObtainAccessTokens.errors[0].message);
            return;
          }
          const token = data.externalObtainAccessTokens?.token;
          const refreshToken = data.externalObtainAccessTokens?.refreshToken;
          if (token) {
            window.location.href =
              `shmlh://auth?token=${encodeURIComponent(token)}` +
              (refreshToken ? `&refreshToken=${encodeURIComponent(refreshToken)}` : '');
          } else {
            setError('Failed to obtain access token');
          }
        })
        .catch((e: any) => setError(e.message || 'Login failed'));
      return;
    }

    const redirectUri = `${window.location.origin}/auth/mobile`;
    getExternalAuthUrl(redirectUri)
      .then((data) => {
        if (data.externalAuthenticationUrl?.errors?.length > 0) {
          setError(data.externalAuthenticationUrl.errors[0].message);
          return;
        }
        const raw = data.externalAuthenticationUrl?.authenticationData;
        if (!raw) {
          setError('No auth URL from backend');
          return;
        }
        const authorizationUrl = JSON.parse(raw).authorizationUrl;
        if (authorizationUrl) {
          window.location.href = authorizationUrl;
        } else {
          setError('No authorization URL');
        }
      })
      .catch((e: any) => setError(e.message || 'Login failed'));
  }, [searchParams]);

  return (
    <div className="text-center px-6">
      {error ? (
        <>
          <div className="text-red-500 mb-4 font-bold text-lg" dir="auto">{error}</div>
          <p className="text-gray-500 text-sm">
            {isAr ? 'ارجع إلى التطبيق وحاول مجددًا' : 'Go back to the app and try again'}
          </p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">
            {isAr ? 'جاري تسجيل الدخول...' : 'Logging in...'}
          </p>
        </>
      )}
    </div>
  );
}

export default function MobileAuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F4F4]">
      <Suspense fallback={<div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>}>
        <MobileAuthContent />
      </Suspense>
    </div>
  );
}

'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { handleGoogleCallback } = useAuth();
    const { language } = useLanguage();
    const [error, setError] = useState('');
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError(errorParam);
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        if (code && state) {
            handleGoogleCallback(code, state).then(result => {
                if (!result.success) {
                    setError(result.error || 'Login failed');
                    setTimeout(() => router.push('/login'), 3000);
                }
            });
        } else {
            setError('Missing required parameters');
            setTimeout(() => router.push('/login'), 3000);
        }
    }, [searchParams, handleGoogleCallback, router]);

    return (
        <div className="text-center">
            {error ? (
                <>
                    <div className="text-red-500 mb-4 font-bold text-lg">{error}</div>
                    <p className="text-gray-500 text-sm">
                        {language === 'ar' ? 'سيتم توجيهك لصفحة الدخول...' : 'Redirecting to login...'}
                    </p>
                </>
            ) : (
                <>
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-bold">
                        {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...'}
                    </p>
                </>
            )}
        </div>
    );
}

export default function CallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F4F4]">
            <Suspense fallback={<div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>}>
                <CallbackContent />
            </Suspense>
        </div>
    );
}

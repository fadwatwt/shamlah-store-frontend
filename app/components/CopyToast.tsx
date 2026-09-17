'use client';

// Small floating confirmation shown after copy-link actions.
// Green on success, red on failure. Parent auto-hides it after ~2.5s.
export default function CopyToast({ status, language }: { status: 'ok' | 'fail' | null; language: string }) {
    if (!status) return null;
    const ok = status === 'ok';
    return (
        <div
            role="status"
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-sm font-medium text-white smooth-transition ${ok ? 'bg-green-600' : 'bg-red-600'}`}
        >
            {ok ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            <span>
                {ok
                    ? (language === 'ar' ? 'تم نسخ الرابط بنجاح' : 'Link copied successfully')
                    : (language === 'ar' ? 'تعذّر نسخ الرابط' : 'Could not copy the link')}
            </span>
        </div>
    );
}

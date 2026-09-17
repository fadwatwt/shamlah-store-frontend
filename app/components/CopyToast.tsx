'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Toast rendered through a portal onto <body> with fixed positioning, so it
// never gets clipped by overflow-hidden containers or misplaced by ancestors
// that have transforms. It anchors itself just below the share button and
// re-measures on scroll/resize while visible.
export default function CopyToast({
    status,
    language,
    targetRef,
    offsetY = 8,
}: {
    status: 'ok' | 'fail' | null;
    language: string;
    targetRef?: React.RefObject<HTMLButtonElement | null>;
    offsetY?: number;
}) {
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!status || !targetRef?.current) return;

        const measure = () => {
            const el = targetRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            setPos({
                top: rect.bottom + offsetY,
                left: rect.left + rect.width / 2,
            });
        };

        measure();
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, true);
        return () => {
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure, true);
        };
    }, [status, targetRef, offsetY]);

    if (!status || typeof document === 'undefined') return null;

    const ok = status === 'ok';
    const text = ok
        ? language === 'ar'
            ? 'تم نسخ الرابط بنجاح'
            : 'Link copied successfully'
        : language === 'ar'
            ? 'تعذّر نسخ الرابط'
            : 'Could not copy the link';

    const toast = (
        <div
            role="status"
            className={`fixed z-[9999] flex items-center gap-2 px-4 py-2 rounded-md shadow-lg text-sm font-medium text-white whitespace-nowrap ${ok ? 'bg-gray-800' : 'bg-gray-700'}`}
            style={{ top: `${pos.top}px`, left: `${pos.left}px`, transform: 'translateX(-50%)' }}
        >
            {ok ? (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            <span>{text}</span>
        </div>
    );

    return createPortal(toast, document.body);
}
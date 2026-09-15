'use client';

import React from 'react';
import Image from 'next/image';

function BrandMark({ className = '', white = false }: { className?: string; white?: boolean }) {
    return (
        <span className={`relative block overflow-hidden ${className}`}>
            <Image
                src="/logo.png"
                alt="SHMLH"
                fill
                sizes="(max-width: 768px) 120px, 180px"
                className={`object-contain shmlh-breathe ${white ? 'brightness-0 invert' : ''}`}
                priority={false}
            />
        </span>
    );
}

export const LoadingSpinner = ({ size = 'md', color = 'accent' }: { size?: 'sm' | 'md' | 'lg', color?: string }) => {
    const white = color === 'white';
    const ring = white ? 'border-white/30 border-t-white' : 'border-accent/20 border-t-accent';

    // Small (buttons): clean breathing mark. Larger: mark crowned by a thin
    // rotating ring — the luxury-preloader look.
    if (size === 'sm') {
        return (
            <span className="inline-flex items-center justify-center">
                <BrandMark className="h-5 w-12" white={white} />
            </span>
        );
    }

    const box = size === 'lg' ? 'h-16 w-40' : 'h-11 w-28';
    const frame = size === 'lg' ? '-inset-3 border-2' : '-inset-2 border-2';
    return (
        <span className="relative inline-flex items-center justify-center p-3">
            <span className={`absolute ${frame} ${ring} rounded-full animate-spin`} aria-hidden="true" />
            <BrandMark className={box} white={white} />
        </span>
    );
};

export const LoadingOverlay = () => {
    return (
        <div className="fixed inset-0 bg-[#FBF8F3]/60 backdrop-blur-[2px] z-[9999] flex items-center justify-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center">
                <div className="relative">
                    {/* Soft brand glow */}
                    <div className="absolute -inset-8 bg-accent/10 blur-2xl rounded-full" aria-hidden="true" />
                    <BrandMark className="relative h-12 w-28 md:h-14 md:w-32" />
                </div>
                {/* Elegant sweeping line */}
                <div className="mt-7 h-px w-40 overflow-hidden bg-accent/15 rounded-full" aria-hidden="true">
                    <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent shmlh-sweep-bar" />
                </div>
            </div>
        </div>
    );
};

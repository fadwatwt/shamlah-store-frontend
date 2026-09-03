'use client';

import { useState } from 'react';
import Image from 'next/image';

// Tries image sources in order; if one fails to load, falls back to the next.
export default function CategoryCardImage({
    sources,
    alt,
}: {
    sources: string[];
    alt: string;
}) {
    const [index, setIndex] = useState(0);
    const validSources = sources.filter(Boolean);
    const current = validSources[Math.min(index, validSources.length - 1)];

    if (!current) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-serif text-lg px-6 text-center">{alt}</span>
            </div>
        );
    }

    const needsUnoptimized =
        current.startsWith('http://localhost:8000') ||
        current.includes('onrender.com') ||
        current.includes('placehold.co');

    return (
        <Image
            src={current}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover smooth-transition group-hover:scale-110"
            unoptimized={needsUnoptimized}
            onError={() => setIndex((i) => i + 1)}
        />
    );
}

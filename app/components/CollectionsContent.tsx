'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { Collection } from '../../lib/types/saleor';

interface CollectionsContentProps {
    collections: Collection[];
}

export default function CollectionsContent({ collections }: CollectionsContentProps) {
    const { t, dir, language } = useLanguage();

    const getCollectionName = (collection: Collection) => {
        if (language === 'ar' && collection.translation?.name) return collection.translation.name;
        return collection.name;
    };

    const getCollectionDescription = (collection: Collection) => {
        if (language === 'ar' && collection.translation?.description) return collection.translation.description;
        return collection.description;
    };

    const getPreviewImages = (collection: Collection): string[] => {
        const products = collection.products?.edges || [];
        return products
            .slice(0, 4)
            .map(e => e.node.thumbnail?.url || e.node.images?.[0]?.url || '')
            .filter(Boolean);
    };

    if (collections.length === 0) {
        return (
            <main className="pt-32 pb-24 px-6 min-h-screen md:px-24" dir={dir}>
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <div className="text-accent mb-4">
                            <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L14.4 7.2L20 8.4L16 12.6L16.8 18.4L12 16L7.2 18.4L8 12.6L4 8.4L9.6 7.2L12 2Z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-serif text-accent mb-4">{t.nav.collections}</h1>
                        <p className="text-secondary text-base">
                            {language === 'ar' ? 'لا توجد مجموعات متاحة حالياً' : 'No collections available at the moment'}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="pt-32 pb-24 px-6 min-h-screen md:px-24" dir={dir}>
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <div className="text-accent mb-4">
                        <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L14.4 7.2L20 8.4L16 12.6L16.8 18.4L12 16L7.2 18.4L8 12.6L4 8.4L9.6 7.2L12 2Z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold font-serif text-accent mb-4">{t.nav.collections}</h1>
                    <p className="text-secondary text-base">
                        {t.home.newCollectionSub}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {collections.map((collection) => {
                        const name = getCollectionName(collection);
                        const description = getCollectionDescription(collection);
                        const previewImages = getPreviewImages(collection);
                        const bgImage = collection.backgroundImage?.url;

                        return (
                            <Link
                                key={collection.id}
                                href={`/collections/${collection.slug}`}
                                className="group block"
                            >
                                <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/3]">
                                    {/* Background Image or Preview Grid */}
                                    {bgImage ? (
                                        <Image
                                            src={bgImage}
                                            alt={collection.backgroundImage?.alt || name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover group-hover:scale-105 smooth-transition"
                                            unoptimized
                                        />
                                    ) : previewImages.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-1 h-full">
                                            {previewImages.slice(0, 4).map((img, idx) => (
                                                <div key={idx} className="relative overflow-hidden">
                                                    <Image
                                                        src={img}
                                                        alt={name}
                                                        width={400}
                                                        height={300}
                                                        className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                                                        unoptimized
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-gray-200">
                                            <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Content */}
                                    <div className="absolute bottom-0 start-0 end-0 p-6 md:p-8">
                                        <h2 className="text-2xl md:text-3xl font-bold font-serif text-white mb-2 group-hover:text-accent smooth-transition">
                                            {name}
                                        </h2>
                                        {description && (
                                            <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-3">
                                                {description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-white/60 text-sm">
                                            <span>{collection.products?.edges?.length || 0}</span>
                                            <span>{language === 'ar' ? 'منتج' : 'products'}</span>
                                            <svg className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 smooth-transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}

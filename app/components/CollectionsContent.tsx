'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { Collection } from '../../lib/types/saleor';
import { editorJsToText } from '../../lib/utils/editorjs';

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
        // Descriptions are stored as EditorJS JSON — extract readable text.
        if (language === 'ar' && collection.translation?.description) return editorJsToText(collection.translation.description);
        return editorJsToText(collection.description);
    };

    // Editorial rule: a collection without a hero image is hidden from the
    // listing instead of being patched with product thumbnails.
    const editorialCollections = collections.filter((c) => Boolean(c.backgroundImage?.url));

    if (editorialCollections.length === 0) {
        return (
            <main className="pt-28 md:pt-32 pb-12 md:pb-24 px-6 min-h-screen md:px-24" dir={dir}>
                <div className="container mx-auto">
                    <div className="text-center mb-8 md:mb-16">
                        <div className="text-accent mb-4">
                            <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L14.4 7.2L20 8.4L16 12.6L16.8 18.4L12 16L7.2 18.4L8 12.6L4 8.4L9.6 7.2L12 2Z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-serif text-accent mb-4">{t.nav.collections}</h1>
                        <p className="text-gray-600 text-base">
                            {language === 'ar' ? 'لا توجد مجموعات متاحة حالياً' : 'No collections available at the moment'}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="pt-28 md:pt-32 pb-12 md:pb-24 px-6 min-h-screen md:px-24" dir={dir}>
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-10 md:mb-16">
                    <div className="text-accent mb-4">
                        <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L14.4 7.2L20 8.4L16 12.6L16.8 18.4L12 16L7.2 18.4L8 12.6L4 8.4L9.6 7.2L12 2Z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold font-serif text-accent mb-4">{t.nav.collections}</h1>
                    <p className="text-gray-600 text-base max-w-2xl mx-auto">
                        {(t.home as any).collectionsIntro || (t.home as any).newCollectionSub}
                    </p>
                </div>

                <div className="flex flex-col gap-10 md:gap-14">
                    {editorialCollections.map((collection) => {
                        const name = getCollectionName(collection);
                        const description = getCollectionDescription(collection);
                        const bgImage = collection.backgroundImage?.url as string;

                        return (
                            <article
                                key={collection.id}
                                className="group"
                            >
                                <Link
                                    href={`/collections/${collection.slug}`}
                                    className="relative block overflow-hidden rounded-lg bg-gray-100 aspect-[16/9] md:h-[420px] md:aspect-auto"
                                    aria-label={name}
                                >
                                    <Image
                                        src={bgImage}
                                        alt={collection.backgroundImage?.alt || name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 900px"
                                        className="object-cover group-hover:scale-[1.03] smooth-transition"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                </Link>

                                <div className="pt-5 md:pt-6 text-center max-w-2xl mx-auto">
                                    <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 mb-2">
                                        <Link href={`/collections/${collection.slug}`} className="hover:text-accent smooth-transition">
                                            {name}
                                        </Link>
                                    </h2>
                                    {description && (
                                        <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2 mb-5">
                                            {description}
                                        </p>
                                    )}
                                    <Link
                                        href={`/collections/${collection.slug}`}
                                        className="inline-block border-2 border-accent text-accent px-10 py-2.5 text-sm font-semibold smooth-transition hover:bg-accent hover:text-white"
                                    >
                                        {(t.home as any).exploreCollection}
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}

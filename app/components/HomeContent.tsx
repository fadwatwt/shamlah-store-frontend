'use client';

import Image from 'next/image';
import Link from 'next/link';
import CategoryCardImage from './CategoryCardImage';
import ProductCard, { ProductCardProps } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { Category, Collection } from '../../lib/types/saleor';

interface HomeContentProps {
    bestSellers: ProductCardProps[];
    categories: Category[];
    latestCollections?: Collection[];
}

export default function HomeContent({ bestSellers, categories: saleorCategories, latestCollections = [] }: HomeContentProps) {
    const { t, dir, language } = useLanguage();

    // Local fallback images verified to match their category.
    // (Only bags has one — other categories use their real product photos below.)
    const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
        bags: '/category-bags.png',
        clothing: '/category-clothes.png',
        clothes: '/category-clothes.png',
    };

    // Build category display cards dynamically from Saleor categories.
    // Image priority: Saleor backgroundImage -> real product photo from the
    // same category -> local fallback -> placeholder.
    const displayCategories = saleorCategories.map((category) => {
        const slug = category.slug?.toLowerCase();

        // Promotional text from translations (title + subtitle per category)
        const localCat = (t.home.categories as any)?.[slug === 'clothing' ? 'clothes' : slug];

        const title = localCat?.title ||
            category.translation?.name ||
            category.name ||
            category.slug;

        const subtitle = (localCat?.subtitle ||
            category.translation?.name ||
            category.name ||
            category.slug)?.toUpperCase();

        const productThumbs = (category.products?.edges || [])
            .map(e => e.node.thumbnail?.url)
            .filter(Boolean) as string[];

        const images = [
            category.backgroundImage?.url,
            ...productThumbs,
            CATEGORY_FALLBACK_IMAGES[slug],
        ].filter(Boolean) as string[];

        return {
            title,
            subtitle,
            images,
            href: `/category/${category.slug}`,
        };
    });

    return (
        <main dir={dir}>
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/4749b555d8798833f88a4ddb7463b30c2a5486eb.webp"
                        alt="Hero background"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                        fetchPriority="high"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                <div className="relative z-10 text-center h-full flex flex-col justify-center items-center text-white px-6 mt-16">
                    <p className="text-lg md:text-xl mb-4 leading-tight font-serif tracking-wide">
                        {t.home.heroTitle}
                    </p>
                    <p className="text-lg md:text-xl font-light tracking-wider">
                        {t.home.heroSubtitle}
                    </p>
                    <Link
                        href="/collections"
                        className="mt-8 inline-block border border-white/80 text-white px-8 py-2.5 text-sm tracking-widest uppercase hover:bg-white hover:text-black smooth-transition"
                    >
                        {t.home.explore}
                    </Link>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    <div className="w-[1px] h-12 bg-white/70 mb-2"></div>
                    <span className="text-white/80 text-xs tracking-widest uppercase">{t.home.scroll}</span>
                </div>
            </section>

            {/* Brand Mission Section */}
            <section className="py-24 px-6 md:px-20 bg-white text-center">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/image2.png"
                            alt="Separator Icon"
                            width={24}
                            height={24}
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-accent mb-6 leading-relaxed">
                        {t.home.missionTitle}
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl leading-loose font-light max-w-3xl mx-auto">
                        {t.home.missionText}
                    </p>
                </div>
            </section>

            {/* Best Sellers Section */}
            <section className="py-20 px-6 md:px-20 bg-white">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <div className="flex justify-center mb-4">
                            <Image
                                src="/image2.png"
                                alt="Separator"
                                width={24}
                                height={24}
                                className="object-contain opacity-80 mb-4"
                            />
                        </div>
                        <h2 className="text-4xl font-serif text-accent mb-4">
                            {t.home.newArrivals}
                        </h2>
                        <p className="text-gray-500 text-sm font-light tracking-wide">
                            {t.home.bestSellersSub}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {bestSellers.slice(0, 4).map((product: ProductCardProps) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            href="/products"
                            className="inline-block border-2 border-accent text-accent px-10 py-3 font-semibold smooth-transition hover:bg-accent hover:text-white"
                        >
                            {t.home.viewAll}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 px-6 md:px-20 bg-white">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <div className="flex justify-center mb-4">
                            <Image
                                src="/image2.png"
                                alt="Separator"
                                width={24}
                                height={24}
                                className="object-contain opacity-80 mb-4"
                            />
                        </div>
                        <h2 className="text-4xl font-serif text-accent mb-4">
                            {t.home.shopByCategory}
                        </h2>
                        <p className="text-gray-500 text-sm font-light tracking-wide">
                            {t.home.browseCollections}
                        </p>
                    </div>
                    {displayCategories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {displayCategories.map((category) => (
                                <Link
                                    key={category.href}
                                    href={category.href}
                                    className="group relative overflow-hidden rounded-lg h-[550px] block"
                                >
                                    <CategoryCardImage
                                        sources={category.images}
                                        alt={category.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                        <h3 className="text-3xl font-bold mb-2">{category.title}</h3>
                                        <p className="text-sm tracking-widest opacity-80">
                                            {category.subtitle}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            {language === 'ar' ? 'لم تضف فئات بعد' : 'No categories added yet'}
                        </div>
                    )}
                </div>
            </section>

            {/* New Collection Section */}
            <section className="py-24 px-6 md:px-20 text-center bg-white">
                <div className="container mx-auto">
                    {/* Decorative Pattern Icon */}
                    <div className="mb-6 flex justify-center">
                        <Image
                            src="/image2.png"
                            alt="Separator"
                            width={24}
                            height={24}
                            className="object-contain opacity-80 mb-4"
                        />
                    </div>

                    <div className="max-w-2xl mx-auto mb-16">
                        <h2 className="text-4xl font-serif text-accent mb-4">
                            {t.home.newCollection}
                        </h2>
                        <p className="text-gray-500 text-sm font-light tracking-wide mb-10">
                            {t.home.newCollectionSub}
                        </p>
                    </div>

                    {/* Latest Collections Grid */}
                    {latestCollections.length > 0 ? (
                        latestCollections.length === 1 ? (
                            <div className="max-w-3xl mx-auto mb-16">
                                {(() => {
                                    const collection = latestCollections[0];
                                    const image = collection.backgroundImage?.url ||
                                        collection.products?.edges?.[0]?.node?.thumbnail?.url;
                                    const colName = (language === 'ar' && collection.translation?.name)
                                        ? collection.translation.name
                                        : collection.name;
                                    return (
                                        <Link
                                            href={`/collections/${collection.slug}`}
                                            className="relative h-[500px] w-full bg-gray-100 rounded-sm overflow-hidden group block"
                                        >
                                            {image ? (
                                                <Image src={image} alt={colName} fill sizes="100vw" className="object-cover smooth-transition group-hover:scale-110" loading="lazy" unoptimized />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-secondary to-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500 font-serif text-lg">{colName}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                                                <span className="text-sm tracking-wider text-white/80 uppercase">{language === 'ar' ? 'مجموعة' : 'Collection'}</span>
                                                <h3 className="text-2xl font-serif text-white">{colName}</h3>
                                            </div>
                                        </Link>
                                    );
                                })()}
                            </div>
                        ) : latestCollections.length === 2 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto mb-16">
                                {latestCollections.map((collection) => {
                                    const image = collection.backgroundImage?.url ||
                                        collection.products?.edges?.[0]?.node?.thumbnail?.url;
                                    const colName = (language === 'ar' && collection.translation?.name)
                                        ? collection.translation.name
                                        : collection.name;
                                    return (
                                        <Link key={collection.id} href={`/collections/${collection.slug}`} className="relative h-[380px] lg:h-[500px] w-full bg-gray-100 rounded-sm overflow-hidden group block">
                                            {image ? (
                                                <Image src={image} alt={colName} fill sizes="50vw" className="object-cover smooth-transition group-hover:scale-110" loading="lazy" unoptimized />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-secondary to-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500 font-serif text-lg">{colName}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                                <span className="text-sm tracking-wider text-white/80 uppercase">{language === 'ar' ? 'مجموعة' : 'Collection'}</span>
                                                <h3 className="text-2xl font-serif text-white">{colName}</h3>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-4 max-w-5xl mx-auto mb-16 lg:h-[720px]">
                                {/* Featured: first (latest) collection spans two rows */}
                                {(() => {
                                    const collection = latestCollections[0];
                                    const image = collection.backgroundImage?.url ||
                                        collection.products?.edges?.[0]?.node?.thumbnail?.url;
                                    const colName = (language === 'ar' && collection.translation?.name)
                                        ? collection.translation.name
                                        : collection.name;
                                    return (
                                        <Link
                                            key={collection.id}
                                            href={`/collections/${collection.slug}`}
                                            className="relative h-[380px] lg:h-auto lg:row-span-2 w-full bg-gray-100 rounded-sm overflow-hidden group block"
                                        >
                                            {image ? (
                                                <Image
                                                    src={image}
                                                    alt={colName}
                                                    fill
                                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                                    className="object-cover smooth-transition group-hover:scale-110"
                                                    loading="lazy"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-secondary to-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500 font-serif text-lg">{colName}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                                <span className="text-sm tracking-wider text-white/80 uppercase">
                                                    {language === 'ar' ? 'مجموعة' : 'Collection'}
                                                </span>
                                                <h3 className="text-2xl font-serif text-white">{colName}</h3>
                                            </div>
                                        </Link>
                                    );
                                })()}
                                {latestCollections.slice(1, 3).map((collection) => {
                                    const image = collection.backgroundImage?.url ||
                                        collection.products?.edges?.[0]?.node?.thumbnail?.url;
                                    const colName = (language === 'ar' && collection.translation?.name)
                                        ? collection.translation.name
                                        : collection.name;
                                    return (
                                        <Link
                                            key={collection.id}
                                            href={`/collections/${collection.slug}`}
                                            className="relative h-[380px] lg:h-auto w-full bg-gray-100 rounded-sm overflow-hidden group block"
                                        >
                                            {image ? (
                                                <Image
                                                    src={image}
                                                    alt={colName}
                                                    fill
                                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                                    className="object-cover smooth-transition group-hover:scale-110"
                                                    loading="lazy"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-secondary to-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500 font-serif text-lg">{colName}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                                <span className="text-sm tracking-wider text-white/80 uppercase">
                                                    {language === 'ar' ? 'مجموعة' : 'Collection'}
                                                </span>
                                                <h3 className="text-2xl font-serif text-white">{colName}</h3>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto mb-16">
                            <div className="flex flex-col gap-4">
                                <div className="relative h-[300px] md:h-[400px] w-full bg-gray-100 rounded-sm overflow-hidden">
                                    <Image
                                        src="/c55a82c55d4a03a5e021e554af49768bda4fa39a.webp"
                                        alt="Collection Image 1"
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover"
                                        loading="lazy"
                                        unoptimized
                                    />
                                </div>
                                <div className="relative h-[300px] w-full bg-gray-100 rounded-sm overflow-hidden">
                                    <Image
                                        src="/b560acf3b2086c012954bece6fa33fec22882962.webp"
                                        alt="Collection Image 2"
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover"
                                        loading="lazy"
                                        unoptimized
                                    />
                                </div>
                            </div>
                            <div className="relative h-[616px] md:h-[716px] w-full bg-gray-100 rounded-sm overflow-hidden">
                                <Image
                                    src="/4749b555d8798833f88a4ddb7463b30c2a5486eb.webp"
                                    alt="Collection Image 3"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                    loading="lazy"
                                    unoptimized
                                />
                            </div>
                        </div>
                    )}
                    <Link
                        href="/collections"
                        className="inline-block border-2 border-accent text-accent px-10 py-3 font-semibold smooth-transition hover:bg-accent hover:text-white"
                    >
                        {t.home.exploreMore}
                    </Link>
                </div>
            </section>
        </main>
    );
}

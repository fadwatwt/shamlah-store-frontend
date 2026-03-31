'use client';

import Image from 'next/image';
import Link from 'next/link';
import ProductCard, { ProductCardProps } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../../lib/types/saleor';

interface HomeContentProps {
    bestSellers: ProductCardProps[];
    categories: Category[];
}

export default function HomeContent({ bestSellers, categories: saleorCategories }: HomeContentProps) {
    const { t, dir, language } = useLanguage();

    const getCategoryImage = (slug: string) => {
        const category = saleorCategories.find(c => c.slug === slug);
        return category?.backgroundImage?.url || `https://placehold.co/600x800/79272C/white?text=${slug}`;
    };

    const displayCategories = [
        {
            title: t.home.categories.bags.title,
            subtitle: t.home.categories.bags.subtitle,
            image: getCategoryImage('bags'),
            href: '/category/bags',
        },
        {
            title: t.home.categories.clothes.title,
            subtitle: t.home.categories.clothes.subtitle,
            image: getCategoryImage('clothing'), // Slugs often differ, assuming 'clothing' for clothes
            href: '/category/clothing',
        },
        {
            title: t.home.categories.accessories.title,
            subtitle: t.home.categories.accessories.subtitle,
            image: getCategoryImage('accessories'),
            href: '/category/accessories',
        },
    ];

    return (
        <main dir={dir}>
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/4749b555d8798833f88a4ddb7463b30c2a5486eb.webp"
                        alt="Hero background"
                        fill
                        className="object-cover"
                        priority
                        quality={100}
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
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    <div className="w-[1px] h-12 bg-white/70 mb-2"></div>
                    <span className="text-white/80 text-xs tracking-widest uppercase">Scroll</span>
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
                        {language === 'ar' ? 'من نسيج الأرض، إلى الإنسانية' : 'From the fabric of the land, to Humanity'}
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl leading-loose font-light max-w-3xl mx-auto">
                        {language === 'ar'
                            ? 'ننسج من عبق التاريخ حكايات تُروى. كل قطعة هي تجسيد لتراثنا الأصيل بلمسة عصرية تتناغم مع روح العصر.'
                            : 'With every thread, we weave a story from the scent of history. Every piece is an embodiment of our authentic heritage with a modern touch that harmonizes with the spirit of the times.'}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {displayCategories.map((category, index) => (
                            <Link
                                key={index}
                                href={category.href}
                                className="group relative overflow-hidden rounded-lg h-[550px] block"
                            >
                                <Image
                                    src={category.image}
                                    alt={category.title}
                                    fill
                                    className="object-cover smooth-transition group-hover:scale-110"
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

                    {/* New Collection Grid from image: wait, the image shows a large grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto mb-16">
                        <div className="flex flex-col gap-4">
                            <div className="relative h-[300px] md:h-[400px] w-full bg-gray-100 rounded-sm overflow-hidden">
                                {/* Assuming some images */}
                                <Image
                                    src="/c55a82c55d4a03a5e021e554af49768bda4fa39a.webp"
                                    alt="Collection Image 1"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="relative h-[300px] w-full bg-gray-100 rounded-sm overflow-hidden">
                                <Image
                                    src="/b560acf3b2086c012954bece6fa33fec22882962.webp"
                                    alt="Collection Image 2"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <div className="relative h-[616px] md:h-[716px] w-full bg-gray-100 rounded-sm overflow-hidden">
                            <Image
                                src="/4749b555d8798833f88a4ddb7463b30c2a5486eb.webp"
                                alt="Collection Image 3"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <Link
                        href="/collections/new"
                        className="inline-block border-2 border-accent text-accent px-10 py-3 font-semibold smooth-transition hover:bg-accent hover:text-white"
                    >
                        {t.home.exploreMore}
                    </Link>
                </div>
            </section>
        </main>
    );
}

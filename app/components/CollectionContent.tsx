'use client';

import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';
import { Collection } from '../../lib/types/saleor';
import { editorJsToText } from '../../lib/utils/editorjs';
import Image from 'next/image';

interface ProductAttribute {
    attribute: { name: string; slug?: string };
    values: Array<{ name: string }>;
}

interface Product {
    id: string;
    name: string;
    price: number;
    currency?: string;
    image: string;
    rating: number;
    isBestSeller?: boolean;
    quantityAvailable?: number;
    isPreorder?: boolean;
    attributes?: ProductAttribute[];
    variants?: any[];
}

interface CollectionContentProps {
    collection: Collection;
    initialProducts: Product[];
}

export default function CollectionContent({ collection, initialProducts }: CollectionContentProps) {
    const { dir, language } = useLanguage();

    const getName = () => {
        if (language === 'ar' && collection.translation?.name) return collection.translation.name;
        return collection.name;
    };

    const getDescription = () => {
        // Descriptions are stored as EditorJS JSON — extract readable text.
        if (language === 'ar' && collection.translation?.description) return editorJsToText(collection.translation.description);
        return editorJsToText(collection.description || '');
    };

    const name = getName();
    const description = getDescription();
    const bgImage = collection.backgroundImage?.url;

    return (
        <main className="pt-28 md:pt-32 pb-12 md:pb-24 px-6 min-h-screen" dir={dir}>
            <div className="container mx-auto">
                {/* Collection Hero — editorial story, not a category header */}
                <div className="relative rounded-lg overflow-hidden mb-10 md:mb-16">
                    {bgImage && (
                        <div className="absolute inset-0">
                            <Image
                                src={bgImage}
                                alt={collection.backgroundImage?.alt || name}
                                fill
                                sizes="100vw"
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>
                    )}
                    <div className={`relative py-16 md:py-24 px-6 md:px-12 text-center ${bgImage ? 'text-white' : 'text-accent'}`}>
                        <p className={`text-xs md:text-sm tracking-[0.25em] uppercase mb-4 ${bgImage ? 'text-white/70' : 'text-gray-500'}`}>
                            {language === 'ar' ? 'مجموعة' : 'Collection'}
                        </p>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-5">{name}</h1>
                        {description && (
                            <p className={`font-serif text-lg md:text-xl leading-relaxed max-w-2xl mx-auto ${bgImage ? 'text-white/85' : 'text-gray-600'}`}>
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <p className="text-gray-500 text-sm text-center mb-8">
                    {initialProducts.length} {language === 'ar' ? 'قطعة' : initialProducts.length === 1 ? 'piece' : 'pieces'}
                </p>

                {initialProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {initialProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 md:py-20 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">
                            {language === 'ar'
                                ? 'لا توجد منتجات متاحة في هذه المجموعة حالياً'
                                : 'No products available in this collection yet'}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

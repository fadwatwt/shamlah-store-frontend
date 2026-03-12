'use client';

import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';

interface Product {
    id: string;
    name: string | { ar: string; en: string };
    price: number;
    image: string;
    rating: number;
    isBestSeller?: boolean;
}

interface CollectionsContentProps {
    initialProducts: Product[];
}

export default function CollectionsContent({ initialProducts }: CollectionsContentProps) {
    const { t, dir, language } = useLanguage();

    const mockProducts = [
        {
            id: '1',
            name: { ar: 'حقيبة القدس الجلدية', en: 'Jerusalem Leather Bag' },
            price: 450,
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600',
            rating: 5,
            isBestSeller: true,
        },
        {
            id: '2',
            name: { ar: 'ثوب يافا الملكي', en: 'Jaffa Royal Thobe' },
            price: 850,
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
            rating: 5,
        },
        {
            id: '3',
            name: { ar: 'شال رام الله', en: 'Ramallah Shawl' },
            price: 120,
            image: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=600',
            rating: 4,
        },
        {
            id: '4',
            name: { ar: 'حقيبة يد مطرزة', en: 'Embroidered Handbag' },
            price: 320,
            image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=600',
            rating: 5,
        },
    ];

    const products = initialProducts.length > 0 ? initialProducts : mockProducts;

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((product) => {
                        // Handle bilingual names if mock data, otherwise use direct name string
                        const displayName = typeof product.name === 'object' && product.name !== null
                            ? (product.name as any)[language]
                            : product.name;

                        return (
                            <ProductCard
                                key={product.id}
                                {...product}
                                name={displayName}
                            />
                        );
                    })}
                </div>
            </div>
        </main>
    );
}

import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getCollectionBySlug } from '../../../lib/queries/collections';
import { Product } from '../../../lib/types/saleor';
import CollectionContent from '../../components/CollectionContent';

interface CollectionPageProps {
    params: Promise<{ slug: string }>;
}

function transformSaleorProduct(product: Product, index: number) {
    const price = product.pricing?.priceRange?.start?.gross?.amount ||
        product.variants?.[0]?.pricing?.price?.gross?.amount || 0;
    const image = product.images?.[0]?.url ||
        product.thumbnail?.url ||
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600';

    const quantityAvailable = product.variants?.reduce((acc, variant) => acc + (variant.quantityAvailable || 0), 0) || 0;
    const isPreorder = product.variants?.some(variant => variant.preorder?.endDate) || false;

    const isBestSellerAttr = product.attributes?.find(a =>
        a.attribute.name.toLowerCase() === 'best seller' ||
        a.attribute.name === 'الأكثر مبيعاً'
    );
    const isBestSeller = isBestSellerAttr?.values?.some(v =>
        v.name.toLowerCase() === 'yes' || v.name.toLowerCase() === 'true' || v.name === 'نعم'
    ) || false;

    return {
        id: product.id,
        name: product.translation?.name || product.name,
        price: Math.round(price),
        image,
        rating: index < 2 ? 5 : index < 7 ? 5 : 4,
        isBestSeller,
        quantityAvailable,
        isPreorder,
        attributes: product.attributes,
        variants: product.variants,
    };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { slug } = await params;

    const cookieStore = await cookies();
    const language = cookieStore.get('language')?.value || 'en';
    const languageCode = language === 'ar' ? 'AR' : 'EN';

    let collection;
    try {
        const channel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';
        collection = await getCollectionBySlug(slug, channel, languageCode as 'AR' | 'EN');
    } catch {
        return (
            <main className="pt-32 pb-24 px-6 min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="container mx-auto text-center max-w-md">
                    <h1 className="text-2xl font-bold text-accent mb-4">
                        {language === 'ar' ? 'تعذّر تحميل المجموعة' : 'Failed to load collection'}
                    </h1>
                    <p className="text-gray-500 mb-8">
                        {language === 'ar'
                            ? 'يبدو أن الخادم يستيقظ، يرجى الانتظار لحظة والمحاولة مجدداً.'
                            : 'The server is warming up. Please wait a moment and try again.'}
                    </p>
                    <a
                        href={`/collections/${slug}`}
                        className="inline-block px-8 py-3 bg-accent text-white rounded-sm hover:bg-accent/90 transition-colors font-medium"
                    >
                        {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                    </a>
                </div>
            </main>
        );
    }

    if (!collection) {
        return (
            <main className="pt-32 pb-24 px-6 min-h-screen">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold text-accent mb-4">
                        {language === 'ar' ? 'المجموعة غير موجودة' : 'Collection Not Found'}
                    </h1>
                    <p className="text-gray-600">
                        {language === 'ar' ? 'المجموعة التي تبحث عنها غير موجودة.' : 'The collection you\'re looking for doesn\'t exist.'}
                    </p>
                </div>
            </main>
        );
    }

    const rawProducts = collection.products?.edges?.map(edge => edge.node) || [];
    const products = rawProducts.map((p, i) => transformSaleorProduct(p, i));

    return (
        <Suspense fallback={null}>
            <CollectionContent collection={collection} initialProducts={products} />
        </Suspense>
    );
}

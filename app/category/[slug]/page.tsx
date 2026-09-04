import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getProductsByCategoryIds } from '@/lib/queries/products';
import { getCategoryBySlug } from '@/lib/queries/categories';
import { getAttributes } from '@/lib/queries/attributes';
import { Product, Category, SaleorAttribute } from '@/lib/types/saleor';
import CategoryContent from '../../components/CategoryContent';

interface CategoryPageProps {
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

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;

    const cookieStore = await cookies();
    const language = cookieStore.get('language')?.value || 'en';
    const languageCode = language === 'ar' ? 'AR' : 'EN';

    // Fetch category
    let category;
    try {
        category = await getCategoryBySlug(slug, languageCode as 'AR' | 'EN');
    } catch {
        return (
            <main className="pt-32 pb-24 px-6 min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="container mx-auto text-center max-w-md">
                    <h1 className="text-2xl font-bold text-accent mb-4">
                        {language === 'ar' ? 'تعذّر تحميل الفئة' : 'Failed to load category'}
                    </h1>
                    <p className="text-gray-500 mb-8">
                        {language === 'ar'
                            ? 'يبدو أن الخادم يستيقظ، يرجى الانتظار لحظة والمحاولة مجدداً.'
                            : 'The server is warming up. Please wait a moment and try again.'}
                    </p>
                    <a
                        href={`/category/${slug}`}
                        className="inline-block px-8 py-3 bg-accent text-white rounded-sm hover:bg-accent/90 transition-colors font-medium"
                    >
                        {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                    </a>
                </div>
            </main>
        );
    }

    if (!category) {
        return (
            <main className="pt-32 pb-24 px-6 min-h-screen">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold text-accent mb-4">Category Not Found</h1>
                    <p className="text-gray-600">The category you&apos;re looking for doesn&apos;t exist.</p>
                </div>
            </main>
        );
    }

    // Collect category + subcategory IDs
    const categoryIds = [category.id];
    const collectIds = (cat: Category) => {
        cat.children?.edges?.forEach((edge) => {
            categoryIds.push(edge.node.id);
            collectIds(edge.node as unknown as Category);
        });
    };
    collectIds(category);

    // Fetch ALL products once — filtering happens client-side instantly
    let products: ReturnType<typeof transformSaleorProduct>[] = [];
    let attributeOptions: SaleorAttribute[] = [];
    try {
        const channel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';
        const [allProducts, attrs] = await Promise.all([
            getProductsByCategoryIds({ categoryIds }, 100, channel, languageCode as 'AR' | 'EN'),
            getAttributes(languageCode as 'AR' | 'EN', channel),
        ]);
        const unique = Array.from(new Map((allProducts as Product[]).map(p => [p.id, p])).values());
        products = unique.map((p, i) => transformSaleorProduct(p, i));
        attributeOptions = attrs;
    } catch (error) {
        console.error('[CategoryPage] Error fetching products:', error);
    }

    const channel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';
    return (
        <Suspense fallback={null}>
            <CategoryContent category={category} initialProducts={products} channel={channel} attributeOptions={attributeOptions} />
        </Suspense>
    );
}

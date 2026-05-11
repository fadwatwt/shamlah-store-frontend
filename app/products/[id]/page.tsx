import { getProductById } from '@/lib/queries/products';
import { notFound } from "next/navigation";
import ProductDetails from '../../components/ProductDetails';
import { cookies } from 'next/headers';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: rawId } = await params;
    const id = rawId ? decodeURIComponent(rawId) : '';

    // Get language from cookies
    const cookieStore = await cookies();
    const language = cookieStore.get('language')?.value || 'en';
    const languageCode = language === 'ar' ? 'AR' : 'EN';

    let productData;
    try {
        productData = await getProductById(id, undefined, languageCode as 'AR' | 'EN');
    } catch {
        // Network/server error after retries — show friendly error instead of 404
        return (
            <main className="min-h-screen flex items-center justify-center px-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-accent mb-4">
                        {language === 'ar' ? 'تعذّر تحميل المنتج' : 'Failed to load product'}
                    </h1>
                    <p className="text-gray-500 mb-8">
                        {language === 'ar'
                            ? 'يبدو أن الخادم يستيقظ، يرجى الانتظار لحظة والمحاولة مجدداً.'
                            : 'The server is warming up. Please wait a moment and try again.'}
                    </p>
                    <a
                        href={`/products/${rawId}`}
                        className="inline-block px-8 py-3 bg-accent text-white rounded-sm hover:bg-accent/90 transition-colors font-medium"
                    >
                        {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                    </a>
                </div>
            </main>
        );
    }

    if (!productData) {
        notFound(); // Product genuinely doesn't exist
    }

    const product = productData;

    // Extract price safely: try PriceRange start, or fall back to first variant price
    const price = product.pricing?.priceRange?.start?.gross?.amount ||
        product.variants?.[0]?.pricing?.price?.gross?.amount || 0;
    const currency = product.pricing?.priceRange?.start?.gross?.currency || '$';

    // Extract images: first image or fallback
    const images = product.images?.length ? product.images.map(img => img.url) : [
        'https://placehold.co/1000x1200/D2B48C/671618?text=Product'
    ];

    // Extract sizes from variants names
    const sizes = product.variants?.map(v => v.name) || [];

    return (
        <ProductDetails
            product={product}
            price={price}
            currency={currency}
            images={images}
            sizes={sizes}
            attributes={product.attributes}
            variants={product.variants}
        />
    );
}

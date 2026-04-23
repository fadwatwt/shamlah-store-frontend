import { getProductById } from '@/lib/queries/products';
import { notFound } from "next/navigation";
import ProductDetails from '../../components/ProductDetails';
import { cookies } from 'next/headers';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: rawId } = await params;
    console.log('Rendering ProductPage for ID:', rawId);
    // Decode ID if necessary - sometimes double encoding happens
    const id = rawId ? decodeURIComponent(rawId) : '';
    console.log('Using decoded ID:', id);

    // Get language from cookies
    const cookieStore = await cookies();
    const language = cookieStore.get('language')?.value || 'en';
    const languageCode = language === 'ar' ? 'AR' : 'EN';

    const productData = await getProductById(id, undefined, languageCode as 'AR' | 'EN');
    console.log('Product Data result:', productData ? 'Found' : 'Null');

    if (!productData) {
        notFound(); // This will show the 404 page if product is not found
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

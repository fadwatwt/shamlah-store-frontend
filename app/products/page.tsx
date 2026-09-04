import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getProducts } from '@/lib/queries/products';
import { getAttributes } from '@/lib/queries/attributes';
import { Product, SaleorAttribute } from '@/lib/types/saleor';
import ProductsPageContent from '../components/ProductsPageContent';

function transformSaleorProduct(product: Product) {
    const price = product.pricing?.priceRange?.start?.gross?.amount ||
        product.variants?.[0]?.pricing?.price?.gross?.amount || 0;
    const image = product.images?.[0]?.url ||
        product.thumbnail?.url ||
        'https://placehold.co/400x500/671618/white?text=Product';

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
        image: image,
        rating: 5,
        isBestSeller,
        quantityAvailable,
        isPreorder,
        attributes: product.attributes
    };
}

export default async function ProductsPage() {
    let products = [];
    let attributeOptions: SaleorAttribute[] = [];

    const cookieStore = await cookies();
    const language = cookieStore.get('language')?.value || 'en';
    const languageCode = language === 'ar' ? 'AR' : 'EN';

    try {
        const [saleorProducts, attrs] = await Promise.all([
            getProducts(100, 'default-channel', languageCode as 'AR' | 'EN'),
            getAttributes(languageCode as 'AR' | 'EN'),
        ]);
        products = saleorProducts.map(transformSaleorProduct);
        attributeOptions = attrs;
        console.log("BEST SELLERS DETECTED IN PRODUCTS PAGE:", products.filter(p => p.isBestSeller).map(p => p.name));
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback data
        products = [
            {
                id: '1',
                name: 'Palestinian Memory Bag',
                price: 450,
                image: 'https://placehold.co/400x500/671618/white?text=Luxury+Bag',
                rating: 5,
            },
            {
                id: '2',
                name: 'Elegant Palestinian Thobe',
                price: 380,
                image: 'https://placehold.co/400x500/f5f5dc/671618?text=Traditional+Thobe',
                rating: 5,
            },
            {
                id: '3',
                name: 'Heritage Accessories Set',
                price: 220,
                image: 'https://placehold.co/400x500/DAA520/white?text=Accessories',
                rating: 5,
            },
            {
                id: '4',
                name: 'Modern Handbag',
                price: 520,
                image: 'https://placehold.co/400x500/671618/white?text=Modern+Bag',
                rating: 5,
            },
            {
                id: '5',
                name: 'Embroidered Scarf',
                price: 150,
                image: 'https://placehold.co/400x500/1A1A1A/white?text=Scarf',
                rating: 4,
            },
            {
                id: '6',
                name: 'Canvas Tote',
                price: 90,
                image: 'https://placehold.co/400x500/F5F5F5/black?text=Tote',
                rating: 4,
            },
        ];
    }

    return (
        <Suspense fallback={<div className="min-h-screen pt-32 text-center text-gray-500">Loading products...</div>}>
            <ProductsPageContent initialProducts={products} attributeOptions={attributeOptions} />
        </Suspense>
    );
}

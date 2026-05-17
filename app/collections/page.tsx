import { getProducts } from '../../lib/queries/products';
import { Product } from '../../lib/types/saleor';
import CollectionsContent from '../components/CollectionsContent';

function transformSaleorProduct(product: Product, index: number) {
    const price = product.pricing?.priceRange?.start?.gross?.amount ||
        product.variants?.[0]?.pricing?.price?.gross?.amount || 0;
    const image = product.images?.[0]?.url ||
        product.thumbnail?.url ||
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600';

    const isBestSellerAttr = product.attributes?.find(a => 
        a.attribute.name.toLowerCase() === 'best seller' || 
        a.attribute.name === 'الأكثر مبيعاً'
    );
    const isBestSeller = isBestSellerAttr?.values?.some(v => 
        v.name.toLowerCase() === 'yes' || v.name.toLowerCase() === 'true' || v.name === 'نعم'
    ) || false;

    return {
        id: product.id,
        name: product.name,
        price: Math.round(price),
        image: image,
        rating: index < 2 ? 5 : index < 7 ? 5 : 4,
        isBestSeller,
    };
}

export default async function CollectionsPage() {
    let collections: any[] = [];

    try {
        const products = await getProducts(20);
        collections = products.map((product, index) => transformSaleorProduct(product, index));
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback handled in Client Component if empty
        collections = [];
    }

    return <CollectionsContent initialProducts={collections} />;
}

import { getProducts } from '../../lib/queries/products';
import { Product } from '../../lib/types/saleor';
import ProductsPageContent from '../components/ProductsPageContent';

function transformSaleorProduct(product: Product) {
    const price = product.pricing?.priceRange?.start?.gross?.amount ||
        product.variants?.[0]?.pricing?.price?.gross?.amount || 0;
    const image = product.images?.[0]?.url ||
        product.thumbnail?.url ||
        'https://placehold.co/400x500/671618/white?text=Product';

    const quantityAvailable = product.variants?.reduce((acc, variant) => acc + (variant.quantityAvailable || 0), 0) || 0;
    const isPreorder = product.variants?.some(variant => variant.preorder?.endDate) || false;

    return {
        id: product.id,
        name: product.name,
        price: Math.round(price),
        image: image,
        rating: 5,
        isBestSeller: false,
        quantityAvailable,
        isPreorder,
        attributes: product.attributes
    };
}

export default async function ProductsPage() {
    let products = [];

    try {
        const saleorProducts = await getProducts(100);
        products = saleorProducts.map(transformSaleorProduct);
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

    return <ProductsPageContent initialProducts={products} />;
}

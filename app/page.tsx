import { getProducts } from '../lib/queries/products';
import { getCategories } from '../lib/queries/categories';
import { Product, Category } from '../lib/types/saleor';
import HomeContent from './components/HomeContent';

function transformSaleorProduct(product: Product) {
  const price = product.pricing?.priceRange?.start?.gross?.amount ||
    product.variants?.[0]?.pricing?.price?.gross?.amount || 0;
  const image = product.images?.[0]?.url ||
    product.thumbnail?.url ||
    'https://placehold.co/400x500/79272C/white?text=منتج';

  const quantityAvailable = product.variants?.reduce((acc, variant) => acc + (variant.quantityAvailable || 0), 0) || 0;
  const isPreorder = product.variants?.some(variant => variant.preorder?.endDate) || false;

  return {
    id: product.id,
    name: product.name,
    price: Math.round(price),
    image: image,
    rating: 5,
    isBestSeller: true,
    quantityAvailable,
    isPreorder,
    attributes: product.attributes,
    variants: product.variants
  };
}

export default async function Home() {
  let bestSellers = [];
  let categories: Category[] = [];

  try {
    const products = await getProducts(4);
    bestSellers = products.map(transformSaleorProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to default products if API fails
    bestSellers = [
      {
        id: '1',
        name: 'حقيبة الذاكرة الفلسطينية',
        price: 450,
        image: 'https://placehold.co/400x500/79272C/white?text=حقيبة+فاخرة',
        rating: 5,
        isBestSeller: true,
        quantityAvailable: 10,
        isPreorder: false,
      },
      {
        id: '2',
        name: 'ثوب فلسطيني راقي',
        price: 380,
        image: 'https://placehold.co/400x500/79272C/white?text=ثوب',
        rating: 5,
        isBestSeller: true,
        quantityAvailable: 10,
        isPreorder: false,
      },
      {
        id: '3',
        name: 'مجموعة اكسسوارات تراثية',
        price: 220,
        image: 'https://placehold.co/400x500/79272C/white?text=اكسسوارات',
        rating: 5,
        isBestSeller: true,
        quantityAvailable: 10,
        isPreorder: false,
      },
      {
        id: '4',
        name: 'حقيبة يد عصرية',
        price: 520,
        image: 'https://placehold.co/400x500/79272C/white?text=حقيبة',
        rating: 5,
        isBestSeller: true,
        quantityAvailable: 10,
        isPreorder: false,
      },
    ];
  }

  try {
    categories = await getCategories();
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories = [];
  }

  return <HomeContent bestSellers={bestSellers} categories={categories} />;
}

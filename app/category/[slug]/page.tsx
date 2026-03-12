import { getProductsByCategoryIds, ProductFilters } from '@/lib/queries/products';
import { getCategoryBySlug } from '@/lib/queries/categories';
import { Product, Category } from '@/lib/types/saleor';
import CategoryContent from '../../components/CategoryContent';

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function transformSaleorProduct(product: Product, index: number) {
    const price = product.pricing?.priceRange?.start?.gross?.amount ||
        product.variants?.[0]?.pricing?.price?.gross?.amount || 0;
    const image = product.images?.[0]?.url ||
        product.thumbnail?.url ||
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600';

    const quantityAvailable = product.variants?.reduce((acc, variant) => acc + (variant.quantityAvailable || 0), 0) || 0;
    const isPreorder = product.variants?.some(variant => variant.preorder?.endDate) || false;

    return {
        id: product.id,
        name: product.name,
        price: Math.round(price),
        image: image,
        rating: index < 2 ? 5 : index < 7 ? 5 : 4,
        isBestSeller: index < 2,
        quantityAvailable,
        isPreorder,
        attributes: product.attributes,
        variants: product.variants
    };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    // Fetch the category by slug
    const category = await getCategoryBySlug(slug);

    if (!category) {
        return (
            <main className="pt-32 pb-24 px-6 min-h-screen md:px-24">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold text-accent mb-4">Category Not Found</h1>
                    <p className="text-gray-600">The category you're looking for doesn't exist.</p>
                </div>
            </main>
        );
    }

    let products: ReturnType<typeof transformSaleorProduct>[] = [];

    try {
        // Create explicit array of IDs to fetch
        const categoryIds = [category.id];

        // Helper to collect IDs recursively
        const collectCategoryIds = (cat: Category) => {
            if (cat.children?.edges && cat.children.edges.length > 0) {
                cat.children.edges.forEach((edge) => {
                    categoryIds.push(edge.node.id);
                    // Cast node to Category for recursion as node shape matches
                    collectCategoryIds(edge.node as unknown as Category);
                });
            }
        };

        collectCategoryIds(category);

        // Parse Filter Params
        const filters: ProductFilters = {
            categoryIds: categoryIds,
        };

        // Price
        const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined;
        const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;
        if (minPrice !== undefined || maxPrice !== undefined) {
            filters.price = { min: minPrice, max: maxPrice };
        }

        // Stock Status
        const stockStatus = resolvedSearchParams.stockStatus;
        if (stockStatus && (stockStatus === 'IN_STOCK' || stockStatus === 'OUT_OF_STOCK')) {
            filters.stockStatus = stockStatus as 'IN_STOCK' | 'OUT_OF_STOCK';
        }

        // Attributes
        const rawAttributes = resolvedSearchParams.attributes;
        if (rawAttributes) {
            const attrArray = Array.isArray(rawAttributes) ? rawAttributes : [rawAttributes];
            const attributeMap = new Map<string, string[]>();

            attrArray.forEach(attrStr => {
                if (attrStr.startsWith('attribute:')) {
                    // Format: attribute:slug:value
                    const parts = attrStr.split(':');
                    if (parts.length >= 3) {
                        const slug = parts[1];
                        const value = parts.slice(2).join(':'); // Rejoin rest in case value has colons

                        if (!attributeMap.has(slug)) {
                            attributeMap.set(slug, []);
                        }
                        attributeMap.get(slug)?.push(value);
                    }
                }
            });

            if (attributeMap.size > 0) {
                filters.attributes = Array.from(attributeMap.entries()).map(([slug, values]) => ({
                    slug,
                    values
                }));
            }
        }

        console.log(`[CategoryPage] Fetching products with filters:`, JSON.stringify(filters, null, 2));

        const channel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';

        // Use the new optimized query to fetch products for all categories at once with filters
        const allProducts = await getProductsByCategoryIds(filters, 100, channel);

        // Deduplicate just in case (though API should handle this, product might be in multiple subcats)
        const uniqueProducts = Array.from(
            new Map((allProducts as Product[]).map(p => [p.id, p])).values()
        );

        products = uniqueProducts.map((product, index) => transformSaleorProduct(product, index));
        console.log(`[CategoryPage] Total unique products found: ${products.length} in channel ${channel}`);
    } catch (error) {
        console.error('Error fetching products:', error);
        products = [];
    }

    const channelUsed = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';
    return <CategoryContent category={category} initialProducts={products} channel={channelUsed} />;
}

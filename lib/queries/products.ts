import { ProductsResponse, ProductResponse, ChannelsResponse } from '../types/saleor';
import { request } from '../saleor-client';

export const GET_PRODUCTS = `
  query GetProducts($first: Int, $channel: String) {
    products(first: $first, channel: $channel, sortBy: { field: DATE, direction: DESC }) {
      edges {
        node {
          id
          name
          slug
          description
          pricing {
            priceRange {
              start {
                gross {
                  amount
                  currency
                }
              }
            }
          }
          thumbnail {
            url
            alt
          }
          images {
            url
            alt
          }
          variants {
            id
            name
            sku
            quantityAvailable
            preorder {
              endDate
            }
            pricing {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
          }
          isAvailable
          attributes {
            attribute {
              name
            }
            values {
              name
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = `
  query GetProductBySlug($slug: String!, $channel: String) {
    product(slug: $slug, channel: $channel) {
      id
      name
      slug
      description
      pricing {
        priceRange {
          start {
            gross {
              amount
              currency
            }
          }
        }
      }
      thumbnail {
        url
        alt
      }
      images {
        url
        alt
      }
      variants {
        id
        name
        sku
        pricing {
          price {
            gross {
              amount
              currency
            }
          }
        }
      }
    }
  }
`;



export const GET_CHANNELS = `
  query GetChannels {
    channels {
      slug
      currencyCode
    }
  }
`;

let _channelsCache: string[] | null = null;
async function getActiveChannel(providedChannel?: string): Promise<string> {
  const envChannel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL;

  if (providedChannel && providedChannel !== 'default-channel') {
    return providedChannel;
  }

  if (envChannel && envChannel !== 'default-channel') {
    return envChannel;
  }

  if (_channelsCache && _channelsCache.length > 0) {
    return _channelsCache[0];
  }

  try {
    const data = await request<ChannelsResponse>(GET_CHANNELS);
    if (data.channels && data.channels.length > 0) {
      _channelsCache = data.channels.map(c => c.slug);
      return _channelsCache[0];
    }
  } catch (err) {
    console.warn('Failed to fetch channels, falling back to default-channel', err);
  }

  return 'default-channel';
}

export async function getProducts(first: number = 100, channel: string = 'default-channel') {
  try {
    const activeChannel = await getActiveChannel(channel);
    const data = await request<ProductsResponse>(GET_PRODUCTS, { first, channel: activeChannel });
    return data.products.edges.map(edge => edge.node);
  } catch (error: unknown) {
    const err = error as any;
    // Silent fail if connection refused or database not set up
    // Fallback data will be used in pages
    const isConnectionError = err?.code === 'ECONNREFUSED';
    const isDatabaseError = err?.message?.includes('does not exist') ||
      err?.response?.errors?.[0]?.message?.includes('does not exist');

    if (!isConnectionError && !isDatabaseError && process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch products from Saleor:', err?.message || 'Unknown error');
    }
    return [];
  }
}

export async function getProductBySlug(slug: string, channel: string = 'default-channel') {
  try {
    const activeChannel = await getActiveChannel(channel);
    const data = await request<ProductResponse>(GET_PRODUCT_BY_SLUG, { slug, channel: activeChannel });
    return data.product;
  } catch (error: unknown) {
    const err = error as any;
    // Silent fail if connection refused (Saleor not running)
    if (err?.code !== 'ECONNREFUSED' && process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch product from Saleor:', err?.message || 'Unknown error');
    }
    return null;
  }
}

export const GET_PRODUCT_BY_ID = `
  query GetProductById($id: ID!, $channel: String) {
    product(id: $id, channel: $channel) {
      id
      name
      slug
      description
      pricing {
        priceRange {
          start {
            gross {
              amount
              currency
            }
          }
        }
      }
      thumbnail {
        url
        alt
      }
      images {
        url
        alt
      }
      variants {
        id
        name
        sku
        pricing {
          price {
            gross {
              amount
              currency
            }
          }
        }
        attributes {
          attribute {
            name
            slug
          }
          values {
            name
            value
          }
        }
      }
      attributes {
        attribute {
          name
          slug
        }
        values {
          name
        }
      }
    }
  }
`;

export async function getProductById(id: string, channel: string = 'default-channel') {
  try {
    console.log(`Fetching product with ID: ${id}`);
    const activeChannel = await getActiveChannel(channel);
    const data = await request<ProductResponse>(GET_PRODUCT_BY_ID, { id, channel: activeChannel });
    console.log(`Fetched product data:`, data.product ? 'Found' : 'Not Found');
    return data.product;
  } catch (error: unknown) {
    const err = error as any;
    console.error('Error fetching product by ID:', error);
    if (err?.code !== 'ECONNREFUSED' && process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch product from Saleor:', err?.message || 'Unknown error');
    }
    return null;
  }
}

export const GET_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory($first: Int, $channel: String, $categoryId: ID) {
    products(first: $first, channel: $channel, filter: { categories: [$categoryId] }) {
      edges {
        node {
          id
          name
          slug
          description
          pricing {
            priceRange {
              start {
                gross {
                  amount
                  currency
                }
              }
            }
          }
          thumbnail {
            url
            alt
          }
          images {
            url
            alt
          }
          variants {
            id
            name
            sku
            quantityAvailable
            preorder {
              endDate
            }
            pricing {
              price {
                gross {
                   amount
                   currency
                }
              }
            }
          }
          isAvailable
          attributes {
            attribute {
              name
            }
            values {
              name
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export async function getProductsByCategory(
  categoryId: string,
  first: number = 20,
  channel: string = 'default-channel'
) {
  try {
    const activeChannel = await getActiveChannel(channel);
    const data = await request<ProductsResponse>(GET_PRODUCTS_BY_CATEGORY, {
      first,
      channel: activeChannel,
      categoryId
    });
    return data.products.edges.map(edge => edge.node);
  } catch (error: unknown) {
    const err = error as any;
    const isConnectionError = err?.code === 'ECONNREFUSED';
    const isDatabaseError = err?.message?.includes('does not exist') ||
      err?.response?.errors?.[0]?.message?.includes('does not exist');

    if (!isConnectionError && !isDatabaseError && process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch products by category from Saleor:', err?.message || 'Unknown error');
    }
    return [];
  }
}

export const GET_PRODUCTS_BY_CATEGORY_IDS = `
  query GetProductsByCategoryIds($first: Int, $channel: String, $filter: ProductFilterInput) {
    products(first: $first, channel: $channel, filter: $filter) {
      edges {
        node {
          id
          name
          slug
          description
          pricing {
            priceRange {
              start {
                gross {
                  amount
                  currency
                }
              }
            }
          }
          thumbnail {
            url
            alt
          }
          images {
            url
            alt
          }
          variants {
            id
            name
            sku
            quantityAvailable
            preorder {
              endDate
            }
            pricing {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
            attributes {
              attribute {
                name
                slug
              }
              values {
                name
                value
              }
            }
          }
          isAvailable
          attributes {
            attribute {
              name
              slug
            }
            values {
              name
              slug
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export interface ProductFilters {
  categoryIds?: string[];
  price?: { min?: number; max?: number };
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK';
  attributes?: Array<{ slug: string; values: string[] }>;
}

export async function getProductsByCategoryIds(
  filters: ProductFilters | string[], // Backwards compatibility: allow string[] as categoryIds
  first: number = 100,
  channel: string = 'default-channel'
) {
  try {
    const activeChannel = await getActiveChannel(channel);

    let filterInput: any = {};

    if (Array.isArray(filters)) {
      // Handle legacy array argument
      filterInput.categories = filters;
    } else {
      // Handle new object argument
      if (filters.categoryIds) filterInput.categories = filters.categoryIds;

      if (filters.price) {
        filterInput.price = {};
        if (filters.price.min !== undefined) filterInput.price.gte = filters.price.min;
        if (filters.price.max !== undefined) filterInput.price.lte = filters.price.max;
      }

      if (filters.stockStatus) {
        filterInput.stockAvailability = filters.stockStatus;
      }

      if (filters.attributes && filters.attributes.length > 0) {
        filterInput.attributes = filters.attributes.map(attr => ({
          slug: attr.slug,
          values: attr.values
        }));
      }
    }

    const data = await request<ProductsResponse>(GET_PRODUCTS_BY_CATEGORY_IDS, {
      first,
      channel: activeChannel,
      filter: filterInput
    });
    return data.products.edges.map(edge => edge.node);
  } catch (error: unknown) {
    const err = error as any;
    const isConnectionError = err?.code === 'ECONNREFUSED';
    const isDatabaseError = err?.message?.includes('does not exist') ||
      err?.response?.errors?.[0]?.message?.includes('does not exist');

    if (!isConnectionError && !isDatabaseError && process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch products by category IDs from Saleor:', err?.message || 'Unknown error');
    }
    return [];
  }
}

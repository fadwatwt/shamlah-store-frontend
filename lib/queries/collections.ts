import { cache } from 'react';
import { CollectionsResponse, CollectionResponse } from '../types/saleor';
import { request } from '../saleor-client';

const getActiveChannel = async (providedChannel?: string): Promise<string> => {
  const envChannel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL;
  if (providedChannel && providedChannel !== 'default-channel') return providedChannel;
  if (envChannel) return envChannel;
  return 'default-channel';
};

const GET_COLLECTIONS = `
  query GetCollections($first: Int, $channel: String) {
    collections(first: $first, channel: $channel, sortBy: { field: PUBLISHED_AT, direction: DESC }) {
      edges {
        node {
          id
          name
          slug
          description
          translation(languageCode: AR) {
            name
            description
          }
          backgroundImage {
            url
            alt
          }
          products(first: 5) {
            edges {
              node {
                id
                name
                slug
                thumbnail {
                  url
                }
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
              }
            }
          }
        }
      }
    }
  }
`;

const GET_COLLECTION_BY_SLUG = `
  query GetCollectionBySlug($slug: String!, $channel: String) {
    collection(slug: $slug, channel: $channel) {
      id
      name
      slug
      description
      translation(languageCode: AR) {
        name
        description
      }
      backgroundImage {
        url
        alt
      }
      products(first: 100) {
        edges {
          node {
            id
            name
            slug
            description
            translation(languageCode: AR) {
              id
              name
              description
            }
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
                slug
              }
              values {
                name
                slug
                richText
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
  }
`;

export const getCollections = cache(async function (first: number = 20, channel: string = 'default-channel') {
  try {
    const activeChannel = await getActiveChannel(channel);
    const data = await request<CollectionsResponse>(GET_COLLECTIONS, { first, channel: activeChannel });
    return data.collections.edges.map(edge => edge.node);
  } catch (error: unknown) {
    const err = error as any;
    if (err?.code !== 'ECONNREFUSED' && process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch collections from Saleor:', err?.message || 'Unknown error');
    }
    return [];
  }
});

export const getCollectionBySlug = cache(async function (slug: string, channel: string = 'default-channel') {
  try {
    const activeChannel = await getActiveChannel(channel);
    const data = await request<CollectionResponse>(GET_COLLECTION_BY_SLUG, { slug, channel: activeChannel });
    return data.collection;
  } catch (error: unknown) {
    const err = error as any;
    if (err?.code !== 'ECONNREFUSED' && process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch collection from Saleor:', err?.message || 'Unknown error');
    }
    return null;
  }
});

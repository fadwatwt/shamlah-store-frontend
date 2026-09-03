import { cache } from 'react';
import { CategoriesResponse, CategoryResponse } from '../types/saleor';
import { request } from '../saleor-client';

const getCategoriesQuery = (languageCode: string) => `
  query GetCategories($channel: String) {
    categories(level: 0, first: 20) {
      edges {
        node {
          id
          name
          slug
          description
          backgroundImage {
            url
          }
          products(first: 3, channel: $channel) {
            edges {
              node {
                id
                name
                thumbnail {
                  url
                }
              }
            }
          }
          translation(languageCode: ${languageCode}) {
            name
            description
          }
          children(first: 20) {
            edges {
              node {
                id
                name
                slug
                translation(languageCode: ${languageCode}) {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getCategories = cache(async function (languageCode: 'AR' | 'EN' = 'EN', channel?: string) {
  try {
    console.log('Fetching categories with languageCode:', languageCode);
    const query = getCategoriesQuery(languageCode);
    const activeChannel = channel || process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';
    const data = await request<CategoriesResponse>(query, { channel: activeChannel });
    console.log('Categories fetched successfully:', data.categories.edges.length);
    return data.categories.edges.map(edge => edge.node);
  } catch (error: unknown) {
    const err = error as any;
    console.error('Error fetching categories:', err?.message || 'Unknown error');
    return [];
  }
});

const getCategoryBySlugQuery = (languageCode: string) => `
  query GetCategoryBySlug($slug: String!) {
    category(slug: $slug) {
      id
      name
      slug
      description
      translation(languageCode: ${languageCode}) {
        name
        description
      }
            children(first: 20) {
            edges {
              node {
                id
                name
                slug
                translation(languageCode: ${languageCode}) {
                  name
                }
                children(first: 20) {
                  edges {
                    node {
                      id
                      name
                      slug
                      translation(languageCode: ${languageCode}) {
                        name
                      }
                      children(first: 20) {
                        edges {
                          node {
                            id
                            name
                            slug
                            translation(languageCode: ${languageCode}) {
                              name
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
  }
`;

export async function getCategoryBySlug(slug: string, languageCode: 'AR' | 'EN' = 'EN') {
  const query = getCategoryBySlugQuery(languageCode);
  // Let network errors propagate — caller decides between notFound() vs error page
  const data = await request<CategoryResponse>(query, { slug });
  return data.category; // null = category genuinely doesn't exist
}

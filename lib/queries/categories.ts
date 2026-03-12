import { CategoriesResponse, CategoryResponse } from '../types/saleor';
import { request } from '../saleor-client';

const getCategoriesQuery = (languageCode: string) => `
  query GetCategories {
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

export async function getCategories(languageCode: 'AR' | 'EN' = 'EN') {
  try {
    console.log('Fetching categories with languageCode:', languageCode);
    const query = getCategoriesQuery(languageCode);
    const data = await request<CategoriesResponse>(query);
    console.log('Categories fetched successfully:', data.categories.edges.length);
    return data.categories.edges.map(edge => edge.node);
  } catch (error: unknown) {
    const err = error as any;
    console.error('Error fetching categories:', {
      message: err?.message,
      code: err?.code,
      response: err?.response,
    });

    // Silent fail if connection refused or database not set up
    const isConnectionError = err?.code === 'ECONNREFUSED';
    const isDatabaseError = err?.message?.includes('does not exist') ||
      err?.response?.errors?.[0]?.message?.includes('does not exist');

    if (!isConnectionError && !isDatabaseError) {
      console.warn('Failed to fetch categories from Saleor:', err?.message || 'Unknown error');
    }
    return [];
  }
}

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
  try {
    const query = getCategoryBySlugQuery(languageCode);
    const data = await request<CategoryResponse>(query, { slug });
    return data.category;
  } catch (error: unknown) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
}

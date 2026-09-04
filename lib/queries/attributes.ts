import { cache } from 'react';
import { AttributesResponse, SaleorAttribute } from '../types/saleor';
import { request } from '../saleor-client';

// Fetches ALL attribute definitions (with every predefined value + translations)
// straight from Saleor, so filters never miss values that no listed product uses.
export const GET_ATTRIBUTES = (languageCode: string) => `
  query GetAttributes($first: Int, $channel: String) {
    attributes(first: $first, channel: $channel) {
      edges {
        node {
          id
          name
          slug
          translation(languageCode: ${languageCode}) {
            name
          }
          choices(first: 100) {
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

export const getAttributes = cache(async function (
  languageCode: 'AR' | 'EN' = 'EN',
  channel: string = 'default-channel',
  first: number = 100
): Promise<SaleorAttribute[]> {
  try {
    const envChannel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL;
    const activeChannel = channel && channel !== 'default-channel' ? channel : (envChannel || channel);
    const query = GET_ATTRIBUTES(languageCode);
    const data = await request<AttributesResponse>(query, { first, channel: activeChannel });
    return (data.attributes?.edges || []).map(edge => ({
      id: edge.node.id,
      name: edge.node.name,
      slug: edge.node.slug,
      translation: edge.node.translation,
      choices: (edge.node.choices?.edges || []).map(e => e.node),
    }));
  } catch (error: unknown) {
    const err = error as any;
    if (err?.code !== 'ECONNREFUSED' && process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch attributes from Saleor:', err?.message || 'Unknown error');
    }
    return [];
  }
});

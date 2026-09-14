import { cache } from 'react';
import { AttributesResponse, SaleorAttribute } from '../types/saleor';
import { request } from '../saleor-client';

// Public-safe query: fetches attribute definitions + every predefined value.
// It intentionally omits `filterableInStorefront` / `visibleInStorefront`
// because Saleor gates those fields behind staff permissions
// (MANAGE_PRODUCTS / MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES) — requesting them
// anonymously makes the WHOLE query fail with PermissionDenied (data comes
// back null) and the filter ends up with empty value lists.
export const GET_ATTRIBUTES_PUBLIC = (languageCode: string) => `
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

// Privileged query: same as above + `filterableInStorefront`, so the Saleor
// Dashboard toggle "Filterable in storefront" keeps working. Requires a
// server-side Saleor app token (SALEOR_APP_TOKEN env var) with permission to
// read it. `visibleInStorefront` is kept here too (also permission-gated).
export const GET_ATTRIBUTES = (languageCode: string) => `
  query GetAttributes($first: Int, $channel: String) {
    attributes(first: $first, channel: $channel) {
      edges {
        node {
          id
          name
          slug
          filterableInStorefront
          visibleInStorefront
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

function mapAttributes(data: AttributesResponse): SaleorAttribute[] {
  return (data.attributes?.edges || []).map(edge => ({
    id: edge.node.id,
    name: edge.node.name,
    slug: edge.node.slug,
    filterableInStorefront: edge.node.filterableInStorefront,
    visibleInStorefront: edge.node.visibleInStorefront,
    translation: edge.node.translation,
    choices: (edge.node.choices?.edges || []).map(e => e.node),
  }));
}

export const getAttributes = cache(async function (
  languageCode: 'AR' | 'EN' = 'EN',
  channel: string = 'default-channel',
  first: number = 100
): Promise<SaleorAttribute[]> {
  try {
    const envChannel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL;
    const activeChannel = channel && channel !== 'default-channel' ? channel : (envChannel || channel);
    const variables = { first, channel: activeChannel };

    // Prefer the privileged query when a server-side app token is configured,
    // so the Dashboard "Filterable in storefront" toggle keeps being respected.
    // (SALEOR_APP_TOKEN must be a Saleor app/staff token with MANAGE_PRODUCTS
    // or MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES. Server-only env var — no NEXT_PUBLIC prefix.)
    const appToken = process.env.SALEOR_APP_TOKEN;
    if (appToken) {
      try {
        const data = await request<AttributesResponse>(
          GET_ATTRIBUTES(languageCode),
          variables,
          { Authorization: `Bearer ${appToken}` }
        );
        const attrs = mapAttributes(data);
        // Non-empty = the token worked and flags were readable.
        if (attrs.length > 0) return attrs;
        // Empty (or all-null data from a permission error) → fall through to public query.
      } catch {
        // Invalid/expired token → fall through to the public query below.
      }
    }

    // Public fallback: always loads definitions + choices (the filter values).
    // NOTE: without SALEOR_APP_TOKEN the "Filterable in storefront" toggle
    // cannot be read, so every attribute is treated as filterable except the
    // hardcoded EXCLUDED_ATTRIBUTE_SLUGS safety net in FilterSidebar.
    const data = await request<AttributesResponse>(GET_ATTRIBUTES_PUBLIC(languageCode), variables);
    return mapAttributes(data);
  } catch (error: unknown) {
    const err = error as any;
    if (err?.code !== 'ECONNREFUSED' && process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch attributes from Saleor:', err?.message || 'Unknown error');
    }
    return [];
  }
});

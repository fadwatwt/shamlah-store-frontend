import { NextRequest, NextResponse } from 'next/server';
import { request } from '@/lib/saleor-client';

// Lightweight live-search payload — only the fields the search dropdown needs.
const LIVE_SEARCH_QUERY = (languageCode: string) => `
  query LiveSearch($first: Int, $channel: String) {
    products(first: $first, channel: $channel, sortBy: { field: DATE, direction: DESC }) {
      edges {
        node {
          id
          name
          slug
          translation(languageCode: ${languageCode}) {
            name
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
          }
          category {
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
`;

interface LiveSearchNode {
  id: string;
  name: string;
  slug: string;
  translation?: { name?: string } | null;
  pricing?: { priceRange?: { start?: { gross?: { amount?: number; currency?: string } } } };
  thumbnail?: { url?: string } | null;
  category?: { name?: string; slug?: string; translation?: { name?: string } | null } | null;
}

export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const q = (params.get('q') || '').trim().toLowerCase();
  const langParam = params.get('lang') === 'ar' ? 'AR' : 'EN';

  if (!q) {
    return NextResponse.json({ products: [] });
  }

  try {
    const channel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'global-usd';
    const data = await request<{ products: { edges: Array<{ node: LiveSearchNode }> } }>(
      LIVE_SEARCH_QUERY(langParam),
      { first: 100, channel }
    );

    const needle = q;
    const matched = (data.products?.edges || [])
      .map((e) => e.node)
      .filter((p) => {
        const names = [
          p.name,
          p.translation?.name,
          p.slug.replace(/-/g, ' '),
          p.category?.name,
          p.category?.translation?.name,
          p.category?.slug?.replace(/-/g, ' '),
        ]
          .filter(Boolean)
          .map((n) => (n as string).toLowerCase());
        return names.some((n) => n.includes(needle));
      })
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.translation?.name || p.name,
        price: Math.round(p.pricing?.priceRange?.start?.gross?.amount || 0),
        currency: p.pricing?.priceRange?.start?.gross?.currency || 'USD',
        image: p.thumbnail?.url || null,
      }));

    return NextResponse.json({ products: matched });
  } catch (error) {
    console.error('[LiveSearch] failed:', error);
    return NextResponse.json({ products: [] });
  }
}

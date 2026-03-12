import { GraphQLClient } from 'graphql-request';

const getSaleorApiUrl = () => {
  return process.env.NEXT_PUBLIC_SALEOR_API_URL || 'http://localhost:8000/graphql/';
};

export const saleorClient = new GraphQLClient(getSaleorApiUrl(), {
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function request<T>(query: string, variables?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
  try {
    const data = await saleorClient.request<T>(query, variables, headers);
    return data;
  } catch (error: unknown) {
    const err = error as any;
    // Only log connection errors in development, and only once
    if (process.env.NODE_ENV === 'development' && err?.code === 'ECONNREFUSED') {
      // Silent fail - Saleor backend is not running, fallback will be used
    } else if (process.env.NODE_ENV === 'development') {
      console.error('GraphQL Error:', err?.message || err);
    }
    throw error;
  }
}

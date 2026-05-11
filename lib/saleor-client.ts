import { GraphQLClient } from 'graphql-request';

const getSaleorApiUrl = () => {
  return process.env.NEXT_PUBLIC_SALEOR_API_URL || 'https://shamlh-backend.duckdns.org/graphql/';
};

export const saleorClient = new GraphQLClient(getSaleorApiUrl(), {
  headers: { 'Content-Type': 'application/json' },
});

// 2 retries after first failure (3 total), 2s then 4s delay
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

function isRetryableError(err: any): boolean {
  // Never retry intentional cancellations:
  // - Next.js cancels in-flight SSR requests after render completes
  // - Client unmount may cancel ongoing fetches
  const msg: string = err?.message ?? '';
  if (
    err?.name === 'AbortError' ||
    msg.includes('aborted') ||
    msg.includes('The user aborted') ||
    msg.includes('signal is aborted')
  ) {
    return false;
  }

  // Don't retry GraphQL validation / auth errors — they won't change on retry
  if (err?.response?.errors) {
    const status = err?.response?.status ?? 0;
    if (status >= 500) return true; // 5xx server crash — transient
    return false;
  }

  // Retry everything else: ECONNREFUSED, network reset, DNS hiccup
  return true;
}

export async function request<T>(query: string, variables?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      // Use rawRequest so we can inspect both data and errors before deciding what to do
      const result = await saleorClient.rawRequest<T>(query, variables, headers);

      if (result.errors?.length) {
        if (result.data) {
          // Partial success — backend returned data but some fields failed (e.g. DuplicateCursor).
          // Log a warning and use whatever data we have rather than throwing.
          const messages = result.errors.map((e: any) => e.message).join(' | ');
          console.warn(`[Saleor] Partial response (some fields may be null): ${messages}`);
          return result.data;
        }
        // No data at all — treat as a real error
        throw Object.assign(new Error(result.errors[0]?.message ?? 'GraphQL error'), {
          response: { errors: result.errors, status: result.status, headers: result.headers },
        });
      }

      return result.data;
    } catch (error: unknown) {
      const err = error as any;
      lastError = error;

      if (!isRetryableError(err) || attempt === RETRY_ATTEMPTS) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`[Saleor] Request failed (attempt ${attempt}/${RETRY_ATTEMPTS}):`, err?.message || err?.code || 'unknown');
        }
        throw error;
      }

      const delay = RETRY_DELAY_MS * attempt;
      console.warn(`[Saleor] Attempt ${attempt} failed (${err?.message || err?.code || 'unknown'}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

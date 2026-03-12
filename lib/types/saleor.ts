export interface Money {
  amount: number;
  currency: string;
}

export interface Price {
  gross: Money;
  net: Money;
}

export interface PriceRange {
  start: Price;
  stop: Price;
}

export interface ProductPricing {
  priceRange: PriceRange;
  onSale?: boolean;
}

export interface Image {
  url: string;
  alt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  quantityAvailable?: number;
  preorder?: {
    endDate?: string;
  };
  pricing?: {
    price?: Price;
  };
  images?: Image[];
  attributes?: Array<{
    attribute: {
      name: string;
      slug: string;
    };
    values: Array<{
      name: string;
      value?: string;
    }>;
  }>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isAvailable?: boolean;
  pricing?: ProductPricing;
  thumbnail?: Image;
  images?: Image[];
  variants?: ProductVariant[];
  rating?: number;
  isBestSeller?: boolean;
  attributes?: Array<{
    attribute: {
      name: string;
      slug: string;
    };
    values: Array<{
      name: string;
    }>;
  }>;
}

export interface ProductsResponse {
  products: {
    edges: Array<{
      node: Product;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
  };
}

export interface ProductResponse {
  product: Product | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  backgroundImage?: Image;
  translation?: {
    name: string;
    description?: string;
  };
  children?: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        slug: string;
        translation?: {
          name: string;
        };
      };
    }>;
  };
}

export interface CategoriesResponse {
  categories: {
    edges: Array<{
      node: Category;
    }>;
  };
}

export interface CategoryResponse {
  category: Category | null;
}

export interface ChannelsResponse {
  channels: Array<{
    slug: string;
    currencyCode: string;
  }>;
}

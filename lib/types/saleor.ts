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
      translation?: {
        name?: string;
      } | null;
    };
    values: Array<{
      name: string;
      slug?: string;
      value?: string;
      translation?: {
        name?: string;
      } | null;
    }>;
  }>;
  translation?: {
    id?: string;
    name?: string;
  };
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
      translation?: {
        name?: string;
      } | null;
    };
    values: Array<{
      name: string;
      slug?: string;
      richText?: string | null;
      translation?: {
        name?: string;
      } | null;
    }>;
  }>;
  translation?: {
    id?: string;
    name?: string;
    description?: string;
  };
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
  products?: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        thumbnail?: Image;
      };
    }>;
  };
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

export interface CollectionProduct {
  id: string;
  name: string;
  slug: string;
  thumbnail?: Image;
  pricing?: ProductPricing;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  backgroundImage?: Image;
  translation?: {
    name?: string;
    description?: string;
  };
  products?: {
    edges: Array<{
      node: Product;
    }>;
    pageInfo?: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
  };
}

export interface CollectionsResponse {
  collections: {
    edges: Array<{
      node: Collection;
    }>;
  };
}

export interface CollectionResponse {
  collection: Collection | null;
}

export interface ChannelsResponse {
  channels: Array<{
    slug: string;
    currencyCode: string;
  }>;
}

export interface SaleorAttributeChoice {
  id: string;
  name: string;
  slug: string;
  translation?: {
    name?: string;
  } | null;
}

export interface SaleorAttribute {
  id: string;
  name: string;
  slug: string;
  translation?: {
    name?: string;
  } | null;
  choices?: SaleorAttributeChoice[];
}

export interface AttributesResponse {
  attributes: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        slug: string;
        translation?: {
          name?: string;
        } | null;
        choices?: {
          edges: Array<{
            node: SaleorAttributeChoice;
          }>;
        };
      };
    }>;
  };
}

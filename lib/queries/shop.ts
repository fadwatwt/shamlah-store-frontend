import { gql } from 'graphql-request';
import { request } from '../saleor-client';

export const GET_SHOP_SHIPPING_METHODS = gql`
  query GetShopShippingMethods($channel: String!) {
    shop {
      availableShippingMethods(channel: $channel) {
        id
        name
        price {
          amount
          currency
        }
      }
    }
  }
`;

export interface ShippingMethod {
  id: string;
  name: string;
  price: {
    amount: number;
    currency: string;
  };
}

export interface ShopShippingResponse {
  shop: {
    availableShippingMethods: ShippingMethod[];
  };
}

export async function getShopShippingMethods(channel: string = 'global-usd') {
  try {
    const data = await request<ShopShippingResponse>(GET_SHOP_SHIPPING_METHODS, { channel });
    return data.shop.availableShippingMethods;
  } catch (error) {
    console.error('Error fetching shop shipping methods:', error);
    return [];
  }
}

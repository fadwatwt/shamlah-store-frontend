import { gql } from 'graphql-request';
import { request } from '../saleor-client';

export const CHECKOUT_CREATE = gql`
  mutation CheckoutCreate($channel: String!, $lines: [CheckoutLineInput!]!, $email: String) {
    checkoutCreate(input: { channel: $channel, lines: $lines, email: $email }) {
      checkout {
        id
        token
        lines {
          id
          quantity
          variant {
            id
            product {
              name
              thumbnail {
                url
              }
            }
            pricing {
              price {
                gross {
                   amount
                   currency
                }
              }
            }
          }
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

// Usually for authenticated user, we might want to attach user to checkout
// but standard flow often starts with guest checkout or attaching user later.
// For now, let's support creating checkout with lines.

export const CHECKOUT_LINES_ADD = gql`
  mutation CheckoutLinesAdd($token: UUID!, $lines: [CheckoutLineInput!]!) {
    checkoutLinesAdd(token: $token, lines: $lines) {
      checkout {
        id
        token
        lines {
          id
          quantity
          variant {
             id
             product {
               name
                thumbnail {
                  url
                }
             }
             pricing {
               price {
                 gross {
                   amount
                   currency
                 }
               }
             }
          }
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

export const CHECKOUT_FETCH = gql`
  query CheckoutFetch($token: UUID!) {
    checkout(token: $token) {
       id
       token
       lines {
         id
         quantity
         variant {
            id
            product {
              name
              thumbnail {
                url
              }
            }
            pricing {
               price {
                 gross {
                   amount
                   currency
                 }
               }
             }
         }
       }
       totalPrice {
         gross {
           amount
           currency
         }
       }
    }
  }
`;

export interface CheckoutLineInput {
  quantity: number;
  variantId: string;
}


export const CHECKOUT_LINES_UPDATE = gql`
  mutation CheckoutLinesUpdate($token: UUID!, $lines: [CheckoutLineUpdateInput!]!) {
    checkoutLinesUpdate(token: $token, lines: $lines) {
      checkout {
        id
        token
        lines {
          id
          quantity
          variant {
            id
            product {
              name
              thumbnail {
                url
              }
            }
            pricing {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
          }
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

export const CHECKOUT_LINES_DELETE = gql`
  mutation CheckoutLinesDelete($token: UUID!, $linesIds: [ID!]!) {
    checkoutLinesDelete(token: $token, linesIds: $linesIds) {
      checkout {
        id
        token
        lines {
          id
          quantity
          variant {
            id
            product {
              name
              thumbnail {
                url
              }
            }
            pricing {
              price {
                gross {
                  amount
                  currency
                }
              }
            }
          }
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

export interface CheckoutLineUpdateInput {
  quantity: number;
  lineId: string; // The ID of the *line*, not the variant
}

export interface CheckoutResponse {
  checkoutCreate?: {
    checkout: any;
    errors: any[];
  };
  checkoutLinesAdd?: {
    checkout: any;
    errors: any[];
  };
  checkoutLinesUpdate?: {
    checkout: any;
    errors: any[];
  };
  checkoutLinesDelete?: {
    checkout: any;
    errors: any[];
  };
  checkout?: any;
}

export async function createCheckout(lines: CheckoutLineInput[], channel: string, email?: string) {
  return request<CheckoutResponse>(CHECKOUT_CREATE, { channel, lines, email });
}

export async function addLinesToCheckout(token: string, lines: CheckoutLineInput[]) {
  return request<CheckoutResponse>(CHECKOUT_LINES_ADD, { token, lines });
}

export async function updateCheckoutLines(token: string, lines: CheckoutLineUpdateInput[]) {
  return request<CheckoutResponse>(CHECKOUT_LINES_UPDATE, { token, lines });
}

export async function deleteCheckoutLines(token: string, linesIds: string[]) {
  return request<CheckoutResponse>(CHECKOUT_LINES_DELETE, { token, linesIds });
}

export async function getCheckout(token: string) {
  return request<CheckoutResponse>(CHECKOUT_FETCH, { token });
}

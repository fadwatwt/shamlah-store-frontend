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
       email
       lines {
         id
         quantity
         variant {
            id
            name
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
       subtotalPrice {
         gross {
           amount
           currency
         }
       }
       shippingPrice {
         gross {
           amount
           currency
         }
       }
       availableShippingMethods {
         id
         name
         price {
           amount
           currency
         }
       }
       availablePaymentGateways {
         id
         name
       }
       deliveryMethod {
         ... on ShippingMethod {
           id
           name
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

export const CHECKOUT_SHIPPING_ADDRESS_UPDATE = gql`
  mutation CheckoutShippingAddressUpdate($token: UUID!, $shippingAddress: AddressInput!) {
    checkoutShippingAddressUpdate(token: $token, shippingAddress: $shippingAddress) {
      checkout {
        id
        availableShippingMethods {
          id
          name
          price {
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

export const CHECKOUT_SHIPPING_METHOD_UPDATE = gql`
  mutation CheckoutShippingMethodUpdate($token: UUID!, $shippingMethodId: ID!) {
    checkoutShippingMethodUpdate(token: $token, shippingMethodId: $shippingMethodId) {
      checkout {
        id
        totalPrice {
          gross {
            amount
            currency
          }
        }
        shippingPrice {
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

export const PAYMENT_GATEWAY_INITIALIZE = gql`
  mutation PaymentGatewayInitialize($checkoutId: ID!, $amount: PositiveDecimal!) {
    paymentGatewayInitialize(
      id: $checkoutId
      paymentGateways: [{ id: "saleor.app.payment.stripe" }]
      amount: $amount
    ) {
      gatewayConfigs {
        id
        data
        errors {
          field
          message
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

export const TRANSACTION_INITIALIZE = gql`
  mutation TransactionInitialize($checkoutId: ID!, $amount: PositiveDecimal!, $data: JSON!) {
    transactionInitialize(
      id: $checkoutId
      amount: $amount
      paymentGateway: { id: "saleor.app.payment.stripe", data: $data }
    ) {
      transaction {
        id
      }
      data
      errors {
        field
        message
      }
    }
  }
`;

export const TRANSACTION_PROCESS = gql`
  mutation TransactionProcess($transactionId: ID!) {
    transactionProcess(id: $transactionId) {
      transaction {
        id
      }
      transactionEvent {
        type
        pspReference
      }
      errors {
        field
        message
      }
    }
  }
`;

export const CHECKOUT_BILLING_ADDRESS_UPDATE = gql`
  mutation CheckoutBillingAddressUpdate($token: UUID!, $billingAddress: AddressInput!) {
    checkoutBillingAddressUpdate(token: $token, billingAddress: $billingAddress) {
      checkout {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;

export const CHECKOUT_EMAIL_UPDATE = gql`
  mutation CheckoutEmailUpdate($token: UUID!, $email: String!) {
    checkoutEmailUpdate(token: $token, email: $email) {
      checkout {
        id
        email
      }
      errors {
        field
        message
      }
    }
  }
`;

export const CHECKOUT_COMPLETE = gql`
  mutation CheckoutComplete($checkoutId: ID!) {
    checkoutComplete(id: $checkoutId) {
      order {
        id
        number
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
export async function updateCheckoutShippingAddress(token: string, address: any) {
  return request<any>(CHECKOUT_SHIPPING_ADDRESS_UPDATE, { token, shippingAddress: address });
}

export async function updateCheckoutShippingMethod(token: string, shippingMethodId: string) {
  const variable = { token, shippingMethodId };
  return request<any>(CHECKOUT_SHIPPING_METHOD_UPDATE, variable);
}

export async function initializePaymentGateway(checkoutId: string, amount: number) {
  return request<any>(PAYMENT_GATEWAY_INITIALIZE, { checkoutId, amount });
}

export async function initializeTransaction(checkoutId: string, amount: number, data: any) {
  return request<any>(TRANSACTION_INITIALIZE, { checkoutId, amount, data });
}

export async function processTransaction(transactionId: string) {
  return request<any>(TRANSACTION_PROCESS, { transactionId });
}

export async function completeCheckout(checkoutId: string) {
  return request<any>(CHECKOUT_COMPLETE, { checkoutId });
}

export async function updateCheckoutBillingAddress(token: string, address: any) {
  return request<any>(CHECKOUT_BILLING_ADDRESS_UPDATE, { token, billingAddress: address });
}

export async function updateCheckoutEmail(token: string, email: string) {
  return request<any>(CHECKOUT_EMAIL_UPDATE, { token, email });
}

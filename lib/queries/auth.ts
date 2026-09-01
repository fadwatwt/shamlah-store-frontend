import { requestAuth } from '../saleor-client';
import { gql } from 'graphql-request';

export const ACCOUNT_REGISTER = gql`
  mutation AccountRegister($input: AccountRegisterInput!) {
    accountRegister(input: $input) {
      errors {
        field
        code
        message
      }
      user {
        email
        isActive
      }
    }
  }
`;

export const TOKEN_CREATE = gql`
  mutation TokenCreate($email: String!, $password: String!) {
    tokenCreate(email: $email, password: $password) {
      token
      refreshToken
      errors {
        field
        code
        message
      }
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const CURRENT_USER = gql`
  query CurrentUser {
    me {
      id
      email
      firstName
      lastName
      isStaff
      dateJoined
      defaultShippingAddress {
        streetAddress1
        streetAddress2
        city
        postalCode
        country {
          code
          country
        }
        phone
      }
      addresses {
        id
        streetAddress1
        streetAddress2
        city
        postalCode
        country {
          code
          country
        }
        phone
      }
    }
  }
`;

export const CURRENT_USER_ORDERS = gql`
  query CurrentUserOrders {
    me {
      orders(first: 100) {
        totalCount
      }
    }
  }
`;

export const EXTERNAL_AUTHENTICATION_URL = gql`
  mutation ExternalAuthenticationUrl($pluginId: String!, $input: JSONString!) {
    externalAuthenticationUrl(pluginId: $pluginId, input: $input) {
      authenticationData
      errors {
        field
        message
      }
    }
  }
`;

export const EXTERNAL_OBTAIN_ACCESS_TOKENS = gql`
  mutation ExternalObtainAccessTokens($pluginId: String!, $input: JSONString!) {
    externalObtainAccessTokens(pluginId: $pluginId, input: $input) {
      token
      refreshToken
      user {
        id
        email
        firstName
        lastName
      }
      errors {
        field
        message
      }
    }
  }
`;

export interface RegisterInput {
  email: string;
  password: string;
  redirectUrl: string;
  channel?: string;
  // Personal data collected on the frontend — saved via accountUpdate / addressCreate after auto-login
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
}

export const ACCOUNT_UPDATE = gql`
  mutation AccountUpdate($input: AccountInput!) {
    accountUpdate(input: $input) {
      errors { field message code }
      user { id firstName lastName }
    }
  }
`;

export const ACCOUNT_ADDRESS_CREATE = gql`
  mutation AccountAddressCreate($input: AddressInput!) {
    accountAddressCreate(input: $input) {
      errors { field message code }
      address { id streetAddress1 city country { code country } phone }
      user { id }
    }
  }
`;

export const ACCOUNT_SET_DEFAULT_ADDRESS = gql`
  mutation AccountSetDefaultAddress($id: ID!, $type: AddressTypeEnum!) {
    accountSetDefaultAddress(id: $id, type: $type) {
      errors { field message code }
      user { id }
    }
  }
`;

export interface RegisterResponse {
  accountRegister: {
    errors: Array<{
      field: string;
      code: string;
      message: string;
    }>;
    user: {
      email: string;
      isActive: boolean;
    } | null;
  };
}

export interface LoginResponse {
  tokenCreate: {
    token: string | null;
    refreshToken: string | null;
    errors: Array<{
      field: string;
      code: string;
      message: string;
    }>;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    } | null;
  };
}

export interface UserResponse {
  me: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isStaff: boolean;
    dateJoined: string;
    defaultShippingAddress?: {
      streetAddress1: string;
      streetAddress2: string;
      city: string;
      postalCode: string;
      country: {
        code: string;
        country: string;
      };
      phone: string;
    } | null;
    addresses?: Array<{
      id: string;
      streetAddress1: string;
      streetAddress2: string;
      city: string;
      postalCode: string;
      country: {
        code: string;
        country: string;
      };
      phone: string;
    }> | null;
  } | null;
}

export async function registerAccount(input: RegisterInput) {
  // Saleor AccountRegisterInput only accepts email/password/redirectUrl/channel (+firstName/lastName in new versions).
  // Build an explicit whitelist so unknown fields (phone, city, ...) never reach the mutation.
  const saleorInput: any = {
    email: input.email,
    password: input.password,
    redirectUrl: input.redirectUrl,
  };
  if (input.channel) saleorInput.channel = input.channel;
  if ((input as any).firstName) saleorInput.firstName = (input as any).firstName;
  if ((input as any).lastName) saleorInput.lastName = (input as any).lastName;
  return requestAuth<RegisterResponse>(ACCOUNT_REGISTER, { input: saleorInput });
}

export async function updateAccount(token: string, input: { firstName?: string; lastName?: string }) {
  return requestAuth<any>(ACCOUNT_UPDATE, { input }, { Authorization: `Bearer ${token}` });
}

export async function createAccountAddress(token: string, input: any) {
  return requestAuth<any>(ACCOUNT_ADDRESS_CREATE, { input }, { Authorization: `Bearer ${token}` });
}

export async function setDefaultAddress(token: string, id: string, type: 'SHIPPING' | 'BILLING') {
  return requestAuth<any>(ACCOUNT_SET_DEFAULT_ADDRESS, { id, type }, { Authorization: `Bearer ${token}` });
}

export async function loginUser(email: string, password: string) {
  return requestAuth<LoginResponse>(TOKEN_CREATE, { email, password });
}

export async function getCurrentUser(token: string) {
  return requestAuth<UserResponse>(CURRENT_USER, undefined, {
    Authorization: `Bearer ${token}`,
  });
}

export async function getCurrentUserOrdersCount(token: string) {
  const data = await requestAuth<any>(CURRENT_USER_ORDERS, undefined, {
    Authorization: `Bearer ${token}`,
  });
  return data?.me?.orders?.totalCount ?? 0;
}

export const USER_ORDERS_LIST = gql`
  query UserOrdersList {
    me {
      orders(first: 20) {
        edges {
          node {
            id
            number
            created
            status
            paymentStatus
            shippingAddress {
              streetAddress1
              streetAddress2
              city
              postalCode
              country {
                code
                country
              }
              phone
            }
            total {
              gross {
                amount
                currency
              }
            }
            subtotal {
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
              }
              totalPrice {
                gross {
                  amount
                  currency
                }
              }
              unitPrice {
                gross {
                  amount
                  currency
                }
              }
            }
          }
        }
        totalCount
      }
    }
  }
`;

export async function getUserOrders(token: string) {
  const data = await requestAuth<any>(USER_ORDERS_LIST, undefined, {
    Authorization: `Bearer ${token}`,
  });
  return data?.me?.orders?.edges?.map((e: any) => e.node) ?? [];
}

export async function getExternalAuthUrl(redirectUri: string) {
  const input = JSON.stringify({ redirectUri });
  return requestAuth<any>(EXTERNAL_AUTHENTICATION_URL, {
    pluginId: "mirumee.authentication.openidconnect",
    input,
  });
}

export async function obtainExternalAccessTokens(code: string, state: string) {
  const input = JSON.stringify({ code, state });
  return requestAuth<any>(EXTERNAL_OBTAIN_ACCESS_TOKENS, {
    pluginId: "mirumee.authentication.openidconnect",
    input,
  });
}

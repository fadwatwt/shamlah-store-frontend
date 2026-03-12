import { request } from '../saleor-client';
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
    }
  }
`;

export interface RegisterInput {
  email: string;
  password: string;
  redirectUrl: string;
  channel?: string;
}

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
  } | null;
}

export async function registerAccount(input: RegisterInput) {
  return request<RegisterResponse>(ACCOUNT_REGISTER, { input });
}

export async function loginUser(email: string, password: string) {
  return request<LoginResponse>(TOKEN_CREATE, { email, password });
}

export async function getCurrentUser(token: string) {
  return request<UserResponse>(CURRENT_USER, undefined, {
    Authorization: `Bearer ${token}`,
  });
}

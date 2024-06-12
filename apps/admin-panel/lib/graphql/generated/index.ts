// this file is autogenerated by codegen
/* eslint-disable */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Satoshis: { input: any; output: any; }
  UUID: { input: string; output: string; }
  UsdCents: { input: any; output: any; }
};

export type BtcBalance = {
  __typename?: 'BtcBalance';
  btcBalance: Scalars['Satoshis']['output'];
};

export type Checking = {
  __typename?: 'Checking';
  pending: UsdBalance;
  settled: UsdBalance;
};

export type Collateral = {
  __typename?: 'Collateral';
  btcBalance: Scalars['Satoshis']['output'];
};

export type FixedTermLoan = {
  __typename?: 'FixedTermLoan';
  balance: FixedTermLoanBalance;
  loanId: Scalars['UUID']['output'];
  userId: Scalars['UUID']['output'];
};

export type FixedTermLoanBalance = {
  __typename?: 'FixedTermLoanBalance';
  collateral: Collateral;
  interestIncurred: InterestIncome;
  outstanding: LoanOutstanding;
};

export type InterestIncome = {
  __typename?: 'InterestIncome';
  usdBalance: Scalars['UsdCents']['output'];
};

export type LoanOutstanding = {
  __typename?: 'LoanOutstanding';
  usdBalance: Scalars['UsdCents']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  userDeposit: UserDepositPayload;
  userPledgeCollateral: UserPledgeCollateralPayload;
  withdrawalSettle: WithdrawalSettlePayload;
};


export type MutationUserDepositArgs = {
  input: UserDepositInput;
};


export type MutationUserPledgeCollateralArgs = {
  input: UserPledgeCollateralInput;
};


export type MutationWithdrawalSettleArgs = {
  input: WithdrawalSettleInput;
};

/** Information about pagination in a connection */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  loan?: Maybe<FixedTermLoan>;
  loansForUser?: Maybe<Array<FixedTermLoan>>;
  user?: Maybe<User>;
  users: UserConnection;
};


export type QueryLoanArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryLoansForUserArgs = {
  userId: Scalars['UUID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
};

export type UnallocatedCollateral = {
  __typename?: 'UnallocatedCollateral';
  settled: BtcBalance;
};

export type UsdBalance = {
  __typename?: 'UsdBalance';
  usdBalance: Scalars['UsdCents']['output'];
};

export type User = {
  __typename?: 'User';
  balance: UserBalance;
  bitfinexUsername: Scalars['String']['output'];
  userId: Scalars['UUID']['output'];
};

export type UserBalance = {
  __typename?: 'UserBalance';
  checking: Checking;
  unallocatedCollateral: UnallocatedCollateral;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  /** A list of edges. */
  edges: Array<UserEdge>;
  /** A list of nodes. */
  nodes: Array<User>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type UserDepositInput = {
  amount: Scalars['UsdCents']['input'];
  reference: Scalars['String']['input'];
  userId: Scalars['UUID']['input'];
};

export type UserDepositPayload = {
  __typename?: 'UserDepositPayload';
  user: User;
};

/** An edge in a connection. */
export type UserEdge = {
  __typename?: 'UserEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: User;
};

export type UserPledgeCollateralInput = {
  amount: Scalars['Satoshis']['input'];
  reference: Scalars['String']['input'];
  userId: Scalars['UUID']['input'];
};

export type UserPledgeCollateralPayload = {
  __typename?: 'UserPledgeCollateralPayload';
  user: User;
};

export type Withdrawal = {
  __typename?: 'Withdrawal';
  amount: Scalars['UsdCents']['output'];
  userId: Scalars['UUID']['output'];
  withdrawalId: Scalars['UUID']['output'];
};

export type WithdrawalSettleInput = {
  reference: Scalars['String']['input'];
  withdrawalId: Scalars['UUID']['input'];
};

export type WithdrawalSettlePayload = {
  __typename?: 'WithdrawalSettlePayload';
  withdrawal: Withdrawal;
};

export type UserDepositMutationVariables = Exact<{
  input: UserDepositInput;
}>;


export type UserDepositMutation = { __typename?: 'Mutation', userDeposit: { __typename?: 'UserDepositPayload', user: { __typename?: 'User', bitfinexUsername: string, userId: string, balance: { __typename?: 'UserBalance', unallocatedCollateral: { __typename?: 'UnallocatedCollateral', settled: { __typename?: 'BtcBalance', btcBalance: any } }, checking: { __typename?: 'Checking', pending: { __typename?: 'UsdBalance', usdBalance: any }, settled: { __typename?: 'UsdBalance', usdBalance: any } } } } } };

export type UserPledgeCollateralMutationVariables = Exact<{
  input: UserPledgeCollateralInput;
}>;


export type UserPledgeCollateralMutation = { __typename?: 'Mutation', userPledgeCollateral: { __typename?: 'UserPledgeCollateralPayload', user: { __typename?: 'User', bitfinexUsername: string, userId: string, balance: { __typename?: 'UserBalance', checking: { __typename?: 'Checking', settled: { __typename?: 'UsdBalance', usdBalance: any }, pending: { __typename?: 'UsdBalance', usdBalance: any } }, unallocatedCollateral: { __typename?: 'UnallocatedCollateral', settled: { __typename?: 'BtcBalance', btcBalance: any } } } } } };

export type WithdrawalSettleMutationVariables = Exact<{
  input: WithdrawalSettleInput;
}>;


export type WithdrawalSettleMutation = { __typename?: 'Mutation', withdrawalSettle: { __typename?: 'WithdrawalSettlePayload', withdrawal: { __typename?: 'Withdrawal', amount: any, userId: string, withdrawalId: string } } };

export type GetLoanDetailsQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type GetLoanDetailsQuery = { __typename?: 'Query', loan?: { __typename?: 'FixedTermLoan', loanId: string, userId: string, balance: { __typename?: 'FixedTermLoanBalance', collateral: { __typename?: 'Collateral', btcBalance: any }, outstanding: { __typename?: 'LoanOutstanding', usdBalance: any }, interestIncurred: { __typename?: 'InterestIncome', usdBalance: any } } } | null };

export type GetLoansForUserQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetLoansForUserQuery = { __typename?: 'Query', loansForUser?: Array<{ __typename?: 'FixedTermLoan', loanId: string, userId: string, balance: { __typename?: 'FixedTermLoanBalance', collateral: { __typename?: 'Collateral', btcBalance: any }, outstanding: { __typename?: 'LoanOutstanding', usdBalance: any }, interestIncurred: { __typename?: 'InterestIncome', usdBalance: any } } }> | null };

export type GetUserByUserIdQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type GetUserByUserIdQuery = { __typename?: 'Query', user?: { __typename?: 'User', userId: string, bitfinexUsername: string, balance: { __typename?: 'UserBalance', unallocatedCollateral: { __typename?: 'UnallocatedCollateral', settled: { __typename?: 'BtcBalance', btcBalance: any } }, checking: { __typename?: 'Checking', settled: { __typename?: 'UsdBalance', usdBalance: any }, pending: { __typename?: 'UsdBalance', usdBalance: any } } } } | null };

export type UsersQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type UsersQuery = { __typename?: 'Query', users: { __typename?: 'UserConnection', nodes: Array<{ __typename?: 'User', userId: string, bitfinexUsername: string, balance: { __typename?: 'UserBalance', unallocatedCollateral: { __typename?: 'UnallocatedCollateral', settled: { __typename?: 'BtcBalance', btcBalance: any } }, checking: { __typename?: 'Checking', settled: { __typename?: 'UsdBalance', usdBalance: any }, pending: { __typename?: 'UsdBalance', usdBalance: any } } } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, startCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean } } };


export const UserDepositDocument = gql`
    mutation UserDeposit($input: UserDepositInput!) {
  userDeposit(input: $input) {
    user {
      balance {
        unallocatedCollateral {
          settled {
            btcBalance
          }
        }
        checking {
          pending {
            usdBalance
          }
          settled {
            usdBalance
          }
        }
      }
      bitfinexUsername
      userId
    }
  }
}
    `;
export type UserDepositMutationFn = Apollo.MutationFunction<UserDepositMutation, UserDepositMutationVariables>;

/**
 * __useUserDepositMutation__
 *
 * To run a mutation, you first call `useUserDepositMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUserDepositMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [userDepositMutation, { data, loading, error }] = useUserDepositMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserDepositMutation(baseOptions?: Apollo.MutationHookOptions<UserDepositMutation, UserDepositMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UserDepositMutation, UserDepositMutationVariables>(UserDepositDocument, options);
      }
export type UserDepositMutationHookResult = ReturnType<typeof useUserDepositMutation>;
export type UserDepositMutationResult = Apollo.MutationResult<UserDepositMutation>;
export type UserDepositMutationOptions = Apollo.BaseMutationOptions<UserDepositMutation, UserDepositMutationVariables>;
export const UserPledgeCollateralDocument = gql`
    mutation UserPledgeCollateral($input: UserPledgeCollateralInput!) {
  userPledgeCollateral(input: $input) {
    user {
      balance {
        checking {
          settled {
            usdBalance
          }
          pending {
            usdBalance
          }
        }
        unallocatedCollateral {
          settled {
            btcBalance
          }
        }
      }
      bitfinexUsername
      userId
    }
  }
}
    `;
export type UserPledgeCollateralMutationFn = Apollo.MutationFunction<UserPledgeCollateralMutation, UserPledgeCollateralMutationVariables>;

/**
 * __useUserPledgeCollateralMutation__
 *
 * To run a mutation, you first call `useUserPledgeCollateralMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUserPledgeCollateralMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [userPledgeCollateralMutation, { data, loading, error }] = useUserPledgeCollateralMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUserPledgeCollateralMutation(baseOptions?: Apollo.MutationHookOptions<UserPledgeCollateralMutation, UserPledgeCollateralMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UserPledgeCollateralMutation, UserPledgeCollateralMutationVariables>(UserPledgeCollateralDocument, options);
      }
export type UserPledgeCollateralMutationHookResult = ReturnType<typeof useUserPledgeCollateralMutation>;
export type UserPledgeCollateralMutationResult = Apollo.MutationResult<UserPledgeCollateralMutation>;
export type UserPledgeCollateralMutationOptions = Apollo.BaseMutationOptions<UserPledgeCollateralMutation, UserPledgeCollateralMutationVariables>;
export const WithdrawalSettleDocument = gql`
    mutation WithdrawalSettle($input: WithdrawalSettleInput!) {
  withdrawalSettle(input: $input) {
    withdrawal {
      amount
      userId
      withdrawalId
    }
  }
}
    `;
export type WithdrawalSettleMutationFn = Apollo.MutationFunction<WithdrawalSettleMutation, WithdrawalSettleMutationVariables>;

/**
 * __useWithdrawalSettleMutation__
 *
 * To run a mutation, you first call `useWithdrawalSettleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useWithdrawalSettleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [withdrawalSettleMutation, { data, loading, error }] = useWithdrawalSettleMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useWithdrawalSettleMutation(baseOptions?: Apollo.MutationHookOptions<WithdrawalSettleMutation, WithdrawalSettleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<WithdrawalSettleMutation, WithdrawalSettleMutationVariables>(WithdrawalSettleDocument, options);
      }
export type WithdrawalSettleMutationHookResult = ReturnType<typeof useWithdrawalSettleMutation>;
export type WithdrawalSettleMutationResult = Apollo.MutationResult<WithdrawalSettleMutation>;
export type WithdrawalSettleMutationOptions = Apollo.BaseMutationOptions<WithdrawalSettleMutation, WithdrawalSettleMutationVariables>;
export const GetLoanDetailsDocument = gql`
    query GetLoanDetails($id: UUID!) {
  loan(id: $id) {
    loanId
    userId
    balance {
      collateral {
        btcBalance
      }
      outstanding {
        usdBalance
      }
      interestIncurred {
        usdBalance
      }
    }
  }
}
    `;

/**
 * __useGetLoanDetailsQuery__
 *
 * To run a query within a React component, call `useGetLoanDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLoanDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoanDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLoanDetailsQuery(baseOptions: Apollo.QueryHookOptions<GetLoanDetailsQuery, GetLoanDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLoanDetailsQuery, GetLoanDetailsQueryVariables>(GetLoanDetailsDocument, options);
      }
export function useGetLoanDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLoanDetailsQuery, GetLoanDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLoanDetailsQuery, GetLoanDetailsQueryVariables>(GetLoanDetailsDocument, options);
        }
export type GetLoanDetailsQueryHookResult = ReturnType<typeof useGetLoanDetailsQuery>;
export type GetLoanDetailsLazyQueryHookResult = ReturnType<typeof useGetLoanDetailsLazyQuery>;
export type GetLoanDetailsQueryResult = Apollo.QueryResult<GetLoanDetailsQuery, GetLoanDetailsQueryVariables>;
export const GetLoansForUserDocument = gql`
    query GetLoansForUser($userId: UUID!) {
  loansForUser(userId: $userId) {
    loanId
    userId
    balance {
      collateral {
        btcBalance
      }
      outstanding {
        usdBalance
      }
      interestIncurred {
        usdBalance
      }
    }
  }
}
    `;

/**
 * __useGetLoansForUserQuery__
 *
 * To run a query within a React component, call `useGetLoansForUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLoansForUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoansForUserQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetLoansForUserQuery(baseOptions: Apollo.QueryHookOptions<GetLoansForUserQuery, GetLoansForUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLoansForUserQuery, GetLoansForUserQueryVariables>(GetLoansForUserDocument, options);
      }
export function useGetLoansForUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLoansForUserQuery, GetLoansForUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLoansForUserQuery, GetLoansForUserQueryVariables>(GetLoansForUserDocument, options);
        }
export type GetLoansForUserQueryHookResult = ReturnType<typeof useGetLoansForUserQuery>;
export type GetLoansForUserLazyQueryHookResult = ReturnType<typeof useGetLoansForUserLazyQuery>;
export type GetLoansForUserQueryResult = Apollo.QueryResult<GetLoansForUserQuery, GetLoansForUserQueryVariables>;
export const GetUserByUserIdDocument = gql`
    query getUserByUserId($id: UUID!) {
  user(id: $id) {
    userId
    bitfinexUsername
    balance {
      unallocatedCollateral {
        settled {
          btcBalance
        }
      }
      checking {
        settled {
          usdBalance
        }
        pending {
          usdBalance
        }
      }
    }
  }
}
    `;

/**
 * __useGetUserByUserIdQuery__
 *
 * To run a query within a React component, call `useGetUserByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByUserIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserByUserIdQuery(baseOptions: Apollo.QueryHookOptions<GetUserByUserIdQuery, GetUserByUserIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserByUserIdQuery, GetUserByUserIdQueryVariables>(GetUserByUserIdDocument, options);
      }
export function useGetUserByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserByUserIdQuery, GetUserByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserByUserIdQuery, GetUserByUserIdQueryVariables>(GetUserByUserIdDocument, options);
        }
export type GetUserByUserIdQueryHookResult = ReturnType<typeof useGetUserByUserIdQuery>;
export type GetUserByUserIdLazyQueryHookResult = ReturnType<typeof useGetUserByUserIdLazyQuery>;
export type GetUserByUserIdQueryResult = Apollo.QueryResult<GetUserByUserIdQuery, GetUserByUserIdQueryVariables>;
export const UsersDocument = gql`
    query Users($first: Int!, $after: String) {
  users(first: $first, after: $after) {
    nodes {
      userId
      bitfinexUsername
      balance {
        unallocatedCollateral {
          settled {
            btcBalance
          }
        }
        checking {
          settled {
            usdBalance
          }
          pending {
            usdBalance
          }
        }
      }
    }
    pageInfo {
      endCursor
      startCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
    `;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useUsersQuery(baseOptions: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
      }
export function useUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersQueryResult = Apollo.QueryResult<UsersQuery, UsersQueryVariables>;
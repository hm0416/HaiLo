import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client';

export class RecoveryClient {
  client: ApolloClient;

  constructor() {
    const httpLink = new HttpLink({
      uri: 'http://localhost:4000/graphql',
    });

    this.client = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
    });
  }
}

export const recoveryClient = new RecoveryClient().client;

// Query to get the last mood check-in
export const GET_LAST_CHECK_IN = gql`
  query GetLastCheckIn {
    lastCheckIn {
      id
      anxiety
      stress
      depression
      timestamp
    }
  }
`;

// Mutation to save a new mood check-in
export const SAVE_CHECK_IN = gql`
  mutation SaveCheckIn($anxiety: Int!, $stress: Int!, $depression: Int!) {
    saveCheckIn(anxiety: $anxiety, stress: $stress, depression: $depression) {
      id
      anxiety
      stress
      depression
      timestamp
    }
  }
`;
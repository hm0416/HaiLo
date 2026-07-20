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

export const GET_VIDEOS = gql`
  query GetVideos {
    videos {
      id
      title
      source
      topic
      minScore
    }
  }
`;
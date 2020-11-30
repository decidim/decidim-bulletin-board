import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
} from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import ActionCableLink from "graphql-ruby-client/dist/subscriptions/ActionCableLink";
import ActionCable from "actioncable";

import GET_ELECTION_LOG_ENTRIES from "./operations/get_election_log_entries";
import SUBSCRIBE_TO_ELECTION_LOG from "./operations/subscribe_to_election_log";
import PROCESS_KEY_CEREMONY_STEP from "./operations/process_key_ceremony_step";

/**
 * This is the Bulletin Board API client that will use Apollo's client to
 * interact with our GraphQL schema using both http and websocket connections.
 */
export class GraphQLClient {
  /**
   * Initializes the class given the correct params. Since we need to handle
   * both http and websocket connections we need to create two links and use either
   * of them depending on the GraphQL operation.
   *
   * @constructor
   * @param {Object} params - An object that include the following options.
   *  - {String} apiEndpointUrl - The http endpoint used to perform queries and mutations.
   *  - {String} wsEndpointUrl - The ws endpoint used to perform subscriptions.
   *  - {Object?} headers - An optional object of headers to be included on http requests.
   */
  constructor({ apiEndpointUrl, wsEndpointUrl, headers }) {
    const wsLink = new ActionCableLink({
      cable: ActionCable.createConsumer(wsEndpointUrl),
    });

    const httpLink = new HttpLink({
      uri: apiEndpointUrl,
      headers,
    });

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    );

    this.apolloClient = new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
    });
  }

  /**
   * Query all log entries for the given election id.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} electionId - The election's id.
   * @returns {Promise<Array<Object>>} - A collection of log entries.
   * @throws Will throw an error if the request is rejected.
   */
  async getElectionLogEntries({ electionId }) {
    const result = await this.apolloClient.query({
      query: GET_ELECTION_LOG_ENTRIES,
      variables: {
        electionId,
      },
    });

    return result.data.election.logEntries;
  }

  /**
   * Returns an observable that needs to be manually subscribed and unsubscribed.
   * When a new log entry is added it maps the GraphQL result to a log entry.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} electionId - The election's id.
   * @returns {Observable<Object>} - An observable that returns every log entry added.
   */
  subscribeToElectionLogEntriesUpdates({ electionId }) {
    return this.apolloClient
      .subscribe({
        query: SUBSCRIBE_TO_ELECTION_LOG,
        variables: {
          electionId,
        },
      })
      .map(
        ({ data }) =>
          data &&
          data.electionLogEntryAdded &&
          data.electionLogEntryAdded.logEntry
      );
  }

  /**
   * Process a key ceremony step sending a signed message.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} electionId - The election's id.
   * @returns {Promise<Object>} - A pending message created.
   * @throws Will throw an error if the request is rejected or the data contains an error.
   */
  async processKeyCeremonyStep({ signedData }) {
    const result = await this.apolloClient.mutate({
      mutation: PROCESS_KEY_CEREMONY_STEP,
      variables: {
        signedData,
      },
    });

    if (result.data.processKeyCeremonyStep.error) {
      throw new Error(result.data.processKeyCeremonyStep.error);
    }

    return result.data.processKeyCeremonyStep.pendingMessage;
  }
}

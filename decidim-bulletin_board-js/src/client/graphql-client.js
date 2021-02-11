import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";

import GET_ELECTION_LOG_ENTRIES from "./operations/get_election_log_entries";
import PROCESS_KEY_CEREMONY_STEP from "./operations/process_key_ceremony_step";
import PROCESS_TALLY_STEP from "./operations/process_tally_step";
import GET_LOG_ENTRY from "./operations/get_log_entry";
import GET_PENDING_MESSAGE_BY_MESSAGE_ID from "./operations/get_pending_message_by_message_id";

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
   *  - {Object?} headers - An optional object of headers to be included on http requests.
   */
  constructor({ apiEndpointUrl, headers }) {
    const httpLink = new HttpLink({
      uri: apiEndpointUrl,
      headers,
    });

    this.apolloClient = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
    });
  }

  /**
   * Query a log entry for the given election unique id and the given content hash.
   *
   * @param {Object} params - An object that includes the following options.
   *  - {String} electionUniqueId - The election's unique id.
   *  - {String} contentHash - The log entry content hash.
   * @returns {Promise<Array<Object>>} - A log entry.
   * @throws Will throw an error if the request is rejected.
   */
  async getLogEntry({ electionUniqueId, contentHash }) {
    const result = await this.apolloClient.query({
      query: GET_LOG_ENTRY,
      variables: {
        electionUniqueId,
        contentHash,
      },
    });
    return result.data.logEntry;
  }

  /**
   * Query all log entries for the given election unique id.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} electionUniqueId - The election's unique id.
   *  - {String} after - The last log entry id received, to avoid including those entries again.
   *  - {Array<String>} types - The list of type of messages to retrieve.
   * @returns {Promise<Array<Object>>} - A collection of log entries.
   * @throws Will throw an error if the request is rejected.
   */
  async getElectionLogEntries({ electionUniqueId, after, types }) {
    const result = await this.apolloClient.query({
      query: GET_ELECTION_LOG_ENTRIES,
      variables: {
        electionUniqueId,
        after,
        types,
      },
      fetchPolicy: "no-cache",
    });

    return result.data.election.logEntries;
  }

  /**
   * Process a key ceremony step sending a signed message.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} messageId - The message id.
   *  - {String} signedData - The signed data to be processed.
   * @returns {Promise<Object>} - A pending message created.
   * @throws Will throw an error if the request is rejected or the data contains an error.
   */
  async processKeyCeremonyStep({ messageId, signedData }) {
    const result = await this.apolloClient.mutate({
      mutation: PROCESS_KEY_CEREMONY_STEP,
      variables: {
        messageId,
        signedData,
      },
    });

    if (result.data.processKeyCeremonyStep.error) {
      throw new Error(result.data.processKeyCeremonyStep.error);
    }

    return result.data.processKeyCeremonyStep.pendingMessage;
  }

  /**
   * Query PendingMessages for a given messageId
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} messageId - The messageId
   * @returns {Promise<Object>} - The pending message received.
   * @throws Will throw an error if the request is rejected.
   */
  async getPendingMessageByMessageId({ messageId }) {
    const result = await this.apolloClient.query({
      query: GET_PENDING_MESSAGE_BY_MESSAGE_ID,
      variables: {
        messageId,
      },
    });

    return result.data.pendingMessage;
  }

  /**
   * Process a tally step sending a signed message.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} messageId - The message id.
   *  - {String} signedData - The signed data to be processed.
   * @returns {Promise<Object>} - A pending message created.
   * @throws Will throw an error if the request is rejected or the data contains an error.
   */
  async processTallyStep({ messageId, signedData }) {
    const result = await this.apolloClient.mutate({
      mutation: PROCESS_TALLY_STEP,
      variables: {
        messageId,
        signedData,
      },
    });

    if (result.data.processTallyStep.error) {
      throw new Error(result.data.processTallyStep.error);
    }

    return result.data.processTallyStep.pendingMessage;
  }
}

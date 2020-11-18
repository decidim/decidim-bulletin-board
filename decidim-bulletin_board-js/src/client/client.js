import { GraphQLClient } from "./graphql-client";

/**
 * This is a facade over the API client specific implementation.
 */
export class Client {
  /**
   * Initializes the API client using the same params.
   *
   * @constructor
   * @param {Object} params - An object that include the same params as the API client.
   */
  constructor(params) {
    this.apiClient = new GraphQLClient(params);
  }

  /**
   * Query all log entries for the given election id.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} electionId - The election's id.
   * @returns {Promise<Array<Object>>} - A collection of log entries.
   * @throws Will throw an error if the request is rejected.
   */
  getElectionLogEntries({ electionId }) {
    return this.apiClient.getElectionLogEntries({ electionId });
  }

  /**
   * Subscribes to an Observable and executes a callback function with each log entry added.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} electionId - The election's id.
   * @param {Function} onNextLogEntryUpdate - A callback function that will be called with each log entry added the election.
   * @returns {Subscription} - A subscription object that can be manually unsubscribed.
   */
  subscribeToElectionLogEntriesUpdates({ electionId }, onNextLogEntryUpdate) {
    const subscription = this.apiClient.subscribeToElectionLogEntriesUpdates({
      electionId,
    });

    return subscription.subscribe(onNextLogEntryUpdate);
  }

  /**
   * Process a key ceremony step sending a signed message.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} electionId - The election's id.
   * @returns {Promise<Object>} - A pending message created.
   * @throws Will throw an error if the request is rejected or the data contains an error.
   */
  processKeyCeremonyStep({ signedData }) {
    return this.apiClient.processKeyCeremonyStep({ signedData });
  }
}

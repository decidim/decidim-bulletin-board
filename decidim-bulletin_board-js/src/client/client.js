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
   * Query a log entry for the given election unique id and the given content hash.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} electionUniqueId - The election's unique id.
   *  - {String} contentHash - The log entry content hash.
   * @returns {Promise<Array<Object>>} - A log entry.
   * @throws Will throw an error if the request is rejected.
   */
  getLogEntry({ electionUniqueId, contentHash }) {
    return this.apiClient.getLogEntry({ electionUniqueId, contentHash });
  }

  /**
   * Query all log entries for the given election id.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} electionUniqueId - The election's unique id.
   * @returns {Promise<Array<Object>>} - A collection of log entries.
   * @throws Will throw an error if the request is rejected.
   */
  getElectionLogEntries({ electionUniqueId, after }) {
    return this.apiClient.getElectionLogEntries({ electionUniqueId, after });
  }

  /**
   * Subscribes to an Observable and executes a callback function with each log entry added.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} electionUniqueId - The election's unique id.
   * @param {Function} onNextLogEntryUpdate - A callback function that will be called with each log entry added the election.
   * @returns {Subscription} - A subscription object that can be manually unsubscribed.
   */
  subscribeToElectionLogEntriesUpdates(
    { electionUniqueId },
    onNextLogEntryUpdate
  ) {
    const subscription = this.apiClient.subscribeToElectionLogEntriesUpdates({
      electionUniqueId,
    });

    return subscription.subscribe((logEntry) => {
      if (logEntry) {
        onNextLogEntryUpdate(logEntry);
      }
    });
  }

  /**
   * Process a key ceremony step sending a signed message.
   *
   * @param {Object} params - An object that include the following options.
   *  - {String} signedData - The signed data to be processed.
   * @returns {Promise<Object>} - A pending message created.
   * @throws Will throw an error if the request is rejected or the data contains an error.
   */
  processKeyCeremonyStep({ messageId, signedData }) {
    return this.apiClient.processKeyCeremonyStep({ messageId, signedData });
  }
}

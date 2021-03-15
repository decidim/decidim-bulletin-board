import { GraphQLClient } from "./graphql-client";

export const WAIT_TIME_MS = 1_000; // 1s

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
   *  - {String} after - The last log entry id received, to avoid including those entries again.
   *  - {Array<String>} types - The list of type of messages to retrieve.
   * @returns {Promise<Array<Object>>} - A collection of log entries.
   * @throws Will throw an error if the request is rejected.
   */
  getElectionLogEntries(params) {
    return this.apiClient.getElectionLogEntries(params);
  }

  /**
   * Process a key ceremony step sending a signed message.
   *
   * @param {Object} params - An object that includes the data to perform the operation.
   * @returns {Promise<Object>} - A pending message created.
   * @throws Will throw an error if the request is rejected or the data contains an error.
   */
  processKeyCeremonyStep(params) {
    return this.apiClient.processKeyCeremonyStep(params);
  }

  /**
   * Process a tally step sending a signed message.
   *
   * @param {Object} params - An object that includes the data to perform the operation.
   * @returns {Promise<Object>} - A pending message created.
   * @throws Will throw an error if the request is rejected or the data contains an error.
   */
  processTallyStep(params) {
    return this.apiClient.processTallyStep(params);
  }

  /**
   * Wait until a pending message is processed
   *
   * @param {String} messageId - the unique identifier of a message
   * @param {Integer} [waitTime=WAIT_TIME_MS] - the interval to wait for the pending message to be processed
   * @returns {Promise<Object>} - Returns the PendingMessage
   */
  waitForPendingMessageToBeProcessed(messageId, waitTime = WAIT_TIME_MS) {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        this.apiClient
          .getPendingMessageByMessageId({
            messageId,
          })
          .then((pendingMessage) => {
            if (pendingMessage.status !== "enqueued") {
              clearInterval(intervalId);
              resolve(pendingMessage);
            }
          });
      }, waitTime);
    });
  }
}

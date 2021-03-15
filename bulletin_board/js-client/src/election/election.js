import { MessageIdentifier, TRUSTEE_TYPE } from "../client/message-identifier";

export const WAIT_TIME_MS = 2_000; // 2s

/**
 * Handles the election state and includes some methods to interact with the election log.
 */
export class Election {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   *  - {String} uniqueId - The unique identifier of an election.
   *  - {Client} bulletinBoardClient - An instance of the Bulletin Board Client
   *  - {Array<String>} typesFilter - The list of type of messages to retrieve.
   *  - {Object?} options - An optional object with some extra options.
   */
  constructor({ uniqueId, bulletinBoardClient, typesFilter, options }) {
    this.uniqueId = uniqueId;
    this.bulletinBoardClient = bulletinBoardClient;
    this.logEntries = [];
    this.typesFilter = typesFilter;
    this.subscriptionId = null;
    this.options = options || { waitUntilNextCheck: WAIT_TIME_MS };
  }

  /**
   * Store the election log entries and periodically check if there are new entries.
   *
   * @returns {Promise<undefined>}
   */
  async subscribeToLogEntriesChanges() {
    this.unsubscribeToLogEntriesChanges();

    // Ensure that we get the current log entries before starting the subscription.
    await this.getLogEntries();

    this.subscriptionId = setInterval(() => {
      this.getLogEntries();
    }, this.options.waitUntilNextCheck);
  }

  /**
   * Clear the periodically checks of new log entries.
   *
   * @returns {undefined}
   */
  unsubscribeToLogEntriesChanges() {
    if (this.subscriptionId !== null) {
      clearInterval(this.subscriptionId);
      this.subscriptionId = null;
    }
  }

  /**
   * Return the last message stored in the log sent by the given trustee.
   *
   * @param {String} trusteeId - The unique identifier of a trustee.
   * @returns {Object|null}
   */
  getLastMessageFromTrustee(trusteeId) {
    for (let i = this.logEntries.length - 1; i >= 0; i--) {
      const logEntry = this.logEntries[i];
      const messageIdentifier = MessageIdentifier.parse(logEntry.messageId);
      if (
        messageIdentifier.author.type === TRUSTEE_TYPE &&
        messageIdentifier.author.id === trusteeId
      ) {
        return logEntry;
      }
    }

    return null;
  }

  /**
   * Uses the bulletin board client to get all the election log entries after the
   * last log entry stored in the election's state.
   *
   * @private
   * @returns {Promise<nothing>}
   */
  getLogEntries() {
    const lastLogEntry = this.logEntries[this.logEntries.length - 1];
    const after = (lastLogEntry && lastLogEntry.id) || null;

    return new Promise((resolve) => {
      this.bulletinBoardClient
        .getElectionLogEntries({
          electionUniqueId: this.uniqueId,
          after,
          types: this.typesFilter,
        })
        .then((logEntries) => {
          if (logEntries.length) {
            this.logEntries = [...this.logEntries, ...logEntries];
          }
          resolve();
        });
    });
  }
}

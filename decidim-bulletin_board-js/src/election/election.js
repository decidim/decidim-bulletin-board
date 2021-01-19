import { MessageIdentifier, TRUSTEE_TYPE } from "../client/message-identifier";

export const WAIT_TIME_MS = 1_000; // 1s

/**
 * Handles the election state and include some methods to interact with the election log.
 */
export class Election {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   *  - {Client} bulletinBoardClient - An instance of the Bulletin Board Client
   *  - {String} uniqueId - The unique identifier of an election.
   *  - {Object?} options - An optional object with some extra options.
   */
  constructor({ bulletinBoardClient, uniqueId, options }) {
    this.uniqueId = uniqueId;
    this.bulletinBoardClient = bulletinBoardClient;
    this.logEntries = [];
    this.subscriptionId = null;
    this.options = options || { waitUntilNextCheck: WAIT_TIME_MS };
  }

  /**
   * Store the election log entries and periodically check if there are new entries.
   *
   * @returns {undefined}
   */
  subscribeToLogEntriesChanges() {
    this.unsubscribeToLogEntriesChanges();

    this.getLogEntries();

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
   * @returns {nothing}
   */
  getLogEntries() {
    const lastLogEntry = this.logEntries[this.logEntries.length - 1];
    const after = (lastLogEntry && lastLogEntry.id) || null;

    this.bulletinBoardClient
      .getElectionLogEntries({
        electionUniqueId: this.uniqueId,
        after,
      })
      .then((logEntries) => {
        if (logEntries.length) {
          this.logEntries = [...this.logEntries, ...logEntries];
        }
      });
  }
}

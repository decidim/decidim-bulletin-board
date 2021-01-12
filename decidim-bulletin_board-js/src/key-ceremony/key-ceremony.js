import { Subject } from "rxjs";
import { Trustee } from "../trustee/trustee";
import { MessageIdentifier, TRUSTEE_TYPE } from "../client/message-identifier";

export const WAIT_TIME_MS = 1_000; // 1s
export const MESSAGE_RECEIVED = "[Message] Received";
export const MESSAGE_PROCESSED = "[Message] Processed";

/**
 * Handles all the key ceremony steps for a specific election and trustee.
 */
export class KeyCeremony {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   *  - {Client} bulletinBoardClient - An instance of the Bulletin Board Client
   *  - {Object} electionContext - An object that contains some necessary attributes
   *                               of the election to perform the key ceremony.
   *  - {Object?} options - An optional object with some options to configure the key ceremony.
   */
  constructor({ bulletinBoardClient, electionContext, options }) {
    this.bulletinBoardClient = bulletinBoardClient;
    this.electionContext = electionContext;
    this.currentTrustee = null;
    this.options = options || { bulletinBoardWaitTime: WAIT_TIME_MS };
    this.pollingIntervalId = null;
    this.electionLogEntries = [];
    this.response = null;
    this.events = new Subject();
  }

  /**
   * Performs some operations to setup the key ceremony. Initializes the trustee
   * object based on the given election context and subscribe to log entries updates.
   *
   * @returns {Promise<void>}
   */
  async setup() {
    const { currentTrusteeContext } = this.electionContext;

    this.currentTrustee = new Trustee(currentTrusteeContext);

    await this.getLogEntries();
    this.nextLogEntryIndexToProcess = 0;
  }

  /**
   * Retrieves all the new log entries for the elections and adds them to the list with all the entries.
   */
  async getLogEntries() {
    const { id: electionUniqueId } = this.electionContext;

    const lastLogEntry = this.electionLogEntries[
      this.electionLogEntries.length - 1
    ];
    const after = (lastLogEntry && lastLogEntry.id) || null;

    this.bulletinBoardClient
      .getElectionLogEntries({
        electionUniqueId,
        after,
      })
      .then((logEntries) => {
        if (logEntries.length) {
          this.electionLogEntries = [...this.electionLogEntries, ...logEntries];
        }
      });
  }

  /**
   * Checks if a restore state operation is needed before starting processing new messages.
   *
   * @returns {Promise<void>}
   */
  restoreNeeded() {
    const lastMessage = this.lastMessageSent();
    return (
      lastMessage &&
      this.currentTrustee.checkRestoreNeeded(lastMessage.messageId)
    );
  }

  /**
   * Get the last message sent to the election log by this trustee.
   *
   * @returns {string}
   */
  lastMessageSent() {
    for (let i = this.electionLogEntries.length - 1; i >= 0; i--) {
      const logEntry = this.electionLogEntries[i];
      const messageIdentifier = MessageIdentifier.parse(logEntry.messageId);

      if (
        messageIdentifier.author.type === TRUSTEE_TYPE &&
        messageIdentifier.author.id === this.currentTrustee.id
      ) {
        return logEntry;
      }
    }
  }

  /**
   * Returns the state of the wrapper to be able to perform future restores.
   *
   * @returns {string}
   */
  backup() {
    return this.currentTrustee.backup();
  }

  /**
   * Restores the state of the wrapper to continue from a state backup.
   *
   * @param {string} wrapperState - As string with the wrapper state retrieved from the backup method.
   * @returns {boolean}
   */
  restore(wrapperState) {
    if (!this.restoreNeeded()) {
      return false;
    }

    const lastMessage = this.lastMessageSent();
    return this.currentTrustee.restore(
      wrapperState,
      lastMessage && lastMessage.messageId
    );
  }

  /**
   * Starts or continues with the key ceremony.
   *
   * @param {string} wrapperState - As string with the wrapper state retrieved from the backup method.
   * @returns {Promise<Object>}
   */
  async run() {
    if (this.restoreNeeded()) {
      throw new Error("You need to restore the wrapper state to continue");
    }

    if (!this.pollingIntervalId) {
      this.pollingIntervalId = setInterval(() => {
        this.getLogEntries();
      }, this.options.bulletinBoardWaitTime);
    }

    if (this.response) {
      await this.sendMessageToBulletinBoard(this.response);
    }

    return this.waitForNextLogEntryResult().then(
      async ({ message, done, save }) => {
        this.response = message;
        if (done) {
          clearInterval(this.pollingIntervalId);
        } else if (!save) {
          return this.run();
        }
      }
    );
  }

  /**
   * Creates a interval that will check periodically if there are new log entries
   * to process. The interval is done when a new log entry is processed and it has
   * a result.
   *
   * @private
   * @returns {Promise<Object>}
   */
  waitForNextLogEntryResult() {
    return new Promise((resolve) => {
      const intervalId = setInterval(async () => {
        let result;

        if (this.electionLogEntries.length > this.nextLogEntryIndexToProcess) {
          result = await this.processNextLogEntry();
        }

        if (result) {
          clearInterval(intervalId);
          resolve(result);
        }
      }, this.options.bulletinBoardWaitTime);
    });
  }

  /**
   * Uses the `Trustee` object to process the next log entry and outputs the result.
   *
   * @private
   * @returns {Promise<Object|null>}
   */
  async processNextLogEntry() {
    const message = this.electionLogEntries[this.nextLogEntryIndexToProcess];

    this.events.next({
      type: MESSAGE_RECEIVED,
      message,
    });

    const result = await this.currentTrustee.processLogEntry(message);

    this.events.next({
      type: MESSAGE_PROCESSED,
      message,
      result,
    });

    this.nextLogEntryIndexToProcess += 1;

    return result;
  }

  /**
   * Sign a message using the `Trustee` identification keys and send it to the Bulletin Board.
   *
   * @private
   * @param {Object} message - An object containing some data to be sent to the Bulletin Board.
   * @returns {Promise<Object>}
   * @throws An exception is raised if there is a problem with the client.
   */
  async sendMessageToBulletinBoard(message) {
    if (
      this.electionLogEntries.find(
        (logEntry) => logEntry.messageId === message.message_id
      )
    ) {
      return;
    }

    const signedData = await this.currentTrustee.sign({
      iat: Math.floor(new Date() / 1000),
      ...message,
    });

    return this.bulletinBoardClient.processKeyCeremonyStep({
      messageId: message.message_id,
      signedData,
    });
  }
}

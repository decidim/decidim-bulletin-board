import { Subject } from "rxjs";

export const WAIT_TIME_MS = 1_000; // 1s
export const MESSAGE_RECEIVED = "[Message] Received";
export const MESSAGE_PROCESSED = "[Message] Processed";

/**
 * TODO
 * Handles all the key ceremony steps for a specific election and trustee.
 */
export class Tally {
  /**
   * TODO
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   *  - {Client} bulletinBoardClient - An instance of the Bulletin Board Client
   */
  constructor({ bulletinBoardClient, election, trustee, options }) {
    this.bulletinBoardClient = bulletinBoardClient;
    this.election = election;
    this.trustee = trustee;
    this.options = options || { waitUntilNextCheck: WAIT_TIME_MS };
    this.events = new Subject();
    this.nextLogEntryIndexToProcess = 0;
  }

  /**
   * Performs some operations to setup the tally.
   *
   * Initializes a subscription to store new log entries for the given election.
   *
   * @returns {Promise<undefined>}
   */
  setup() {
    return this.election.subscribeToLogEntriesChanges();
  }

  /**
   * TODO
   * Starts or continues with the key ceremony.
   *
   * @param {string} wrapperState - As string with the wrapper state retrieved from the backup method.
   * @returns {Promise<Object>}
   */
  async run() {
    if (this.trustee.needsToBeRestored()) {
      throw new Error("You need to restore the wrapper state to continue");
    }

    return this.waitForNextLogEntryResult().then(async ({ message, cast }) => {
      if (cast) {
        await this.sendMessageToBulletinBoard(message);
        this.tearDown();
      } else {
        return this.run();
      }
    });
  }

  /**
   * TODO
   */
  tearDown() {
    this.election.unsubscribeToLogEntriesChanges();
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
        const { logEntries } = this.election;
        let result;

        if (logEntries.length > this.nextLogEntryIndexToProcess) {
          result = await this.processNextLogEntry();
        }

        if (result) {
          clearInterval(intervalId);
          resolve(result);
        }
      }, this.options.waitUntilNextCheck);
    });
  }

  /**
   * Uses the `Trustee` object to process the next log entry and outputs the result.
   *
   * @private
   * @returns {Promise<Object|null|undefined>}
   */
  async processNextLogEntry() {
    const { logEntries } = this.election;
    const message = logEntries[this.nextLogEntryIndexToProcess];

    this.events.next({
      type: MESSAGE_RECEIVED,
      message,
    });

    const result = await this.trustee.processLogEntry(message);

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
    const { logEntries } = this.election;

    if (
      logEntries.find((logEntry) => logEntry.messageId === message.message_id)
    ) {
      return;
    }

    const signedData = await this.trustee.sign({
      iat: Math.floor(new Date() / 1000),
      ...message,
    });

    return this.bulletinBoardClient.processTallyStep({
      messageId: message.message_id,
      signedData,
    });
  }
}

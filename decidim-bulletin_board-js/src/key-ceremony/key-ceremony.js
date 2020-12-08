import { Subject } from "rxjs";
import { Trustee } from "../trustee/trustee";

export const WAIT_TIME_MS = 1_000; // 1s
export const MESSAGE_RECEIVED = "[Message] Received";
export const MESSAGE_PROCESSED = "[Message] Processed";

const DEFAULT_STATE = { message: null, done: false };

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
    this.events = new Subject();
  }

  /**
   * Performs some operations to setup the key ceremony. Initializes the trustee
   * object based on the given election context and subscribe to log entries updates.
   *
   * @returns {Promise<void>}
   */
  async setup() {
    const {
      id: electionUniqueId,
      currentTrusteeContext,
    } = this.electionContext;

    this.currentTrustee = new Trustee(currentTrusteeContext);

    this.electionLogEntries = await this.bulletinBoardClient.getElectionLogEntries(
      {
        electionUniqueId,
      }
    );

    this.nextLogEntryIndexToProcess = 0;

    this.subscription = this.bulletinBoardClient.subscribeToElectionLogEntriesUpdates(
      {
        electionUniqueId,
      },
      (logEntry) => {
        this.electionLogEntries = [...this.electionLogEntries, logEntry];
      }
    );
  }

  /**
   * Start the key ceremony with the default initial state. When the ceremony
   * ends a final `Object`` is returned inside a `Promise` that contains the election key.
   *
   * @returns {Promise<Object>}
   */
  async run() {
    return this.processNextStep(DEFAULT_STATE);
  }

  /**
   * Receives the result of a log entry processed. It the key ceremony is done
   * it just returns the final result. Otherwise it waits until another log entry is processed
   * and calls itself again with the result.
   *
   * @private
   * @param {Object} result - The result of the previous processed log entry.
   * @returns {Promise<Object>}
   */
  async processNextStep({ message, done }) {
    if (!done) {
      return this.waitForNextLogEntryResult().then(async (result) => {
        await this.sendMessageToBulletinBoard(result);
        return this.processNextStep(result);
      });
    }
    return message;
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
   * @returns <Promise<Object>}
   * @throws An exception is raised if there is a problem with the client.
   */
  async sendMessageToBulletinBoard({ message }) {
    const {
      id: electionUniqueId,
      currentTrusteeContext,
    } = this.electionContext;

    const { id: trusteeId } = currentTrusteeContext;
    const messageId = `${electionUniqueId}.key_ceremony+t.${trusteeId}`;

    const signedData = await this.currentTrustee.sign({
      ...message,
      message_id: messageId,
    });

    return this.bulletinBoardClient.processKeyCeremonyStep({
      messageId,
      signedData,
    });
  }
}
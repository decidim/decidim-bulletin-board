import { TrusteeWrapper } from "./trustee_wrapper_dummy";
import { EventManager } from "./event_manager";
import { JWTParser } from "./jwt_parser";

export const WAIT_TIME_MS = 1_000; // 1s

/**
 * This class encapsulates all the behavior that is needed to interact with the evoting
 * system as a Trustee role.
 */
export class Trustee {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   *  - {String} uniqueId - The trustee identifier.
   *  - {Client} bulletinBoardClient - An instance of the Bulletin Board Client
   *  - {Object} identificationKeys - A object that contains both the public and private key for
   *                                  the corresponding trustee.
   *  - {Object} election - An object that interacts with a specific election
   *                        to get some data and perform the key ceremony.
   *  - {Object?} options - An optional object with some extra options.
   */
  constructor({
    uniqueId,
    bulletinBoardClient,
    identificationKeys,
    election,
    options,
  }) {
    this.uniqueId = uniqueId;
    this.bulletinBoardClient = bulletinBoardClient;
    this.identificationKeys = identificationKeys;
    this.election = election;
    this.options = options || { waitUntilNextCheck: WAIT_TIME_MS };
    this.wrapper = new TrusteeWrapper({ trusteeId: uniqueId });
    this.parser = new JWTParser();
    this.events = new EventManager();
    this.nextLogEntryIndexToProcess = 0;
    this.lastMessageProcessedWithResult = null;
  }

  /**
   * Performs some operations to setup the trustee.
   *
   * Initializes a subscription to store new log entries for the given election.
   *
   * @returns {Promise<undefined>}
   */
  setup() {
    return this.election.subscribeToLogEntriesChanges();
  }

  /**
   * Performs some operations to clean up after the key ceremony is done.
   *
   * @returns {undefined}
   */
  tearDown() {
    this.election.unsubscribeToLogEntriesChanges();
  }

  /**
   * Starts or continues with the key ceremony process.
   *
   * @returns {Promise<Object|undefined>}
   * @throws An exception is raised if the trustee needs to be restored or
   *         there is a problem with the client.
   */
  async keyCeremony() {
    if (this.needsToBeRestored()) {
      throw new Error("You need to restore the wrapper state to continue");
    }

    if (this.lastMessageProcessedWithResult) {
      await this.signMessage(
        this.lastMessageProcessedWithResult,
        (signedData) => {
          return this.bulletinBoardClient.processKeyCeremonyStep({
            messageId: this.lastMessageProcessedWithResult.message_id,
            signedData,
          });
        }
      );
    }

    return this.waitForNextLogEntryResult().then(
      async ({ message, done, save }) => {
        this.lastMessageProcessedWithResult = message;
        if (done) {
          this.tearDown();
        } else if (!save) {
          return this.keyCeremony();
        }
      }
    );
  }

  /**
   * Starts or continues with the tally process.
   *
   * @returns {Promise<Object|undefined>}
   * @throws An exception is raised if the trustee needs to be restored or
   *         there is a problem with the client.
   */
  async tally() {
    if (this.needsToBeRestored()) {
      throw new Error("You need to restore the wrapper state to continue");
    }

    return this.waitForNextLogEntryResult().then(async ({ message, cast }) => {
      if (cast) {
        await this.signMessage(message, (signedData) => {
          return this.bulletinBoardClient.processTallyStep({
            messageId: message.message_id,
            signedData,
          });
        });
        this.tearDown();
      } else {
        return this.tally();
      }
    });
  }

  /**
   * Whether the trustee state needs to be restored or not.
   *
   * @returns {boolean}
   */
  needsToBeRestored() {
    const lastMessageFromTrustee = this.election.getLastMessageFromTrustee(
      this.uniqueId
    );

    return (
      lastMessageFromTrustee &&
      this.wrapper.needsToBeRestored(lastMessageFromTrustee.messageId)
    );
  }

  /**
   * Returns the state of the trustee to be able to perform future restores.
   *
   * @returns {string}
   */
  backup() {
    return this.wrapper.backup();
  }

  /**
   * Restore the trustee state from the given state string. It uses the last message sent to check that the state is valid.
   *
   * @param {string} wrapperState - As string with the trustee state retrieved from the backup method.
   * @returns {boolean}
   */
  restore(wrapperState) {
    const lastMessageFromTrustee = this.election.getLastMessageFromTrustee(
      this.uniqueId
    );

    return (
      lastMessageFromTrustee &&
      this.wrapper.restore(wrapperState, lastMessageFromTrustee.messageId)
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
   * Process the next log entry and outputs the result. It broadcasts an event
   * when the message is received and another one when it is processed.
   *
   * @private
   * @returns {Promise<Object|null|undefined>}
   */
  async processNextLogEntry() {
    const { logEntries } = this.election;
    const message = logEntries[this.nextLogEntryIndexToProcess];

    this.events.broadcastMessageReceived(message);

    const payload = await this.parser.parse(message.signedData);
    const result = await this.wrapper.processMessage(
      message.messageId,
      payload
    );

    this.events.broadcastMessageProcessed(message, result);

    this.nextLogEntryIndexToProcess += 1;

    return result;
  }

  /**
   * Sign a message using the identification keys and calls a function with the result
   * if the message is not already present in the election log.
   *
   * @private
   * @param {Object} message - The message to be signed.
   * @returns {Promise<Object|undefined>}
   */
  async signMessage(message, operationFn) {
    const { logEntries } = this.election;

    if (
      logEntries.find((logEntry) => logEntry.messageId === message.message_id)
    ) {
      return;
    }

    const signedData = await this.identificationKeys.sign({
      iat: Math.floor(new Date() / 1000),
      ...message,
    });

    return operationFn(signedData);
  }
}

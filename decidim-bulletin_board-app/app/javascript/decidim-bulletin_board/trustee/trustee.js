/* eslint-disable camelcase */
import { TrusteeWrapper } from "./trustee_wrapper_dummy";
import { EventManager } from "./event_manager";
import { MessageParser } from "../client/message-parser";

export const WAIT_TIME_MS = 100; // 0.1s

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
   *  - {String} authorityPublicKeyJSON - The authority identification public key.
   *  - {Object} identificationKeys - A object that contains both the public and private key for
   *                                  the corresponding trustee.
   *  - {Object} election - An object that interacts with a specific election
   *                        to get some data and perform the key ceremony.
   *  - {Object?} options - An optional object with some extra options.
   */
  constructor({
    uniqueId,
    bulletinBoardClient,
    authorityPublicKeyJSON,
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
    this.parser = new MessageParser({ authorityPublicKeyJSON });
    this.events = new EventManager();
    this.nextLogEntryIndexToProcess = 0;
    this.lastMessageProcessedWithResult = null;
    this.hasSetupKeyCeremony = false;
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
   * Setup the key ceremony process processing the first log entry and yielding its result.
   * Then it sends the result to the bulletin board and mark the setup as done.
   *
   * @generator
   * @yields {String} - The state of the trustee to be able to perform future restores.
   * @returns {Promise<Boolean>}
   */
  async *setupKeyCeremony() {
    let message;
    while (!message) {
      message = await this.waitForNextLogEntryResult();
    }

    yield this.wrapper.backup();
    await this.processKeyCeremonyStep(message);
    this.hasSetupKeyCeremony = true;
    return this.hasSetupKeyCeremony;
  }

  /**
   * Starts or continues with the key ceremony process.
   *
   * @returns {Promise<Object|undefined>}
   * @throws An exception is raised if the trustee needs to be restored or
   *         there is a problem with the client.
   */
  async runKeyCeremony() {
    if (!this.hasSetupKeyCeremony) {
      throw new Error("The key ceremony has not been setup yet");
    }

    if (this.needsToBeRestored()) {
      throw new Error("You need to restore the wrapper state to continue");
    }

    return this.waitForNextLogEntryResult().then(async (message) => {
      await this.processKeyCeremonyStep(message);

      if (this.wrapper.isKeyCeremonyDone()) {
        return this.tearDown();
      }

      return this.runKeyCeremony();
    });
  }

  /**
   * Starts or continues with the tally process.
   *
   * @returns {Promise<Object|undefined>}
   * @throws An exception is raised if the trustee needs to be restored or
   *         there is a problem with the client.
   */
  async runTally() {
    if (this.needsToBeRestored()) {
      throw new Error("You need to restore the wrapper state to continue");
    }

    return this.waitForNextLogEntryResult().then(async (message) => {
      await this.processTallyStep(message);

      if (this.wrapper.isTallyDone()) {
        return this.tearDown();
      }

      return this.runTally();
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
   * Restore the trustee state from the given state string. It uses the last message sent to check that the state is valid.
   *
   * @param {string} wrapperState - As string with the trustee state retrieved from the backup method.
   * @returns {boolean}
   */
  restore(wrapperState) {
    const lastMessageFromTrustee = this.election.getLastMessageFromTrustee(
      this.uniqueId
    );

    this.hasSetupKeyCeremony =
      lastMessageFromTrustee &&
      this.wrapper.restore(wrapperState, lastMessageFromTrustee.messageId);
    return this.hasSetupKeyCeremony;
  }

  /**
   * Creates an interval that will check periodically if there are new log entries
   * to process. The interval is done when a new log entry is processed and it has
   * a result.
   *
   * @private
   * @returns {Promise<Object>}
   */
  waitForNextLogEntryResult() {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        const { logEntries } = this.election;

        if (logEntries.length > this.nextLogEntryIndexToProcess) {
          try {
            const result = await this.processNextLogEntry();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            clearInterval(intervalId);
          }
        }
      }, this.options.waitUntilNextCheck);
    });
  }

  /**
   * Processes the next log entry and outputs the result. It broadcasts an event
   * when the message is received and another one when it is processed.
   *
   * @private
   * @returns {Promise<Object|null|undefined>}
   */
  async processNextLogEntry() {
    const { logEntries } = this.election;
    const message = logEntries[this.nextLogEntryIndexToProcess];

    this.events.broadcastMessageReceived(message);
    const { messageIdentifier, decodedData } = await this.parser.parse(message);
    const result = await this.wrapper.processMessage(
      messageIdentifier,
      decodedData
    );

    this.events.broadcastMessageProcessed(message, result);

    this.nextLogEntryIndexToProcess += 1;

    return result;
  }

  /**
   * If there is a message to be sent that has not been sent already it is signed
   * and send it to the bulletin board as a key ceremony step.
   *
   * @private
   * @returns {Promise<Object|undefined>}
   */
  async processKeyCeremonyStep(message) {
    if (message && !this.isMessageAlreadyLogged(message)) {
      const signedData = await this.signMessage(message);
      return this.bulletinBoardClient.processKeyCeremonyStep({
        messageId: message.message_id,
        signedData,
      });
    }
  }

  /**
   * If there is a message to be sent that has not been sent already it is signed
   * and send it to the bulletin board as a trustee step.
   *
   * @private
   * @returns {Promise<Object|undefined>}
   */
  async processTallyStep(message) {
    if (message && !this.isMessageAlreadyLogged(message)) {
      const signedData = await this.signMessage(message);
      return this.bulletinBoardClient.processTallyStep({
        messageId: message.message_id,
        signedData,
      });
    }
  }

  /**
   * Whether the message is already in the election log or not.
   *
   * @private
   * @returns {Boolean}
   */
  isMessageAlreadyLogged({ message_id }) {
    const { logEntries } = this.election;
    return logEntries.find((logEntry) => logEntry.messageId === message_id);
  }

  /**
   * Signs a message using the trustee identification keys.
   *
   * @private
   * @param {Object} message - The message to be signed.
   * @returns {Promise<String>}
   */
  signMessage(message) {
    return this.identificationKeys.sign({
      iat: Math.floor(new Date() / 1000),
      ...message,
    });
  }
}

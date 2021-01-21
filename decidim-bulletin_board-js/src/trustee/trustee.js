import { TrusteeWrapper } from "./trustee_wrapper_dummy";
import { JWTParser } from "./jwt_parser";

/**
 * This is a facade class that will use the correspondig `TrusteeWrapper` to process
 * the log entries.
 */
export class Trustee {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   *  - {String} id - The trustee identifier.
   *  - {Object} identificationKeys - A object that contains both the public and private key for
   *                                  the corresponding trustee.
   *  - {Object} election - An object that interacts with a specific election
   *                        to get some data and perform the key ceremony.
   */
  constructor({ id, identificationKeys, election }) {
    this.id = id;
    this.identificationKeys = identificationKeys;
    this.election = election;
    this.wrapper = new TrusteeWrapper({ trusteeId: id });
    this.parser = new JWTParser();
  }

  /**
   * After parsing the `signedData` it processes the message using the wrapper.
   *
   * @param {Object} logEntry - The log entry to be processed.
   * @returns {Promise<Object>} - The result of the processing if any.
   */
  async processLogEntry({ messageId, signedData }) {
    const payload = await this.parser.parse(signedData);
    return this.wrapper.processMessage(messageId, payload);
  }

  /**
   * Delegates the sign process to the `identificationKeys`. It signs the
   * message using the private key.
   *
   * @params {Object} message - The message to be signed.
   * @returns {Promise<String>} - The signed message.
   */
  sign(message) {
    return this.identificationKeys.sign(message);
  }

  /**
   * Whether the trustee state needs to be restored or not.
   *
   * @returns {boolean}
   */
  needsToBeRestored() {
    const lastMessageFromTrustee = this.election.getLastMessageFromTrustee(
      this.id
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
      this.id
    );

    return (
      lastMessageFromTrustee &&
      this.wrapper.restore(wrapperState, lastMessageFromTrustee.messageId)
    );
  }
}

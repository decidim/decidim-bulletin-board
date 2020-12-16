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
   */
  constructor({ id, identificationKeys }) {
    this.id = id;
    this.wrapper = new TrusteeWrapper({ trusteeId: id });
    this.parser = new JWTParser();
    this.identificationKeys = identificationKeys;
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
   * Checks if the wrapper considers that a restore is needed based on the last messageId sent by the trustee.
   *
   * @params {Object} messageId - The message_id of the last message sent by the trustee.
   * @returns {boolean} - The answer from the wrapper.
   */
  checkRestoreNeeded(messageId) {
    return this.wrapper.checkRestoreNeeded(messageId);
  }

  /**
   * Restore the wrapper from the given state string. This uses the last messageId sent to check that the state is valid.
   *
   * @params {string} wrapperState - The state of the wrapper to recover.
   * @params {Object} messageId - The message_id of the last message sent by the trustee.
   * @returns {boolean} - The result of the restore operation.
   */
  restore(wrapperState, messageId) {
    this.wrapper = TrusteeWrapper.restore(wrapperState, messageId);
    return this.wrapper !== null;
  }
}

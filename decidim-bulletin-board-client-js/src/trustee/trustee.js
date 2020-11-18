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
  async processLogEntry({ logType, signedData }) {
    const payload = await this.parser.parse(signedData);
    return this.wrapper.processMessage(logType, payload);
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
}

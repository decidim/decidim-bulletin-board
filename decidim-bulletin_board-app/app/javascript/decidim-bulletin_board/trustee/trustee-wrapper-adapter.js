/**
 * This is the base class used to support any trustee wrapper of any voting scheme.
 * @abstract
 */
export class TrusteeWrapperAdapter {
  /**
   * Process the message and update the wrapper status.
   *
   * @param {String} messageIdentifier - The parsed identifier of the message.
   * @param {Object} decodedData - An object with the data to process.
   *
   * @returns {Promise<Object|undefined>}
   */
  processMessage(_messageIdentifier, _decodedData) {
    throw new Error("Not implemented.");
  }

  /**
   * Whether the trustee wrapper is in a fresh state or not.
   *
   * @abstract
   * @param {String} messageId - The unique identifier of a message.
   * @returns {boolean}
   */
  isFresh() {
    throw new Error("Not implemented.");
  }

  /**
   * Returns the wrapper state in a string format.
   *
   * @abstract
   * @returns {String}
   */
  backup() {
    throw new Error("Not implemented.");
  }

  /**
   * Restore the trustee state from the given state string.
   *
   * @abstract
   * @param {string} state - As string with the wrapper state retrieved from the backup method.
   * @returns {boolean}
   */
  restore(_state) {
    throw new Error("Not implemented.");
  }

  /**
   * Whether the key ceremony process is done or not.
   *
   * @abstract
   * @returns {Boolean}
   */
  isKeyCeremonyDone() {
    throw new Error("Not implemented.");
  }

  /**
   * Whether the tally process is done or not.
   *
   * @abstract
   * @returns {Boolean}
   */
  isTallyDone() {
    throw new Error("Not implemented.");
  }
}

/**
 * This is the base class used to support any voter wrapper of any voting scheme.
 * @abstract
 */
export class VoterWrapperAdapter {
  /**
   * Setup the voter wrapper.
   *
   * @abstract
   * @returns {Promise<undefined>}
   */
  setup() {
    throw new Error("Not implemented.");
  }

  /**
   * Process the message and update the wrapper status.
   *
   * @param {String} messageType - The message type.
   * @param {Object} decodedData - An object with the data to process.
   *
   * @returns {Promise<Object|undefined>}
   */
  processMessage(_messageType, _decodedData) {
    throw new Error("Not implemented.");
  }

  /**
   * Encrypts the plain vote using the wrapper and returns an object with the
   * encrypted data and the auditable data known as ballot.
   *
   * @param {Object} plainVote - An object with the choosen answers for each question.
   * @param {String} ballotStyle - The ballot style identifier.
   *
   * @private
   * @returns {Promise<Object|undefined>}
   */
  encrypt(_plainVote, _ballotStyle) {
    throw new Error("Not implemented.");
  }
}

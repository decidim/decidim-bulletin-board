/**
 * This is the base class used to support any voter wrapper of any voting scheme.
 * @abstract
 */
export class VoterWrapperAdapter {
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
   * Encrypts the plain vote using the wrapper.
   *
   * @param {Object} plainVote - An object with the choosen answers for each question.
   *
   * @private
   * @returns {Promise<Object|undefined>}
   */
  encrypt(_plainVote) {
    throw new Error("Not implemented.");
  }
}

import { VoterWrapper } from "./voter_wrapper";

/**
 * This is just a dummy implementation of a possible `VoterWrapperAdapter`.
 * It is based on the dummy voting scheme that we are using in the Bulletin Board.
 */
export class VoterWrapperAdapter {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   * - {String} voterId - The unique id of a trustee.
   * - {String} waitTime - The time to wait to simulate the real encryption time.
   * -
   */
  constructor({ voterId, waitTime }) {
    this.voterId = voterId;
    this.wrapper = new VoterWrapper({ voterId, waitTime });
  }

  /**
   * Setup the voter wrapper.
   *
   * @returns {Promise<undefined>}
   */
  setup() {}

  /**
   * Processes the message and updates the wrapper status.
   *
   * @param {String} messageType - The message type.
   * @param {Object} decodedData - An object with the data to process.
   *
   * @returns {Promise<Object|undefined>}
   */
  processMessage(messageType, decodedData) {
    return this.wrapper.processMessage(messageType, decodedData);
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
  encrypt(plainVote, ballotStyle) {
    return this.wrapper.encrypt(plainVote, ballotStyle);
  }
}

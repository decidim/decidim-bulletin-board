import { TrusteeWrapper } from "./trustee_wrapper";

/**
 * This is just a dummy implementation of a possible `TrusteeWrapperAdapter`.
 * It is based on the dummy voting scheme that we are using in the Bulletin Board.
 */
export class TrusteeWrapperAdapter {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   * - {String} trusteeId - The unique id of a trustee.
   */
  constructor({ trusteeId }) {
    this.trusteeId = trusteeId;
    this.wrapper = new TrusteeWrapper({ trusteeId });
  }

  /**
   * Setup the trustee wrapper.
   *
   * @returns {Promise<undefined>}
   */
  setup() {}

  /**
   * Process the message and update the wrapper status.
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
   * Whether the trustee wrapper is in a fresh state or no.
   *
   * @returns {Promise<Boolean>}
   */
  isFresh() {
    return this.wrapper.isFresh();
  }

  /**
   * Returns the wrapper state in a string format.
   *
   * @returns {Promise<String>}
   */
  backup() {
    return this.wrapper.backup();
  }

  /**
   * Restore the trustee state from the given state string.
   *
   * @param {string} state - As string with the wrapper state retrieved from the backup method.
   * @returns {Promise<Boolean>}
   */
  restore(state) {
    return this.wrapper.restore(state);
  }

  /**
   * Whether the key ceremony process is done or not.
   * @returns {Promise<Boolean>}
   */
  isKeyCeremonyDone() {
    return this.wrapper.isKeyCeremonyDone();
  }

  /**
   * Whether the tally process is done or not.
   * @returns {Promise<Boolean>}
   */
  isTallyDone() {
    return this.wrapper.isTallyDone();
  }
}

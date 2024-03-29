import { WrapperAdapter } from "./wrapper_adapter";

/**
 * This implements the Electionguard Trustee Wrapper Adapter using a web worker
 * that executes python code compiled through `pyodide`.
 * @extends WrapperAdapter
 */
export class TrusteeWrapperAdapter extends WrapperAdapter {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   * - {String} trusteeId - The unique id of a trustee.
   */
  constructor({ trusteeId, workerUrl }) {
    super();

    this.trusteeId = trusteeId;
    this.worker = new Worker(workerUrl);
  }

  /**
   * Setup the trustee wrapper.
   *
   * @returns {Promise<undefined>}
   */
  async setup() {
    return await this.processPythonCodeOnWorker(
      `
        from js import trustee_id
        from bulletin_board.electionguard.trustee import Trustee
        trustee = Trustee(trustee_id)
      `,
      {
        trustee_id: this.trusteeId,
      },
    );
  }

  /**
   * Process the message and update the wrapper status.
   *
   * @param {String} messageType - The message type.
   * @param {Object} decodedData - An object with the data to process.
   *
   * @returns {Promise<Object|undefined>}
   */
  async processMessage(messageType, decodedData) {
    const result = await this.processPythonCodeOnWorker(
      `
      from js import message_type, decoded_data
      import json
      trustee.process_message(
        message_type,
        json.loads(decoded_data)
      )
    `,
      {
        message_type: messageType,
        decoded_data: JSON.stringify(decodedData),
      },
    );

    if (result && result.length > 0) {
      // Pyodide 0.17 return a Map instead of a object when python is a dict
      // eslint-disable-next-line camelcase
      const { message_type, content } =
        result[0] instanceof Map ? Object.fromEntries(result[0]) : result[0];
      return {
        messageType: message_type,
        content: content,
      };
    }
  }

  /**
   * Whether the trustee wrapper is in a fresh state or no.
   *
   * @returns {Promise<Boolean>}
   */
  isFresh() {
    return this.processPythonCodeOnWorker(
      `
      trustee.is_fresh()
    `,
    );
  }

  /**
   * Returns the wrapper state in a string format.
   *
   * @returns {Promise<String>}
   */
  backup() {
    return this.processPythonCodeOnWorker(
      `
      trustee.backup().hex()
    `,
    );
  }

  /**
   * Restore the trustee state from the given state string.
   *
   * @param {string} state - As string with the wrapper state retrieved from the backup method.
   * @returns {Promise<Boolean>}
   */
  restore(state) {
    return this.processPythonCodeOnWorker(
      `
      from js import state
      trustee = Trustee.restore(bytes.fromhex(state))
      True
    `,
      {
        state,
      },
    );
  }

  /**
   * Whether the key ceremony process is done or not.
   *
   * @returns {Promise<Boolean>}
   */
  isKeyCeremonyDone() {
    return this.processPythonCodeOnWorker(
      `
      trustee.is_key_ceremony_done()
    `,
    );
  }

  /**
   * Whether the tally process is done or not.
   *
   * @returns {Promise<Boolean>}
   */
  isTallyDone() {
    return this.processPythonCodeOnWorker(
      `
      trustee.is_tally_done()
    `,
    );
  }
}

/**
 * This implements the Electionguard Trustee Wrapper Adapter using a web worker
 * that executes python code compiled through `pyodide`.
 */
export class TrusteeWrapperAdapter {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   * - {String} trusteeId - The unique id of a trustee.
   */
  constructor({ trusteeId, workerUrl }) {
    this.trusteeId = trusteeId;
    this.worker = new Worker(workerUrl);

    this.worker.postMessage({
      python: `
        from js import trustee_id
        from decidim.electionguard.trustee import Trustee
        trustee = Trustee(trustee_id)
      `,
      trustee_id: this.trusteeId,
    });
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
    console.log(messageType);

    const result = await this.processPythonCodeOnWorker(
      `
      import json
      from js import message_type, decoded_data
      trustee.process_message(message_type, json.loads(decoded_data))
    `,
      {
        message_type: messageType,
        decoded_data: JSON.stringify(decodedData),
      }
    );

    if (result) {
      // eslint-disable-next-line camelcase
      const { message_type, content } = result;
      return {
        messageType: message_type,
        content,
      };
    }

    return result;
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
    `
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
      trustee.backup()
    `
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

      trustee.restore(state)
    `,
      {
        state,
      }
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
    `
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
    `
    );
  }

  /**
   * Runs an arbitrary python code in the web worker.
   *
   * @param {String} pythonCode - A string representing valid python code.
   * @param {Object} pythonData - An Object which values can be referenced from
   *                              the python code using the js module.
   * @private
   * @returns {Promise<Object>}
   */
  processPythonCodeOnWorker(pythonCode, pythonData) {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (event) => {
        resolve(event.data.results);
      };

      this.worker.onerror = (error) => {
        reject(error);
      };

      this.worker.postMessage({
        python: pythonCode,
        ...pythonData,
      });
    });
  }
}

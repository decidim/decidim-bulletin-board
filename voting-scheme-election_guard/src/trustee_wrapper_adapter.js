/**
 * This is just a dummy implementation of a possible `TrusteeWrapper`.
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
  constructor({ trusteeId, workerUrl }) {
    this.trusteeId = trusteeId;
    this.worker = new Worker(workerUrl);

    // TODO: should we wait for this?
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
   * @returns {boolean}
   */
  isFresh() {
    throw new Error("not implemented");
  }

  /**
   * Returns the wrapper state in a string format.
   *
   * @returns {String}
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
   * @returns {boolean}
   */
  restore(state) {
    return this.wrapper.restore(state);
  }

  /**
   * Whether the key ceremony process is done or not.
   * @returns {Boolean}
   */
  isKeyCeremonyDone() {
    return this.wrapper.isKeyCeremonyDone();
  }

  /**
   * Whether the tally process is done or not.
   * @returns {Boolean}
   */
  isTallyDone() {
    return this.wrapper.isTallyDone();
  }

  /**
   * TODO
   * @private
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

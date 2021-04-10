/**
 * Common class used by any ElectionGuard adapter to run python code through web workers.
 */
export class WrapperAdapter {
  /**
   * Runs arbitrary python code
   *
   * @param {String} pythonCode - A string representing valid python code.
   * @param {Object} pythonData - An Object which values can be referenced from
   *                              the python code using the js module.
   * @private
   * @returns {Promise<Object>}
   */
  async processPythonCode(pythonCode, pythonData) {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (event) => {
        resolve(event.data.results);
      };

      this.worker.onerror = (error) => {
        console.error(error);
        reject(error);
      };

      this.worker.postMessage({
        python: pythonCode,
        ...pythonData,
      });
    });
  }
}

/**
 * Common class used by any ElectionGuard adapter to run python code through web workers.
 */
export class WrapperAdapter {
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

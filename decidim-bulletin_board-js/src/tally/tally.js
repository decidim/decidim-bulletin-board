/**
 * TODO
 * Handles all the key ceremony steps for a specific election and trustee.
 */
export class Tally {
  /**
   * TODO
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   *  - {Client} bulletinBoardClient - An instance of the Bulletin Board Client
   */
  constructor({ bulletinBoardClient, election, trustee }) {
    this.bulletinBoardClient = bulletinBoardClient;
    this.election = election;
    this.trustee = trustee;
  }

  /**
   * Performs some operations to setup the tally.
   *
   * Initializes a subscription to store new log entries for the given election.
   *
   * @returns {Promise<undefined>}
   */
  setup() {
    return this.election.subscribeToLogEntriesChanges();
  }

  /**
   * TODO
   * Starts or continues with the key ceremony.
   *
   * @param {string} wrapperState - As string with the wrapper state retrieved from the backup method.
   * @returns {Promise<Object>}
   */
  async run() {
    if (this.trustee.needsToBeRestored()) {
      throw new Error("You need to restore the wrapper state to continue");
    }

    // TODO: real behavior

    this.tearDown();
  }

  /**
   * TODO
   */
  tearDown() {
    this.election.unsubscribeToLogEntriesChanges();
  }
}

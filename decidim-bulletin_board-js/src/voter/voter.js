import { VoterWrapper } from "./voter_wrapper_dummy";

export const WAIT_TIME_MS = 1_000; // 1s

/**
 * This is a facade class that will use the correspondig `VoterWrapper` to encrypt
 * the vote.
 */
export class Voter {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   *  - {String} id - The voter identifier.
   */
  constructor({ id, bulletinBoardClient, electionContext, options }) {
    this.id = id;
    this.wrapper = new VoterWrapper({ voterId: id });
    this.bulletinBoardClient = bulletinBoardClient;
    this.electionContext = electionContext;
    this.options = options || { bulletinBoardWaitTime: WAIT_TIME_MS };
  }

  /**
   * Encrypts the data using the wrapper.
   *
   * @param {Object} data - The data to be.
   * @returns {Object} - The data encrypted.
   */
  async encrypt(data) {
    return this.wrapper.encrypt(data);
  }

  /**
   * Confirms if a vote was processed
   *
   * @param {Object} params - An object that includes the following options.
   *  - {String} messageId - The messageId
   * @returns {Promise<Object>} - Returns the PendingMessage
   */
  waitForPendingMessageToBeProcessed(messageId) {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        this.bulletinBoardClient
        .getPendingMessageByMessageId({
          messageId
        })
        .then((pendingMessage) => {
          if (pendingMessage.status !== 'enqueued') {
            clearInterval(intervalId);
            resolve(pendingMessage);
          }
        })
      }, this.options.bulletinBoardWaitTime)
    })
  }

  /**
   * Verifies a vote
   *
   * @param {Object} params - An object that includes the following options.
   *  - {String} voteHash - the voteHash of a vote
   * @returns {Promise<Object>} - Returns a logEntry
   */
  verifyVote(voteHash) {
    const { id: electionUniqueId } = this.electionContext;
 
    return this.bulletinBoardClient
      .getLogEntry({
        electionUniqueId,
        contentHash: voteHash,
      })
  }
}

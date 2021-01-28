import { VoterWrapper } from "./voter_wrapper_dummy";
import { JWTParser } from "../jwt_parser";

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
  constructor({ id, electionContext, bulletinBoardClient, options }) {
    this.id = id;
    this.electionContext = electionContext;
    this.bulletinBoardClient = bulletinBoardClient;
    this.wrapper = new VoterWrapper({ voterId: id });
    this.parser = new JWTParser();
    this.options = options || { bulletinBoardWaitTime: WAIT_TIME_MS };
  }

  /**
   * Performs some operations to setup the voter.
   *
   * Retrieves the key ceremony messages needed to cast a vote in the given election.
   *
   * @returns {Promise<undefined>}
   */
  setup() {
    return this.bulletinBoardClient
      .getElectionLogEntries({
        electionUniqueId: this.electionContext.id,
      })
      .then(async (logEntries) => {
        for (const logEntry of logEntries) {
          const message = await this.parser.parse(logEntry.signedData);
          this.wrapper.processMessage(logEntry.messageId, message);
        }
      });
  }

  /**
   * Encrypts the data using the wrapper.
   *
   * @param {Object} data - The data to be.
   * @returns {Object} - The data encrypted.
   */
  async encrypt(data) {
    return await this.wrapper.encrypt(data);
  }

  /**
   * Confirms if a vote was processed
   *
   * @param {Object} messageId - An object that includes the following options.
   *  - {String} messageId - the unique identifier of a message
   * @returns {Promise<Object>} - Returns the PendingMessage
   */
  waitForPendingMessageToBeProcessed(messageId) {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        this.bulletinBoardClient
          .getPendingMessageByMessageId({
            messageId,
          })
          .then((pendingMessage) => {
            if (pendingMessage.status !== "enqueued") {
              clearInterval(intervalId);
              resolve(pendingMessage);
            }
          });
      }, this.options.bulletinBoardWaitTime);
    });
  }

  /**
   * Verifies a vote
   *
   * @param {String} contentHash - An object that includes the following options.
   *  - {String} contentHash - the contentHash of a vote
   * @returns {Promise<Object>} - Returns a logEntry
   */
  verifyVote(contentHash) {
    const { id: electionUniqueId } = this.electionContext;

    return this.bulletinBoardClient.getLogEntry({
      electionUniqueId,
      contentHash,
    });
  }
}

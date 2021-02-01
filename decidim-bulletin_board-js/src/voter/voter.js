import { VoterWrapper } from "./voter_wrapper_dummy";
import { JWTParser } from "../jwt_parser";

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
  constructor({ id, electionContext, bulletinBoardClient }) {
    this.id = id;
    this.electionContext = electionContext;
    this.bulletinBoardClient = bulletinBoardClient;
    this.wrapper = new VoterWrapper({ voterId: id });
    this.parser = new JWTParser();
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
  encrypt(data) {
    return this.wrapper.encrypt(data);
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

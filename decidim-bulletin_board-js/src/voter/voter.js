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
   *  - {String} uniqueId - The voter identifier.
   *  - {Object} election - An object that interacts with a specific election
   *                        to get some data and perform the vote.
   *  - {Client} bulletinBoardClient - An instance of the Bulletin Board Client
   */
  constructor({ uniqueId, election, bulletinBoardClient }) {
    this.uniqueId = uniqueId;
    this.election = election;
    this.bulletinBoardClient = bulletinBoardClient;
    this.wrapper = new VoterWrapper({ voterId: uniqueId });
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
        electionUniqueId: this.election.uniqueId,
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
   * @param {Object} data - The data to be encrypted.
   * @returns {Promise<Object>} - The data encrypted and its hash.
   */
  async encrypt(data) {
    const encryptedVote = await this.wrapper.encrypt(data);

    return window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(encryptedVote))
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        return {
          encryptedVote,
          encryptedVoteHash: hashHex,
        };
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
    const { uniqueId: electionUniqueId } = this.election;

    return this.bulletinBoardClient.getLogEntry({
      electionUniqueId,
      contentHash,
    });
  }
}

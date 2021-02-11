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
        types: ["create_election", "end_key_ceremony"],
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
   * @returns {Promise<Object>} - The data encrypted.
   */
  async encrypt(data) {
    const ballot = this.wrapper.encrypt(data);
    return ballot;
  }

  /**
   * Encrypts the data using the wrapper.
   *
   * @param {Object} encryptedVote - The encryptedVote to be encrypted.
   * @returns {Promise<Object>} - The data encrypted and its hash.
   */
  async encryptBallot(encryptedVote) {
    const encryptedBallot = encryptedVote.encryptedBallot;
    return window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(encryptedBallot))
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const encryptedBallotHash = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        return {
          encryptedBallot,
          encryptedBallotHash,
        };
      });
  }

  /**
   * Audits the data using the wrapper.
   *
   * @param {Object} encryptedVote - The encrypted vote to be audited.
   * @returns {Promise<Object>} - The encrypted ballot, the vote hash and the plain vote.
   */
  async auditBallot(encryptedVote) {
    const auditableBallot = encryptedVote.auditableBallot;
    const ballot = await this.encryptBallot(encryptedVote);
    const encryptedBallot = ballot.encryptedBallot;
    const encryptedBallotHash = ballot.encryptedBallotHash;

    return {
      encryptedBallot,
      encryptedBallotHash,
      plainVote: auditableBallot,
    };
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

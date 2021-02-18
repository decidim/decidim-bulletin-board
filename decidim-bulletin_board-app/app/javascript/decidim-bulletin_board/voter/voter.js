import { MessageParser } from "../client/message-parser";

/**
 * This is a facade class that will use the corresponding `VoterWrapper` to encrypt
 * the vote.
 */
export class Voter {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   *  - {Client} bulletinBoardClient - An instance of the Bulletin Board Client.
   *  - {String} authorityPublicKeyJSON - The authority identification public key.
   *  - {Object} election - An object that interacts with a specific election
   *                        to get some data and perform the vote.
   *  - {String} uniqueId - The voter identifier.
   *  - {Object} wrapperAdapter - An object to interact with the voter wrapper.
   */
  constructor({
    bulletinBoardClient,
    authorityPublicKeyJSON,
    election,
    uniqueId,
    wrapperAdapter,
  }) {
    this.uniqueId = uniqueId;
    this.election = election;
    this.bulletinBoardClient = bulletinBoardClient;
    this.wrapperAdapter = wrapperAdapter;
    this.parser = new MessageParser({ authorityPublicKeyJSON });
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
          const { messageIdentifier, decodedData } = await this.parser.parse(
            logEntry
          );

          await this.wrapperAdapter.processMessage(
            messageIdentifier.typeSubtype,
            decodedData
          );
        }
      });
  }

  /**
   * Encrypts the data using the wrapper.
   *
   * @param {Object} plainVote - An object with the choosen answers for each question.
   *
   * @returns {Promise<Object>} - The data encrypted.
   */
  encrypt(plainVote) {
    const ballot = this.wrapperAdapter.encrypt(plainVote);
    const ballotHash = this.generateBallotHash(ballot);

    return {
      ballot,
      ballotHash,
    };
  }

  /**
   * Generates the ballot hash from the excrpyted vote
   *
   * @param {Object} encryptedVote - The encryptedVote to be encrypted.
   * @returns {Promise<Object>} - The data encrypted and its hashThe ballot hash.
   */
  async generateBallotHash(encryptedVote) {
    const encryptedBallot = encryptedVote.encryptedBallot;
    return window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(encryptedBallot))
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const encryptedBallotHash = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        return encryptedBallotHash;
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

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
  async setup() {
    await this.wrapperAdapter.setup();
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
   * @param {String} ballotStyle - The ballot style identifier.
   *
   * @returns {Promise<Object>} - The ballot.
   */
  async encrypt(plainVote, ballotStyle) {
    const { encryptedData, auditableData } = await this.wrapperAdapter.encrypt(
      plainVote,
      ballotStyle
    );
    const encryptedDataHash = await this.hash(encryptedData);

    return {
      encryptedData,
      encryptedDataHash,
      auditableData,
      plainVote,
      electionUniqueId: this.election.uniqueId,
    };
  }

  /**
   * Generates the hash from the given data.
   *
   * @private
   * @param {Object} data - The data to be digested.
   * @returns {Promise<Object>} - The hash value.
   */
  async hash(data) {
    return window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(data))
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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

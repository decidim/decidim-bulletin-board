import { WrapperAdapter } from "./wrapper_adapter";

/**
 * This implements the Electionguard Voter Wrapper Adapter using a web worker
 * that executes python code compiled through `pyodide`.
 * @extends WrapperAdapter
 */
export class VoterWrapperAdapter extends WrapperAdapter {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   * - {String} voterId - The unique id of a voter.
   */
  constructor({ voterId, workerUrl }) {
    super();

    this.voterId = voterId;
    this.worker = new Worker(workerUrl);
  }

  /**
   * Setup the voter wrapper.
   *
   * @returns {Promise<undefined>}
   */
  setup() {
    return this.processPythonCodeOnWorker(
      `
        from js import voter_id
        from bulletin_board.electionguard.voter import Voter
        voter = Voter(voter_id)
      `,
      {
        voter_id: this.voterId,
      }
    );
  }

  /**
   * Process the message and update the wrapper status.
   *
   * @param {String} messageType - The message type.
   * @param {Object} decodedData - An object with the data to process.
   *
   * @returns {Promise<Object|undefined>}
   */
  async processMessage(messageType, decodedData) {
    const result = await this.processPythonCodeOnWorker(
      `
      import json
      from js import message_type, decoded_data
      voter.process_message(message_type, json.loads(decoded_data))
    `,
      {
        message_type: messageType,
        decoded_data: JSON.stringify(decodedData),
      }
    );

    if (result && result[0]) {
      // eslint-disable-next-line camelcase
      const { message_type, content } = result[0];
      return {
        messageType: message_type,
        content,
      };
    }
  }

  /**
   * Encrypts the plain vote using the wrapper and returns an object with the
   * encrypted data and the auditable data known as ballot.
   *
   * @param {Object} plainVote - An object with the choosen answers for each question.
   * @param {String} ballotStyle - The ballot style identifier.
   *
   * @private
   * @returns {Promise<Object|undefined>}
   */
  async encrypt(plainVote, ballotStyle) {
    const [auditableData, encryptedData] = await this.processPythonCodeOnWorker(
      `
      from js import plain_vote, ballot_style
      voter.encrypt(plain_vote, ballot_style)
    `,
      {
        plain_vote: plainVote,
        ballot_style: ballotStyle,
      }
    );

    return { auditableData, encryptedData };
  }
}

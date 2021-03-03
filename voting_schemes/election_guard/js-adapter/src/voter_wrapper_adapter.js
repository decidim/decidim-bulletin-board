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
        from decidim.electionguard.voter import Voter
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

    if (result) {
      // eslint-disable-next-line camelcase
      const { message_type, content } = result;
      return {
        messageType: message_type,
        content,
      };
    }

    return result;
  }

  /**
   * Encrypts the plain vote using the wrapper and returns an object with the
   * encrypted data and the auditable data known as ballot.
   *
   * @param {Object} plainVote - An object with the choosen answers for each question.
   *
   * @private
   * @returns {Promise<Object|undefined>}
   */
  async encrypt(plainVote) {
    const encryptedData = await this.processPythonCodeOnWorker(
      `
      from js import plain_vote
      voter.encrypt(plain_vote)
    `,
      {
        plain_vote: plainVote,
      }
    );

    // TODO: Wrapper doesn't return the `auditableData` at the moment.
    return { auditableData: null, encryptedData };
  }
}

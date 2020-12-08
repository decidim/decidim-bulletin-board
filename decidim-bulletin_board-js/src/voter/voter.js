import { VoterWrapper } from "./voter_wrapper_dummy";

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
  constructor({ id }) {
    this.id = id;
    this.wrapper = new VoterWrapper({ voterId: id });
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
}

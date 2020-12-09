/**
 * This is just a dummy implementation of a possible `VoterWrapper`.
 * It is based on the dummy voting schema that we are using in the Bulletin Board.
 */
export class VoterWrapper {
  constructor({ voterId }) {
    this.voterId = voterId;
  }

  encrypt(data) {
    return JSON.stringify(data);
  }
}

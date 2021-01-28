/**
 * This is just a dummy implementation of a possible `VoterWrapper`.
 * It is based on the dummy voting schema that we are using in the Bulletin Board.
 */

export const WAIT_TIME_MS = 500; // 0.5s

export class VoterWrapper {
  constructor({ voterId }) {
    this.voterId = voterId;
  }

  encrypt(data) {
    return new Promise((resolve) =>
      setTimeout(resolve, WAIT_TIME_MS)
    ).then(() => JSON.stringify(data));
  }
}

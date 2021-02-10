import { MessageIdentifier } from "../client/message-identifier";

export const CREATE_ELECTION = "create_election";
export const END_KEY_CEREMONY = "end_key_ceremony";

/**
 * This is just a dummy implementation of a possible `VoterWrapper`.
 * It is based on the dummy voting schema that we are using in the Bulletin Board.
 */

export const WAIT_TIME_MS = 500; // 0.5s

export class VoterWrapper {
  constructor({ voterId }) {
    this.voterId = voterId;
    this.jointElectionKey = null;
    this.contests = {};
  }

  /**
   * Process the message and update the wrapper status.
   *
   * @param {String} messageId - The identifier of the message.
   * @param {Object} message - An object with the message to process.
   *
   * @returns {undefined}
   */
  processMessage(messageId, message) {
    const messageIdentifier = MessageIdentifier.parse(messageId);
    switch (messageIdentifier.type) {
      case CREATE_ELECTION: {
        this.contests = message.description.contests;
        break;
      }
      case END_KEY_CEREMONY: {
        const content = JSON.parse(message.content);
        this.jointElectionKey = content.joint_election_key;
        break;
      }
    }
  }

  /**
   * Converts the given vote into an auditable ballot and an encrypted Ballot. As the process is very fast,
   * it simulates the delay of the encryption process.
   *
   * @param {Object} vote - An object with the choosen answers for each question.
   *
   * @private
   * @returns {Promise<Object|undefined>}
   */
  async encrypt(vote) {
    return new Promise((resolve) => setTimeout(resolve, WAIT_TIME_MS)).then(
      () => {
        if (!this.jointElectionKey) {
          console.warn("Invalid election status.");
          return;
        }

        const auditableBallot = this.createAuditableBallot(vote);
        const castableBallot = JSON.parse(JSON.stringify(auditableBallot));
        const encryptedBallot = JSON.stringify(
          this.createEncryptedBallot(castableBallot)
        );

        return { auditableBallot, encryptedBallot };
      }
    );
  }

  /**
   * Encrypts the given vote into an object with the format expected by the Dummy voting scheme,
   * using the silly encryption defined by the scheme for each answer ((1|0) + random * jointElectionKey).
   * Returns the auditable vote.
   *
   * @param {Object} vote - An object with the choosen answers for each question.
   *
   * @private
   * @returns {<Object>}
   */
  createAuditableBallot(vote) {
    /* eslint-disable camelcase */
    return {
      ballot_style: "ballot-style",
      contests: this.contests.map(({ object_id, ballot_selections }) => {
        return {
          object_id,
          ballot_selections: ballot_selections.map((ballotSelection) => {
            const random = Math.random();
            const plaintext =
              vote[object_id] &&
              vote[object_id].includes(ballotSelection.object_id)
                ? 1
                : 0;

            return {
              object_id: ballotSelection.object_id,
              ciphertext:
                plaintext + Math.floor(random * 500) * this.jointElectionKey,
              random,
              plaintext,
            };
          }),
        };
      }),
    };
    /* eslint-enable camelcase */
  }

  /**
   * Creates an encrypted ballot.
   *
   * @param {Object} auditableBallot - An object with the encrypted vote.
   *
   * @private
   * @returns {<Object>}
   */
  createEncryptedBallot(vote) {
    // const auditBallot = this.createAuditableBallot(vote);
    const encryptedBallot = this.removeAuditInformation(vote);
    return encryptedBallot;
  }

  /**
   * Removes the 'random' and 'plaintext' fields from the auditable ballot.
   *
   * @param {Object} ballot - An auditable ballot.
   *
   * @private
   * @returns {<Object>}
   */
  removeAuditInformation(ballot) {
    /* eslint-disable camelcase */
    ballot.contests.map((contest) => {
      return contest.ballot_selections.map((ballot_selection) => {
        delete ballot_selection.random;
        delete ballot_selection.plaintext;

        return ballot_selection;
      });
    });

    return ballot;
    /* eslint-enable camelcase */
  }
}

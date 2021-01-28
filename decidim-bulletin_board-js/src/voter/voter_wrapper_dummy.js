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
   * @returns {Object|undefined}
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

  async encrypt(vote) {
    return new Promise((resolve) => setTimeout(resolve, WAIT_TIME_MS)).then(() => {
      if (!this.jointElectionKey) {
        console.warn("Invalid election status.");
        return;
      }

      const ballot = JSON.stringify(this.createBallot(vote));
    });
  }

  createBallot(vote) {
    const ballot = { ballot_style: "ballot-style", contests: [] };
    for (const contestDescription of this.contests) {
      const contest = {
        object_id: contestDescription.object_id,
        ballot_selections: [],
      };
      for (const ballotSelection of contestDescription.ballot_selections) {
        const voted =
          ballotSelection.object_id in vote[contestDescription.object_id]
            ? 1
            : 0;
        contest.ballot_selections.push({
          object_id: ballotSelection.object_id,
          ciphertext:
            voted + Math.floor(Math.random() * 500) * this.jointElectionKey,
        });
      }
      ballot.contests.push(contest);
    }

    return ballot;
  }
}

import { Client } from "../client/client";
import { Election } from "../election/election";
import { Voter } from "../voter/voter";

/**
 * This class is used to bind any UI elements to a vote process.
 */
export class VoteComponent {
  /**
   * Initialises the class with the given params.
   * @param {Object} params - An object that contains the initialization params.
   *  - {Object} bulletinBoardClientParams - An object to configure the bulletin board client.
   *  - {String} authorityPublicKeyJSON - The authority identification public key.
   *  - {String} electionUniqueId - The unique identifier of an election.
   *  - {String} voterUniqueId - The unique identifier of a voter.
   *  - {Object} voterWrapperAdapter - An object to interact with the voter wrapper.
   * @constructor
   */
  constructor({
    bulletinBoardClientParams,
    authorityPublicKeyJSON,
    electionUniqueId,
    voterUniqueId,
    voterWrapperAdapter,
  }) {
    this.bulletinBoardClient = new Client(bulletinBoardClientParams);

    const election = new Election({
      uniqueId: electionUniqueId,
      bulletinBoardClient: this.bulletinBoardClient,
    });

    this.voter = new Voter({
      bulletinBoardClient: this.bulletinBoardClient,
      authorityPublicKeyJSON,
      election,
      uniqueId: voterUniqueId,
      wrapperAdapter: voterWrapperAdapter,
    });
  }

  /**
   * Bind UI events to the vote process.
   *
   * @method bindEvents
   * @param {Object} eventCallbacks - An object that contains event callback functions.
   * - {Function} onBindEncryptButton - a function that receives a callback function that will be called when encrypting the vote must be started
   * - {Function} onVoteEncryption - a function that is called when the vote gets encrypted
   * - {Function} castOrAuditBallot - a function that is called to cast or audit a ballot
   * - {Function} onStart - a function that is called when the vote has started.
   * - {Function} onBindAuditBallotButton - a function that called when the ballot should get audited
   * - {Function} onBindCastBallotButton - a function that called when the ballot should get casted
   * - {Function} onAuditBallot - a function that is called to audit a vote before encrypting it.
   * - {Function} onAuditComplete - a function that is called when the auditable vote is audited.
   * - {Function} onCastBallot - a function that is called to cast the ballot.
   * - {Function} onCastComplete - a function that is called when the vote is casted.
   * - {Function} onInvalid - a function that is called when the vote is not valid.
   *
   * @returns {Promise<undefined>}
   */
  async bindEvents({
    onBindEncryptButton,
    onStart,
    onVoteEncryption,
    castOrAuditBallot,
    onBindAuditBallotButton,
    onBindCastBallotButton,
    onAuditBallot,
    onCastBallot,
    onAuditComplete,
    onCastComplete,
    onInvalid,
  }) {
    const onSetupDone = this.voter.setup();

    onBindEncryptButton(async () => {
      onStart();
      await onSetupDone;
      onVoteEncryption(
        (plainVote, ballotStyle) => {
          this.voter.encrypt(plainVote, ballotStyle).then((ballot) => {
            castOrAuditBallot(ballot);
            onBindAuditBallotButton(() => {
              onAuditBallot(
                ballot,
                `${this.voter.uniqueId}-election-${this.voter.election.uniqueId}.txt`
              );
              onAuditComplete();
            });

            onBindCastBallotButton(async () => {
              try {
                const result = await onCastBallot(ballot);
                onCastComplete(result);
              } catch {
                onInvalid();
              }
            });
          });
        },
        () => {
          onInvalid();
        }
      );
    });
  }
}

/**
 *
 * @param {Object} ballotData - the ballot data parsed from the file.
 * @returns {Object} - an Object that contains the necessary info to check the vote encryption.
 */
export const transform = (ballotData) => {
  const { auditableData } = ballotData;
  const {
    plaintext_ballot,
    ciphered_ballot: expectedCipheredBallot,
  } = auditableData;
  const {
    contests,
    style_id: ballotStyle,
    object_id: voterId,
  } = plaintext_ballot;
  const { nonce } = expectedCipheredBallot;

  // TODO: this will not be necessary when the auditable data contains the plain vote.
  const plainVote = contests.reduce((acc, { object_id, ballot_selections }) => {
    acc[object_id] = ballot_selections
      .filter(({ vote }) => vote === 1)
      .map(({ object_id }) => object_id);
    return acc;
  }, {});

  return { expectedCipheredBallot, voterId, plainVote, ballotStyle, nonce };
};

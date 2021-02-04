// = require decidim/bulletin_board/decidim-bulletin_board
// = require jquery

$(async () => {
  const { VoteComponent } = window.decidimBulletinBoard;

  // UI Elements
  const $voter = $(".voter");
  const $castVote = $voter.find("button");
  const $vote = $voter.find("textarea");
  const $voterId = $voter.find("input");
  const $doneMessage = $voter.find(".done-message");

  $vote.on("change", (event) => {
    $vote.css("border", "");
  });

  // Data
  const bulletinBoardClientParams = {
    apiEndpointUrl: $voter.data("apiEndpointUrl"),
  };
  const electionUniqueId = $voter.data("electionUniqueId");
  const voterUniqueId = $voterId.val();

  // Use the voter component and bind all UI events
  const component = new VoteComponent({
    bulletinBoardClientParams,
    electionUniqueId,
    voterUniqueId,
  });

  await component.bindEvents({
    onSetup() {
      $castVote.removeAttr("disabled");
    },
    onBindStartButton(onEventTriggered) {
      $castVote.on("click", onEventTriggered);
    },
    onStart() {},
    onVoteValidation(validVoteFn, invalidVoteFn) {
      $vote.css("background", "");
      $doneMessage.hide();
      try {
        const vote = JSON.parse($vote.val());
        if (!vote) {
          invalidVoteFn();
        }
        validVoteFn(vote);
      } catch (_error) {
        invalidVoteFn();
      }
    },
    onVoteEncrypted({ encryptedVote }) {
      return $.ajax({
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          voter_id: $voterId.val(),
          encrypted_vote: encryptedVote,
        }), // eslint-disable-line camelcase
        headers: {
          "X-CSRF-Token": $("meta[name=csrf-token]").attr("content"),
        },
      });
    },
    onComplete() {
      $doneMessage.show();
      $vote.css("background", "green");
    },
    onInvalid() {
      $vote.css("border", "1px solid red");
    },
  });
});

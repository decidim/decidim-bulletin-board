// = require decidim/bulletin_board/decidim-bulletin_board.dev
// = require jquery

$(async () => {
  const { Client, Voter } = window.decidimBulletinBoard;

  const $voter = $(".voter");

  const bulletinBoardClient = new Client({
    apiEndpointUrl: "http://localhost:8000/api",
  });

  const $castVote = $voter.find("button");
  const $vote = $voter.find("textarea");
  const $voterId = $voter.find("input");

  $vote.on("change", (event) => {
    $vote.css("border", "");
  });

  $castVote.on("click", async (event) => {
    $vote.css("background", "");

    const voter = new Voter({
      id: $voterId.val(),
      bulletinBoardClient,
      electionContext: {
        id: $voter.data("electionUniqueId"),
      },
    });
    window.voter = voter;

    await voter.setup();

    const vote = JSON.parse($vote.val());
    if (!vote) {
      $vote.css("border", "1px solid red");
      return;
    }

    voter
      .encrypt(vote)
      .then(async (encryptedVote) => {
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
      })
      .then(() => {
        $vote.css("background", "green");
      });
  });
});

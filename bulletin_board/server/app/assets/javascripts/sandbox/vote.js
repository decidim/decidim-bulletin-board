//= require jquery

//= require decidim/bulletin_board/decidim-bulletin_board
//= require voting_schemes/dummy/dummy
//= require voting_schemes/electionguard/electionguard

$(() => {
  const { VoteComponent } = window.decidimBulletinBoard;
  const {
    VoterWrapperAdapter: DummyVoterWrapperAdapter,
  } = window.dummyVotingScheme;
  const {
    VoterWrapperAdapter: ElectionGuardVoterWrapperAdapter,
  } = window.electionGuardVotingScheme;

  // UI Elements
  const $voter = $(".voter");
  const $encryptVote = $voter.find(".encrypt-vote");
  const $castVote = $voter.find(".cast-vote");
  const $auditVote = $voter.find(".audit-vote");
  const $vote = $voter.find("textarea");
  const $voterId = $voter.find("input");
  const $doneMessage = $voter.find(".done-message");
  const $auditMessage = $voter.find(".audit-done-message");
  const $ballotHash = $voter.find(".ballot-hash");
  const $benchmark = $voter.find(".benchmark");

  $vote.on("change", (event) => {
    $vote.css("border", "");
  });

  // Data
  const bulletinBoardClientParams = {
    apiEndpointUrl: $voter.data("apiEndpointUrl"),
  };
  const electionUniqueId = $voter.data("electionUniqueId");
  const authorityPublicKeyJSON = $voter.data("authorityPublicKey");
  const votingSchemeName = $voter.data("votingSchemeName");
  const voterUniqueId = $voterId.val();

  // Use the correct voter wrapper adapter
  let voterWrapperAdapter;
  let encryptStart;

  if (votingSchemeName === "dummy") {
    voterWrapperAdapter = new DummyVoterWrapperAdapter({
      voterId: voterUniqueId,
      waitTime: 100,
    });
  } else if (votingSchemeName === "electionguard") {
    voterWrapperAdapter = new ElectionGuardVoterWrapperAdapter({
      voterId: voterUniqueId,
      workerUrl: "/assets/electionguard/webworker.js",
    });
  } else {
    throw new Error(`Voting scheme ${votingSchemeName} not supported.`);
  }

  // Use the voter component and bind all UI events
  const component = new VoteComponent({
    bulletinBoardClientParams,
    authorityPublicKeyJSON,
    electionUniqueId,
    voterUniqueId,
    voterWrapperAdapter,
  });

  component.bindEvents({
    onBindEncryptButton(onEventTriggered) {
      $encryptVote.on("click", onEventTriggered);
    },
    onStart() {
      $vote.css("background", "");
      $auditMessage.hide();
      $doneMessage.hide();
      $encryptVote.prop("disabled", true);
    },
    onVoteEncryption(validVoteFn, invalidVoteFn) {
      try {
        const vote = JSON.parse($vote.val());
        if (!vote) {
          invalidVoteFn();
        }
        encryptStart = new Date();
        validVoteFn(vote);
      } catch (_error) {
        invalidVoteFn();
      }
    },
    castOrAuditBallot({ encryptedDataHash }) {
      $benchmark.text(
        `The encryption took ${(new Date() - encryptStart) / 1000} seconds.`
      );
      $ballotHash.text(`Your ballot identifier is: ${encryptedDataHash}`);
      $encryptVote.prop("disabled", true);
      $castVote.show();
      $auditVote.show();
    },
    onBindAuditBallotButton(onEventTriggered) {
      $auditVote.on("click", onEventTriggered);
    },
    onBindCastBallotButton(onEventTriggered) {
      $castVote.on("click", onEventTriggered);
    },
    onAuditBallot(auditedVote, auditFileName) {
      const vote = JSON.stringify(auditedVote);
      const link = document.createElement("a");

      link.setAttribute("href", `data:text/plain;charset=utf-8,${vote}`);
      link.setAttribute("download", auditFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onAuditComplete() {
      $castVote.prop("disabled", true);
      $auditVote.prop("disabled", true);

      $auditMessage.show();
      $vote.css("background", "green");
    },
    onCastBallot({ encryptedData: encryptedBallot }) {
      return $.ajax({
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          voter_id: $voterId.val(),
          encrypted_ballot: encryptedBallot,
        }), // eslint-disable-line camelcase
        headers: {
          "X-CSRF-Token": $("meta[name=csrf-token]").attr("content"),
        },
      });
    },
    onCastComplete() {
      $castVote.prop("disabled", true);
      $auditVote.prop("disabled", true);
      $doneMessage.show();
      $vote.css("background", "green");
    },
    onInvalid() {
      $vote.css("border", "1px solid red");
    },
  });
});

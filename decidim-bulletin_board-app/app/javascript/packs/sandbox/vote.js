import $ from "jquery";
import { VoteComponent } from "../decidim-bulletin_board";
import { VoterWrapperAdapter as DummyVoterWrapperAdapter } from "voting-scheme-dummy";

$(async () => {
  // UI Elements
  const $voter = $(".voter");
  const $encryptVote = $voter.find(".encrypt-vote");
  const $castVote = $voter.find(".cast-vote");
  const $auditVote = $voter.find(".audit-vote");
  const $vote = $voter.find("textarea");
  const $voterId = $voter.find("input");
  const $doneMessage = $voter.find(".done-message");
  const $auditMessage = $voter.find(".audit-done-message");

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

  if (votingSchemeName === "dummy") {
    voterWrapperAdapter = new DummyVoterWrapperAdapter({
      voterId: voterUniqueId,
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

  await component.bindEvents({
    onSetup() {
      $encryptVote.removeAttr("disabled");
    },
    onBindEncryptButton(onEventTriggered) {
      $encryptVote.on("click", onEventTriggered);
    },
    onStart() {},
    onVoteEncryption(validVoteFn, invalidVoteFn) {
      $vote.css("background", "");
      $auditMessage.hide();
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
    castOrAuditBallot() {
      $encryptVote.prop("disabled", true);
      $castVote.show();
      $auditVote.show();
    },
    onAuditVote(onEventTriggered) {
      $auditVote.on("click", onEventTriggered);
    },
    onVoteValidation(onEventTriggered) {
      $castVote.on("click", onEventTriggered);
    },
    onVoteAudition(auditedVote, auditFileName) {
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
    onVoteEncrypted({ encryptedBallot }) {
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
    onComplete() {
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

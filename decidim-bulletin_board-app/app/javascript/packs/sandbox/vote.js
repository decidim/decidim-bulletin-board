import $ from "jquery";
import { VoteComponent } from "../decidim-bulletin_board";
import { VoterWrapperAdapter as DummyVoterWrapperAdapter } from "bulletin_board-dummy-adapter";
import { VoterWrapperAdapter as ElectionGuardVoterWrapperAdapter } from "bulletin_board-election_guard-adapter";

$(async () => {
  // UI Elements
  const $voter = $(".voter");
  const $encryptVote = $voter.find(".encrypt-vote");
  const $castVote = $voter.find(".cast-vote");
  const $storeVote = $voter.find(".store-vote");
  const $auditVote = $voter.find(".audit-vote");
  const $vote = $voter.find("textarea");
  const $voterId = $voter.find("input");
  const $doneMessage = $voter.find(".done-message");
  const $auditMessage = $voter.find(".audit-done-message");
  const $ballotHash = $voter.find(".ballot-hash");
  const STORE_ACTION = "store";
  const CAST_ACTION = "cast";
  let performedAction = "";
  const setPerformedAction = (action) => {
    performedAction = action;
  };

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
      waitTime: 100,
    });
  } else if (votingSchemeName === "election_guard") {
    voterWrapperAdapter = new ElectionGuardVoterWrapperAdapter({
      voterId: voterUniqueId,
      workerUrl: "/assets/election_guard/webworker.js",
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
        validVoteFn(vote);
      } catch (_error) {
        invalidVoteFn();
      }
    },
    castOrAuditBallot({ encryptedDataHash }) {
      $ballotHash.text(`Your ballot identifier is: ${encryptedDataHash}`);
      $encryptVote.prop("disabled", true);
      $castVote.show();
      $auditVote.show();
      $storeVote.show();
    },
    onBindAuditBallotButton(onEventTriggered) {
      $auditVote.on("click", onEventTriggered);
    },
    onBindCastBallotButton(onEventTriggered) {
      $castVote.on("click", (event) => {
        setPerformedAction(CAST_ACTION);
        onEventTriggered(event);
      });

      $storeVote.on("click", (event) => {
        setPerformedAction(STORE_ACTION);
        onEventTriggered(event);
      });
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
          store_to_file: performedAction === STORE_ACTION,
        }), // eslint-disable-line camelcase
        headers: {
          "X-CSRF-Token": $("meta[name=csrf-token]").attr("content"),
        },
      });
    },
    onCastComplete() {
      $castVote.prop("disabled", true);
      $auditVote.prop("disabled", true);
      $storeVote.prop("disabled", true);
      $doneMessage.show();
      $vote.css("background", "green");
    },
    onInvalid() {
      $vote.css("border", "1px solid red");
    },
  });
});

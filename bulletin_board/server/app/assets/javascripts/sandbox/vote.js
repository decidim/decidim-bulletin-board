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
  const $voterId = $voter.find("input");
  const $doneMessage = $voter.find(".done-message");
  const $pendingMessage = $doneMessage.find(".pending-message");
  const $auditMessage = $voter.find(".audit-done-message");
  const $ballotHash = $voter.find(".ballot-hash");
  const $benchmark = $voter.find(".benchmark");
  const $ballotStyle = $("select[name=ballot_style]");
  const $allAnswers = $("input.answer");

  $voter.find(".vote__form-actions").on("click", "button", (event) => {
    event.preventDefault();
  });

  $allAnswers
    .on("change", (event) => {
      const checkbox = event.target;
      if (
        $(checkbox).parents(".question").find(".answer:checked").length >
        parseInt(checkbox.dataset.limit)
      ) {
        checkbox.checked = false;
      }
    })
    .trigger("change");

  const toggleQuestions = (ballotStyle) => {
    $(".question").find("input").prop("disabled", true);
    $(`.question.${ballotStyle}`).show();
    $(`.question.${ballotStyle}`).find("input").prop("disabled", false);
  };

  $ballotStyle.on("change", (event) => {
    const ballotStyle = event.target.value;
    toggleQuestions(ballotStyle);
  });

  if ($ballotStyle.length) {
    toggleQuestions($ballotStyle.val());
  }

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
      workerUrl: "/assets/electionguard/webworker.js"
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
      $auditMessage.hide();
      $doneMessage.hide();
      $encryptVote.prop("disabled", true);
    },
    onVoteEncryption(validVoteFn, invalidVoteFn) {
      try {
        const formData = $voter.serializeArray();
        const [ballotStyleData] = formData.filter(
          ({ name }) => name === "ballot_style"
        );
        const voteData = formData
          .filter(({ name }) => name !== "ballot_style" && name !== "voter_id")
          .reduce((acc, { name, value }) => {
            if (!acc[name]) {
              acc[name] = [];
            }
            if (value !== "") {
              acc[name] = [...acc[name], value];
            }
            return acc;
          }, {});

        if (!voteData) {
          invalidVoteFn();
        }
        encryptStart = new Date();
        validVoteFn(voteData, ballotStyleData ? ballotStyleData.value : null);
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
    onCastComplete(result) {
      $castVote.prop("disabled", true);
      $auditVote.prop("disabled", true);

      $doneMessage.show();
      component.bulletinBoardClient
        .waitForPendingMessageToBeProcessed(result.data.messageId)
        .then((pendingMessage) => {
          $pendingMessage.addClass(pendingMessage.status);
          $pendingMessage.text(pendingMessage.status);
        });
    },
    onInvalid() {},
  });
});

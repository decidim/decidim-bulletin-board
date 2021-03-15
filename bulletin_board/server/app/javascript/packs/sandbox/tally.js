import $ from "jquery";
import { TallyComponent, IdentificationKeys } from "../decidim-bulletin_board";
import { TrusteeWrapperAdapter as DummyTrusteeWrapperAdapter } from "bulletin_board-dummy-adapter";
import { TrusteeWrapperAdapter as ElectionGuardTrusteeWrapperAdapter } from "bulletin_board-electionguard-adapter";

$(() => {
  // UI Elements
  const $trusteeTable = $(".trustee-table");

  // Data
  const bulletinBoardClientParams = {
    apiEndpointUrl: $trusteeTable.data("apiEndpointUrl"),
  };
  const electionUniqueId = $trusteeTable.data("electionUniqueId");
  const authorityPublicKeyJSON = $trusteeTable.data("authorityPublicKey");
  const votingSchemeName = $trusteeTable.data("votingSchemeName");

  $trusteeTable.find("tbody tr").each((_index, row) => {
    const $trustee = $(row);

    const trusteeContext = {
      uniqueId: $trustee.data("uniqueId"),
      publicKeyJSON: JSON.stringify($trustee.data("publicKey")),
    };

    const trusteeIdentificationKeys = new IdentificationKeys(
      trusteeContext.uniqueId,
      trusteeContext.publicKeyJSON
    );

    const $startButton = $trustee.find(".start-button");
    const $generateBackupButton = $trustee.find(".generate-backup-button");
    const $restoreButton = $trustee.find(".restore-button");
    const $doneMessage = $trustee.find(".done-message");

    // Use the correct trustee wrapper adapter
    let trusteeWrapperAdapter;

    if (votingSchemeName === "dummy") {
      trusteeWrapperAdapter = new DummyTrusteeWrapperAdapter({
        trusteeId: trusteeContext.uniqueId,
      });
    } else if (votingSchemeName === "electionguard") {
      trusteeWrapperAdapter = new ElectionGuardTrusteeWrapperAdapter({
        trusteeId: trusteeContext.uniqueId,
        workerUrl: "/assets/electionguard/webworker.js",
      });
    } else {
      throw new Error(`Voting scheme ${votingSchemeName} not supported.`);
    }

    // Use the tally component and bind all UI events
    const component = new TallyComponent({
      bulletinBoardClientParams,
      authorityPublicKeyJSON,
      electionUniqueId,
      trusteeUniqueId: trusteeContext.uniqueId,
      trusteeIdentificationKeys,
      trusteeWrapperAdapter,
    });

    const bindComponentEvents = async () => {
      await component.bindEvents({
        onEvent(_event) {},
        onBindStartButton(onEventTriggered) {
          $startButton.on("click", onEventTriggered);
        },
        onStart() {
          $startButton.hide();
        },
        onComplete() {
          $doneMessage.show();
        },
        onTrusteeNeedsToBeRestored() {
          $generateBackupButton.show();
          $restoreButton.show();
        },
        onBindRestoreButton(onEventTriggered) {
          $restoreButton.on(
            "change",
            ".restore-button-input",
            onEventTriggered
          );
        },
        onRestore() {
          $generateBackupButton.hide();
          $restoreButton.hide();
        },
      });

      $startButton.show();
      $generateBackupButton.on("click", (event) => {
        $generateBackupButton.attr(
          "href",
          `data:text/plain;charset=utf-8,{"trusteeId":"${trusteeContext.uniqueId}","electionId":"${electionUniqueId}","status":1,"electionTrusteesCount":3,"processedMessages":[]}`
        );
        $generateBackupButton.attr(
          "download",
          `${trusteeContext.uniqueId}-election-${electionUniqueId}.bak`
        );
      });
    };

    trusteeIdentificationKeys.present(async (exists) => {
      if (exists) {
        await bindComponentEvents();
      }
    });
  });
});

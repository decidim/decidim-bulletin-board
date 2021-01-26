// = require sandbox/identification_keys
// = require decidim/bulletin_board/decidim-bulletin_board.dev
// = require jquery

$(() => {
  const {
    Client,
    Election,
    Trustee,
    MESSAGE_PROCESSED,
  } = window.decidimBulletinBoard;

  const $trusteeTable = $(".trustee-table");

  const bulletinBoardClient = new Client({
    apiEndpointUrl: "http://localhost:8000/api",
  });

  const election = new Election({
    uniqueId: $trusteeTable.data("electionUniqueId"),
    bulletinBoardClient,
  });

  $trusteeTable.find("tbody tr").each((_index, row) => {
    const $trustee = $(row);

    const trusteeContext = {
      uniqueId: $trustee.data("uniqueId"),
      publicKeyJSON: JSON.stringify($trustee.data("publicKey")),
    };

    const identificationKeys = new window.Decidim.IdentificationKeys(
      trusteeContext.uniqueId,
      trusteeContext.publicKeyJSON
    );

    identificationKeys.present((exists) => {
      const $startButton = $trustee.find(".start-button");
      const $backupButton = $trustee.find(".backup-button");
      const $restoreButton = $trustee.find(".restore-button");
      const $doneMessage = $trustee.find(".done-message");

      $startButton.hide();
      $backupButton.hide();
      $restoreButton.hide();
      $doneMessage.hide();

      function setupKeyCeremony() {
        const trustee = new Trustee({
          uniqueId: trusteeContext.uniqueId,
          bulletinBoardClient,
          identificationKeys,
          election,
        });

        $trustee.find(".private-key").hide();

        $startButton.on("click", async (event) => {
          event.preventDefault();
          $startButton.hide();

          await trustee.setup();

          if (trustee.needsToBeRestored()) {
            $restoreButton.show();
          } else {
            const keyCeremonySetup = trustee.setupKeyCeremony();
            const { value: backupData } = await keyCeremonySetup.next();

            $backupButton.on("click", async () => {
              $backupButton.hide();
              $backupButton.attr(
                "href",
                `data:text/plain;charset=utf-8,${backupData}`
              );
              $backupButton.attr(
                "download",
                `${trustee.uniqueId}-election-${election.uniqueId}.bak`
              );
              await keyCeremonySetup.next();
              await trustee.runKeyCeremony();
              $doneMessage.show();
            });

            $backupButton.show();
          }
        });

        $restoreButton.on("change", ".restore-button-input", (event) => {
          let file = event.target.files[0];
          const reader = new FileReader();
          reader.onload = function ({ target }) {
            let content = target.result;
            if (trustee.restore(content)) {
              $restoreButton.hide();
              trustee.runKeyCeremony();
            }
          };
          reader.readAsText(file);
        });

        $startButton.show();
      }

      if (exists) {
        setupKeyCeremony();
      } else {
        $trustee.on("change", ".private-key-input", async (event) => {
          await identificationKeys.upload(event, true);
          setupKeyCeremony();
        });
      }
    });
  });
});

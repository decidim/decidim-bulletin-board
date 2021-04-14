//= require jquery
//= require decidim/bulletin_board/decidim-bulletin_board

$(() => {
  const { Client } = window.decidimBulletinBoard;

  // UI Elements
  const $pendingMessage = $(".js-pending-message");

  if ($pendingMessage.length) {
    // Data
    const messageId = $pendingMessage.data("messageId");
    const bulletinBoardClientParams = {
      apiEndpointUrl: $pendingMessage.data("apiEndpointUrl"),
    };

    const bulletinBoardClient = new Client(bulletinBoardClientParams);
    bulletinBoardClient.waitForPendingMessageToBeProcessed(messageId).then((pendingMessage) => {
      $pendingMessage.addClass(pendingMessage.status);
      $pendingMessage.text(pendingMessage.status);
    });
  }
});

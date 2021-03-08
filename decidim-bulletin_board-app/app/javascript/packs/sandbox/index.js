import $ from "jquery";

$(async () => {
  // UI Elements
  const $showInputButton = $(".show-input-button");
  const $generateVotesButton = $(".generate-votes-button");
  const $downloadVotesButton = $(".download-votes-button");

  $showInputButton.on("click", (event) => {
    $(event.target).hide();
    $(event.target)
      .siblings(".generate-votes-input-section")
      .css("display", "inline");
  });

  $generateVotesButton.on("click", (event) => {
    const electionId = $(event.target).closest(".election").data("id");
    const votesToGenerate = $(event.target)
      .siblings(".generate-votes-input")
      .val();
    $(event.target).html(`Generating ${votesToGenerate} votes...`);
    $(event.target).prop("disabled", true);

    $.ajax({
      url: `/sandbox/elections/${electionId}/generate_bulk_votes`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        number_of_votes: votesToGenerate,
      }), // eslint-disable-line camelcase
      headers: {
        "X-CSRF-Token": $("meta[name=csrf-token]").attr("content"),
      },
    })
      .done(() => {
        $(event.target).closest(".generate-votes-input-section").hide();
        $downloadVotesButton.css("display", "inline");
      })
      .fail(() => $(event.target).html(`Failed, retry!`));
  });
});

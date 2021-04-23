//= require jquery

$(() => {
  // UI Elements
  const $stressTests = $(".stress-tests");
  const $generateVotes = $(".generate-votes");

  $stressTests.on("click", (event) => {
    $(event.target).addClass("pressed");
  });

  $generateVotes.on("click", (event) => {
    const electionId = $(event.target).closest(".election").data("id");
    const votesToGenerate = $(event.target)
      .siblings(".generate-votes-input")
      .val();
    $(event.target).html(`Launching generation...`);
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
      .done(() => location.reload())
      .fail(() => $(event.target).html(`Failed, retry!`));
  });
});

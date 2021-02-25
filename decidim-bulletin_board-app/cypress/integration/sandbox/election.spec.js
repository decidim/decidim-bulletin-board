import { ElectionPage } from "./election.page";

describe("Election", () => {
  const page = new ElectionPage();

  it("complete the whole process using the dummy voting scheme", () => {
    const electionTitle = "My dummy election";
    const electionUniqueId = "test-1";

    page.setup(({ trustees }) => {
      page.visit();

      page.setupElection({
        title: electionTitle,
        uniqueId: electionUniqueId,
        votingSchemeName: "dummy",
      });
      page.startKeyCeremony();
      page.assertKeyCeremonyHasStarted();
      page.performKeyCeremony(electionTitle, trustees);
      page.assertKeyCeremonyHasEnded(trustees);

      page.startVote();
      page.assertVoteHasStarted();
      page.encryptVote();
      page.assertBallotHashIsPresent();
      page.auditVote();
      page.assertVoteHasBeenAudited();
      page.castVote();
      page.assertVoteHasBeenCasted();
      page.endVote();
      page.assertVoteHasEnded();

      page.startTally();
      page.assertTallyHasStarted();
      page.performTally(electionTitle, electionUniqueId, trustees);
      page.assertTallyHasEnded(trustees);
    });
  });
});

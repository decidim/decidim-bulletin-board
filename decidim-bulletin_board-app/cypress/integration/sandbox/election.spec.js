import { ElectionPage } from "./election.page";

describe("Election", () => {
  const page = new ElectionPage();

  it("complete the whole process", () => {
    page.setup(({ election, trustees }) => {
      page.visit();

      page.startKeyCeremony();
      page.assertKeyCeremonyHasStarted();
      page.performKeyCeremony(election, trustees);
      page.assertKeyCeremonyHasEnded(trustees);

      page.startVote();
      page.assertVoteHasStarted();
      page.auditVote();
      page.assertVoteHasBeenAudited();
      page.castVote();
      page.assertVoteHasBeenCasted();
      page.endVote();
      page.assertVoteHasEnded();

      page.startTally();
      page.assertTallyHasStarted();
      page.performTally(election, trustees);
      page.assertTallyHasEnded(trustees);
    });
  });
});

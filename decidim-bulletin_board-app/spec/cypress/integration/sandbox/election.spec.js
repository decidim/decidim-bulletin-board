import { ElectionPage } from "./election.page";

describe("Election", () => {
  const page = new ElectionPage();

  it("complete the whole process", () => {
    page.setup(({ election, trustees }) => {
      page.visit();

      page.startKeyCeremony(election);
      page.assertKeyCeremonyHasStarted(election);
      page.performKeyCeremony(election, trustees);
      page.assertKeyCeremonyHasEnded(election, trustees);

      page.startVote(election);
      page.assertVoteHasStarted(election);
      page.castVote(election);
      page.assertVoteHasBeenCasted();
      page.endVote(election);
      page.assertVoteHasEnded(election);

      page.startTally(election);
      page.assertTallyHasStarted(election);
      page.performTally(election, trustees);
      page.assertTallyHasEnded(election, trustees);
    });
  });
});

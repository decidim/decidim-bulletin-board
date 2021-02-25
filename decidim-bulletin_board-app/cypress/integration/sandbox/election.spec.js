import { ElectionPage } from "./election.page";

describe("Election", () => {
  const page = new ElectionPage();

  const testElection = ({
    electionTitle,
    electionUniqueId,
    electionVotingSchemeName,
  }) => {
    page.setup(({ trustees }) => {
      page.visit();

      page.setupElection({
        title: electionTitle,
        uniqueId: electionUniqueId,
        votingSchemeName: electionVotingSchemeName,
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
  };

  it("complete the whole process using the dummy voting scheme", () => {
    testElection({
      electionTitle: "My dummy election",
      electionUniqueId: "dummy-1",
      electionVotingSchemeName: "dummy",
    });
  });

  it("complete the whole process using the election_guard voting scheme", () => {
    testElection({
      electionTitle: "My election_guard election",
      electionUniqueId: "election_guard-1",
      electionVotingSchemeName: "election_guard",
    });
  });
});

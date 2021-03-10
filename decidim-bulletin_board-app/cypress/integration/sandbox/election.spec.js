import { ElectionPage } from "./election.page";

describe("Election", () => {
  const page = new ElectionPage();

  const testElection = ({
    electionTitle,
    electionUniqueId,
    electionVotingSchemeName,
    numberOfVotes,
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
      for (let i = 0; i < numberOfVotes; i++) {
        page.castVote();
        page.assertVoteHasBeenCasted();
      }
      page.endVote();
      page.assertVoteHasEnded();

      page.startTally();
      page.assertTallyHasStarted();
      page.performTally(electionTitle, electionUniqueId, trustees);
      page.assertTallyHasEnded(trustees);

      page.publishResults();
      page.assertResultsPublished();
      page.viewResults(electionTitle);
      page.assertCorrectResults();
    });
  };

  it("complete the whole process using the dummy voting scheme", () => {
    testElection({
      electionTitle: "My dummy election",
      electionUniqueId: "dummy-1",
      electionVotingSchemeName: "dummy",
      numberOfVotes: 10,
    });
  });

  it("complete the whole process using the electionguard voting scheme", () => {
    testElection({
      electionTitle: "My ElectionGuard election",
      electionUniqueId: "electionguard-1",
      electionVotingSchemeName: "electionguard",
      numberOfVotes: 2,
    });
  });
});

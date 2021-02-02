import { Voter } from "./voter";

jest.mock("./voter_wrapper_dummy");

describe("Voter", () => {
  const defaultParams = {
    uniqueId: "voter-1",
  };

  const buildVoter = (params = defaultParams) => {
    return new Voter(params);
  };

  let voter;

  beforeEach(() => {
    voter = buildVoter();
  });

  it("initialise the voter wrapper with the given params", () => {
    expect(voter.uniqueId).toEqual(defaultParams.uniqueId);
    expect(voter.wrapper.voterId).toEqual(defaultParams.uniqueId);
  });

  describe("encrypt", () => {
    it("calls the wrapper's encrypt method with the given data", async () => {
      spyOn(voter.wrapper, "encrypt");
      await voter.encrypt({
        question1: ["answer-1-option-a"],
        question2: ["answer-2-option-a", "answer-2-option-b"],
      });
      expect(voter.wrapper.encrypt).toHaveBeenCalledWith({
        question1: ["answer-1-option-a"],
        question2: ["answer-2-option-a", "answer-2-option-b"],
      });
    });
  });
});

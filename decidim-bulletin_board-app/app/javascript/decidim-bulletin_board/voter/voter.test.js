import { Voter } from "./voter";

jest.mock("./voter_wrapper_dummy");

describe("Voter", () => {
  const defaultParams = {
    uniqueId: "voter-1",
    authorityPublicKeyJSON:
      '{"e":"AQAB","n":"pNgMt8lnPDD3TlWYGhRiV1oZkPQmnLdiUzwyb_-35qKD9k-HU86xo0uSgoOUWkBtnvFscq8zNDPAGAlZVokaN_z9ksZblSce0LEl8lJa3ICgghg7e8vg_7Lz5dyHSQ3PCLgenyFGcL401aglDde1Xo4ujdz33Lklc4U9zoyoLUI2_viYmNOU6n5Mn0sJd30FeICMrLD2gX46pGe3MGug6groT9EvpKcdOoJHKoO5yGSVaeY5-Bo3gngvlgjlS2mfwjCtF4NYwIQSd2al-p4BKnuYAVKRSgr8rYnnjhWfJ4GsCaqiyXNi5NPYRV6gl_cx_1jUcA1rRJqQR32I8c8QbAXm5qNO4URcdaKys9tNcVgXBL1FsSdbrLVVFWen1tfWNfHm-8BjiWCWD79-uk5gI0SjC9tWvTzVvswWXI5weNqqVXqpDydr46AsHE2sG40HRCR3UF3LupT-HwXTcYcOZr5dJClJIsU3Hrvy4wLssub69YSNR1Jxn-KX2vUc06xY8CNIuSMpfufEq5cZopL6O2l1pRsW1FQnF3s078_Y9MaQ1gPyBo0IipLBVUj5IjEIfPuiEk4jxkiUYDeqzf7bAvSFckp94yLkRWTs_pEZs7b_ogwRG6WMHjtcaNYe4CufhIm9ekkKDeAWOPRTHfKNmohRBh09XuvSjqrx5Z7rqb8","kid":"b8dba1459df956d60107690c34fa490db681eac4f73ffaf6e4055728c02ddc8e","kty":"RSA"}',
  };

  const buildVoter = (params = defaultParams) => {
    return new Voter(params);
  };

  let voter;

  beforeEach(() => {
    voter = buildVoter();
  });

  it("initialises the voter wrapper with the given params", () => {
    expect(voter.uniqueId).toEqual(defaultParams.uniqueId);
    expect(voter.wrapper.voterId).toEqual(defaultParams.uniqueId);
  });

  describe("encrypt", () => {
    it("calls the wrapper's encrypt method with the given data", async () => {
      jest
        .spyOn(voter.wrapper, "encrypt")
        .mockImplementation(() =>
          Promise.resolve({ auditableBallot: {}, encryptedBallot: {} })
        );
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

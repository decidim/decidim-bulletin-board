import {
  TrusteeWrapper,
  CREATE_ELECTION,
  KEY_CEREMONY_STEP_1,
  KEY_CEREMONY_JOINT_ELECTION_KEY,
} from "./trustee_wrapper_dummy";

import { MessageIdentifier, TRUSTEE_TYPE } from "../client/message-identifier";

describe("TrusteeWrapper", () => {
  const defaultParams = {
    trusteeId: "trustee-1",
  };

  const buildTrusteeWrapper = (params = defaultParams) => {
    return new TrusteeWrapper(params);
  };

  let wrapper;

  beforeEach(() => {
    wrapper = buildTrusteeWrapper();
  });

  it("initialises the trustee wrapper with the given params", () => {
    expect(wrapper.trusteeId).toEqual(defaultParams.trusteeId);
    expect(wrapper.electionId).toEqual(null);
    expect(wrapper.status).toEqual(CREATE_ELECTION);
    expect(wrapper.electionTrusteesCount).toEqual(0);
    expect(wrapper.processedMessages).toEqual([]);
  });

  describe("processMessage", () => {
    describe("when the status is CREATE_ELECTION", () => {
      beforeEach(() => {
        wrapper.status = CREATE_ELECTION;
      });

      describe("when the message to be processed is the correct one", () => {
        it("changes the wrapper status and stores some data", () => {
          const { done, save } = wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              CREATE_ELECTION,
              TRUSTEE_TYPE,
              "some-author-id"
            ),
            {
              trustees: ["trustee-1", "trustee-2"],
            }
          );
          expect(wrapper.status).toEqual(KEY_CEREMONY_STEP_1);
          expect(wrapper.electionId).toEqual("some-authority.some-id");
          expect(wrapper.processedMessages).toEqual([]);
          expect(wrapper.electionTrusteesCount).toEqual(2);
          expect(done).toBeFalsy();
          expect(save).toBeTruthy();
        });
      });

      describe("when the message to be processes is not the correct one", () => {
        it("doesn't do anything", () => {
          wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              "some-type",
              TRUSTEE_TYPE,
              "some-author-id"
            ),
            {}
          );
          expect(wrapper.status).toEqual(CREATE_ELECTION);
        });
      });
    });

    describe("when the status is KEY_CEREMONY_STEP_1", () => {
      beforeEach(() => {
        wrapper.status = KEY_CEREMONY_STEP_1;
      });

      describe("when the message to be processed is the correct one", () => {
        describe("when there are not enough trustees", () => {
          it("stores the message", () => {
            wrapper.electionTrusteesCount = 2;
            wrapper.processMessage(
              MessageIdentifier.format(
                "some-authority.some-id",
                KEY_CEREMONY_STEP_1,
                TRUSTEE_TYPE,
                "some-author-id"
              ),
              {
                trustee: "first-trustee",
              }
            );
            expect(wrapper.status).toEqual(KEY_CEREMONY_STEP_1);
            expect(wrapper.processedMessages).toEqual([
              {
                trustee: "first-trustee",
              },
            ]);
          });
        });

        describe("when there are enough trustees", () => {
          it("changes the wrapper status and stores some data", () => {
            wrapper.electionTrusteesCount = 1;
            const { done, save } = wrapper.processMessage(
              MessageIdentifier.format(
                "some-authority.some-id",
                KEY_CEREMONY_STEP_1,
                TRUSTEE_TYPE,
                "some-author-id"
              ),
              {
                trustee: "first-trustee",
              }
            );
            expect(wrapper.status).toEqual(KEY_CEREMONY_JOINT_ELECTION_KEY);
            expect(done).toBeFalsy();
            expect(save).toBeFalsy();
          });
        });
      });

      describe("when the message to be processes is not the correct one", () => {
        it("doesn't do anything", () => {
          wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              "some-type",
              TRUSTEE_TYPE,
              "some-author-id"
            ),
            {}
          );
          expect(wrapper.status).toEqual(KEY_CEREMONY_STEP_1);
        });
      });
    });

    describe("when the status is KEY_CEREMONY_JOINT_ELECTION_KEY", () => {
      beforeEach(() => {
        wrapper.status = KEY_CEREMONY_JOINT_ELECTION_KEY;
      });

      describe("when the message to be processed is the correct one", () => {
        it("returns some data", () => {
          const { done, save } = wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              KEY_CEREMONY_JOINT_ELECTION_KEY,
              TRUSTEE_TYPE,
              "some-author-id"
            ),
            {}
          );
          expect(done).toBeTruthy();
          expect(save).toBeFalsy();
        });
      });

      describe("when the message to be processes is not the correct one", () => {
        it("doesn't do anything", () => {
          wrapper.processMessage(
            MessageIdentifier.format(
              "some-authority.some-id",
              "some-type",
              TRUSTEE_TYPE,
              "some-author-id"
            ),
            {}
          );
          expect(wrapper.status).toEqual(KEY_CEREMONY_JOINT_ELECTION_KEY);
        });
      });
    });
  });

  describe("needsToBeRestored", () => {
    it("returns false when there aren't messages sent by the Trustee", () => {
      expect(wrapper.needsToBeRestored(null)).toBeFalsy();
    });

    it("returns false when the wrapper status is not the initial state", () => {
      wrapper.status = "key_ceremony.step_1";
      expect(wrapper.needsToBeRestored("key_ceremony.step_1")).toBeFalsy();
    });

    it("returns true when the wrapper status is the initial state and there are messages sent by the Trustee", () => {
      expect(wrapper.needsToBeRestored("key_ceremony.step_1")).toBeTruthy();
    });
  });

  describe("backup", () => {
    it("returns a JSON representation of the wrapper", () => {
      expect(wrapper.backup()).toEqual(
        '{"trusteeId":"trustee-1","electionId":null,"status":"create_election","electionTrusteesCount":0,"processedMessages":[]}'
      );
    });
  });

  describe("restore", () => {
    it("restore the state of the wrapper from a backup", () => {
      wrapper.status = "key_ceremony.step_1";
      const backup = wrapper.backup();

      wrapper = buildTrusteeWrapper();
      expect(wrapper.status).toEqual("create_election");
      expect(wrapper.restore(backup, "key_ceremony.step_1")).toBeTruthy();
      expect(wrapper.status).toEqual("key_ceremony.step_1");
    });

    it("doesn't restore the state of the wrapper from a backup if it's not right", () => {
      const backup = wrapper.backup();

      wrapper.status = "key_ceremony.step_1";
      expect(wrapper.restore(backup, "key_ceremony.step_1")).toBeFalsy();
      expect(wrapper.status).toEqual("key_ceremony.step_1");
    });

    it("doesn't restore the state from another Trustee", () => {
      const backup = new TrusteeWrapper({ trusteeId: "trustee-2" }).backup();

      expect(wrapper.restore(backup, null)).toBeFalsy();
      expect(wrapper.trusteeId).toEqual("trustee-1");
    });
  });
});

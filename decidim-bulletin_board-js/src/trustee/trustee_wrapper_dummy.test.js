import { TrusteeWrapper } from "./trustee_wrapper_dummy";

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

  describe("backup", () => {
    it("returns a JSON representation of the wrapper", () => {
      expect(wrapper.backup()).toEqual(
        '{"trusteeId":"trustee-1","electionId":null,"status":"create_election","electionTrusteesCount":0,"processedMessages":[]}'
      );
    });
  });

  describe("checkRestoreNeeded", () => {
    it("returns false when there aren't messages sent by the Trustee", () => {
      expect(wrapper.checkRestoreNeeded(null)).toBeFalsy();
    });

    it("returns false when the wrapper status is not the initial state", () => {
      wrapper.status = "key_ceremony.step_1";
      expect(wrapper.checkRestoreNeeded("key_ceremony.step_1")).toBeFalsy();
    });

    it("returns true when the wrapper status is the initial state and there are messages sent by the Trustee", () => {
      expect(wrapper.checkRestoreNeeded("key_ceremony.step_1")).toBeTruthy();
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

import { KeyCeremonyPage } from "./key_ceremony.page";

describe("List elections", () => {
  const page = new KeyCeremonyPage();

  it("handles the key ceremony for each trustee", () => {
    page.setup(({ election, trustees }) => {
      page.visit();
      page.startKeyCeremony();
      page.performKeyCeremony(election, trustees);
      page.assertKeyCeremonyIsDone(trustees);
    });
  });
});

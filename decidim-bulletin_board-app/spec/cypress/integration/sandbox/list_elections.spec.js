import { ListElectionsPage } from "./list_elections.page";

describe("List elections", () => {
  const page = new ListElectionsPage();

  it("display a list of elections and some of its attributes", () => {
    page.setup(({ elections }) => {
      page.visit();
      page.assertElectionsDataIsPresent(elections);
    });
  });
});

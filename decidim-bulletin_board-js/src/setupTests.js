import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

window.crypto = {
  subtle: {
    digest(data) {
      return Promise.resolve(data);
    },
  },
};

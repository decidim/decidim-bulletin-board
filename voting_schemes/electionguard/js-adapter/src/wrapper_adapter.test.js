import { WrapperAdapter } from "./wrapper_adapter";

describe("WrapperAdapter", () => {
  class TestWrapperAdapter extends WrapperAdapter {
    constructor() {
      super();
      this.worker = {
        onmessage: jest.fn(),
        onerror: jest.fn(),
        postMessage: jest.fn(),
      };
    }
  }

  const wrapperAdapter = new TestWrapperAdapter();

  describe("processPythonCodeOnWorker", () => {
    it("calls the worker's postMessage method with the correct params", () => {
      const pythonCode = `
        1 + 1
      `;
      const pythonData = {
        foo: "bar",
      };
      jest.spyOn(wrapperAdapter.worker, "postMessage");
      wrapperAdapter.processPythonCodeOnWorker(pythonCode, pythonData);
      expect(wrapperAdapter.worker.postMessage).toHaveBeenCalledWith({
        python: pythonCode,
        ...pythonData,
      });
    });
  });
});

export class Trustee {
  processLogEntry({ messageId, signedData }) {
    switch (messageId) {
      case "dummy.nothing": {
        return null;
      }
      case "dummy.step": {
        return {
          done: false,
          message: {
            signedData,
          },
        };
      }
      case "dummy.done": {
        return {
          done: true,
          message: {
            signedData,
          },
        };
      }
    }
  }

  sign({ signedData }) {
    return signedData;
  }
}

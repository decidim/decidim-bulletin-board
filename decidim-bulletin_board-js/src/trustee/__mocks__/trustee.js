export class Trustee {
  processLogEntry({ logType, signedData }) {
    switch (logType) {
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

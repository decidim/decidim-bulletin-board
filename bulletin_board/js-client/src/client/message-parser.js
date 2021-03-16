import { JWS, JWK } from "node-jose";
import {
  MessageIdentifier,
  AUTHORITY_TYPE,
  BULLETIN_BOARD_TYPE,
  TRUSTEE_TYPE,
} from "./message-identifier";
import { samePublicKeys } from "../utils";

/**
 * Verify and parses JWT tokens.
 */
export class MessageParser {
  /**
   * Initializes the class with the given params.
   *
   * @constructor
   * @param {Object} params - An object that contains the initialization params.
   * - {String} authorityPublicKeyJSON - The public key of the authority
   */
  constructor({ authorityPublicKeyJSON }) {
    this.authorityPublicKeyJSON = authorityPublicKeyJSON;
    this.authorityPublicKey = JWK.asKey(authorityPublicKeyJSON, "json");
    this.keys = null;
  }

  /**
   * Parses the given token only if it can be verified.
   *
   * @param {String} token - A JWT token.
   * @returns {Promise<Object>} - The payload included in the token.
   * @throws An error is thrown if the payload is not a valid JSON or the token
   *         cannot be verified.
   */
  async parse({ messageId, signedData }) {
    const messageIdentifier = MessageIdentifier.parse(messageId);
    const senderKey = await (this.keys
      ? this.keys[messageIdentifier.author.type][messageIdentifier.author.id]
      : this.authorityPublicKey);

    if (!signedData) {
      return { messageIdentifier, decodedData: null };
    }

    const result = await JWS.createVerify(senderKey).verify(signedData, {
      algorithms: ["RS256"],
    });

    const decodedData = JSON.parse(
      new TextDecoder("utf-8").decode(result.payload)
    );

    if (!this.keys) {
      this.keys = await this.parseCreateElection(decodedData);
    }

    return { messageIdentifier, decodedData };
  }

  /* eslint-disable camelcase */
  async parseCreateElection({ authority, bulletin_board, trustees }) {
    if (!samePublicKeys(authority.public_key, this.authorityPublicKeyJSON)) {
      throw new Error(
        "The authority public key doesn't match the election's authority public key."
      );
    }

    const result = {
      [AUTHORITY_TYPE]: { [authority.slug]: this.authorityPublicKey },
      [BULLETIN_BOARD_TYPE]: {},
      [TRUSTEE_TYPE]: {},
    };

    const promises = [];
    promises.push(
      this.loadKey(bulletin_board).then((key) => {
        result[BULLETIN_BOARD_TYPE][bulletin_board.slug] = key;
      })
    );
    for (const trustee of trustees) {
      promises.push(
        this.loadKey(trustee).then((key) => {
          result[TRUSTEE_TYPE][trustee.slug] = key;
        })
      );
    }

    await Promise.all(promises);

    return result;
  }
  /* eslint-enable camelcase */

  loadKey(client) {
    return JWK.asKey(client.public_key, "json");
  }
}

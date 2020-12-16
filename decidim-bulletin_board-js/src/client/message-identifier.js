export const AUTHORITY_TYPE = "a";
export const BULLETIN_BOARD_TYPE = "b";
export const VOTER_TYPE = "v";
export const TRUSTEE_TYPE = "t";
export const VALID_TYPES = [
  AUTHORITY_TYPE,
  BULLETIN_BOARD_TYPE,
  VOTER_TYPE,
  TRUSTEE_TYPE,
];

/**
 * This is a class that handles message id strings.
 */
export class MessageIdentifier {
  /**
   * Parses a message id string into a JS object.
   *
   * @param {String} messageId - A string with a message id.
   * @returns {Object} - An object with the message id values.
   */
  static parse(messageId) {
    const [elements, author] = messageId.split("+");
    const [authority, electionId, type, subtype] = elements.split(".", 4);
    const [authorType, authorId] = author.split(".", 2);
    const dotSubtype = subtype ? `.${subtype}` : "";

    if (!VALID_TYPES.includes(authorType)) {
      throw new Error("Invalid message identifier format");
    }

    return {
      electionId: `${authority}.${electionId}`,
      type,
      subtype,
      typeSubtype: `${type}${dotSubtype}`,
      author: {
        type: authorType,
        id: authorId,
      },
    };
  }

  static format(electionId, typeSubtype, authorType, authorId) {
    return `${electionId}.${typeSubtype}+${authorType}.${authorId}`;
  }
}

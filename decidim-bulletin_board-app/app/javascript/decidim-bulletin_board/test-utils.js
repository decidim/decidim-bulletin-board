import { AUTHORITY_TYPE } from "./client/message-identifier";

export function buildMessageIdentifier(typeSubtype) {
  const [type, subtype] = typeSubtype.split(".");

  return {
    electionId: "decidim-barcelona.1",
    type: type,
    subtype: subtype,
    typeSubtype: typeSubtype,
    author: {
      type: AUTHORITY_TYPE,
      id: "decidim-barcelona",
    },
  };
}

export function buildMessageId(typeSubtype) {
  return `decidim-barcelona.1.${typeSubtype}+a.decidim-barcelona`;
}

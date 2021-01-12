export function buildMessageId(typeSubtype) {
  return `decidim-barcelona.1.${typeSubtype}+a.decidim-barcelona`;
}

export function parseMessageId(messageId) {
  return messageId.split("+")[0].split(".", 4).slice(2, 4).join(".");
}

import jose from "node-jose";

export const parseBase64 = (data) => {
  if (typeof data === "number") {
    return data.toString();
  }
  const buf = jose.util.base64url.decode(data);
  let result = 0n;
  for (const value of buf.values()) {
    result = (result << 8n) | BigInt(value);
  }
  return result.toString();
};

export function samePublicKeys(key1, key2) {
  const jwk1 = typeof key1 === "string" ? JSON.parse(key1) : key1;
  const jwk2 = typeof key2 === "string" ? JSON.parse(key2) : key2;

  if (jwk1 && jwk2) {
    const { n: n1, e: e1, kty: kty1 } = jwk1;
    const { n: n2, e: e2, kty: kty2 } = jwk2;

    return n1 === n2 && e1 === e2 && kty1 === kty2;
  }
  return false;
}

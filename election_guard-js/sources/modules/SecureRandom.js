import * as bigInt from './BigInteger.js';

// Returns a secure random number below n
export const randomBelow = (n, bytes_number = 32) => {
    const randomNumbers = Array.from(crypto.getRandomValues(new Uint8Array(bytes_number)));
    const resultStr = randomNumbers.map(elem => elem.toString(16).padStart(2, "0")).join("")
    const result = bigInt(resultStr, 16);

    if (result.lesser(n)) {
        return result;
    }

    return randomBelow(n, bits);
}
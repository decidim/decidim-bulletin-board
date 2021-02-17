import jsSHA from 'jssha';

class Sha256 {
    constructor() {
        this.sha = new jsSHA("SHA-256", "TEXT", { encoding: "UTF8" });
    }

    py_update(str) {
        this.sha.update(str);
    }

    digest() {
        return this.sha.getHash("HEX");
    }
}

export const sha256 = () => {
    return new Sha256();
}
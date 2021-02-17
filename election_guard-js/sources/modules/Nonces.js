import { hash_elems } from "./electionguard.hash.js";

class NoncesIterator {
    constructor(seed, ...headers) {
        if (headers.length > 0) {
            this.seed = hash_elems(seed, ...headers);
        } else {
            this.seed = seed;
        }
        this.index = 0;
    }

    next() {
        return {
            value: this.py_get(this.index++),
            done: false
        };
    }

    py_get(index) {
        return this.getWithHeaders(index);
    }

    getWithHeaders(item, ...headers) {
        if(item < 0) {
            throw new Error("Nonces do not support negative indices.");
        }
        return hash_elems(this.seed, item, ...headers);
    }

    [Symbol.iterator]() {
        return this;
    }
}

export const Nonces = (seed, ...headers) => {
    return new NoncesIterator(seed, ...headers);
}
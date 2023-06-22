import {base58} from 'base-x';
import * as secp256k1 from '@noble/secp256k1';
import {type Hashable} from './HashMap';

export class Key implements Hashable {
	buffer: Uint8Array;
	encoded: string;

	constructor(key: Uint8Array | string) {
		if (typeof key === 'string') {
			this.buffer = base58.decode(key);
			this.encoded = key;
		} else {
			this.buffer = key;
			this.encoded = base58.encode(key);
		}
	}

	hashCode(): string {
		return this.encoded;
	}

	toString(): string {
		return this.encoded;
	}

	clone(): Key {
		return new Key(this.buffer);
	}
}

export function generateKeyPair() {
	const privateKey = new Key(secp256k1.utils.randomPrivateKey());
	const publicKey = new Key(secp256k1.getPublicKey(privateKey.buffer, true));
	return {privateKey, publicKey};
}

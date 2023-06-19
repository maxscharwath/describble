import * as secp256k1 from '@noble/secp256k1';
import {sha256} from '@noble/hashes/sha256';
import {base58} from 'base-x';

export class Deferred<T> {
	resolve!: (value: T) => void;
	reject!: (reason?: any) => void;
	promise: Promise<T>;

	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	public attach(promise: Promise<T>) {
		promise.then(this.resolve).catch(this.reject);
		return this;
	}
}

export async function createSignature(data: Uint8Array, privateKey: Uint8Array) {
	const hashedData = sha256(data);
	const signature = await secp256k1.signAsync(hashedData, privateKey);
	return signature.toCompactRawBytes();
}

export function verifySignature(challenge: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) {
	const hashedChallenge = sha256(challenge);
	return secp256k1.verify(signature, hashedChallenge, publicKey);
}

export type PublicKey = Uint8Array | string;

/**
 * Helper for public key operations
 */
export const PublicKeyHelper = {
	/**
	 * Parses a public key.
	 * If the key is a string, it's decoded from base58,
	 * otherwise the original Uint8Array is returned.
	 * @param publicKey - The public key to parse
	 */
	parse: (publicKey: PublicKey): Uint8Array =>
		typeof publicKey === 'string' ? base58.decode(publicKey) : publicKey,

	/**
	 * Encodes a public key.
	 * If the key is a string, it's returned as is,
	 * otherwise it's encoded to base58.
	 * @param publicKey - The public key to encode
	 */
	encode(publicKey: PublicKey): string {
		return typeof publicKey === 'string' ? publicKey : base58.encode(publicKey);
	},
};


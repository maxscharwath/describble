import * as secp256k1 from '@noble/secp256k1';
import {sha256} from '@noble/hashes/sha256';

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

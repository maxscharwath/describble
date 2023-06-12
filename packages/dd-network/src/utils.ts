import * as secp256k1 from '@noble/secp256k1';
import * as bs58 from 'bs58';
import {sha256} from '@noble/hashes/sha256';

export function generateKeys() {
	const privateKey = secp256k1.utils.randomPrivateKey();
	const publicKey = secp256k1.getPublicKey(privateKey, true);
	return {privateKey, publicKey};
}

export function toBase58(buffer: Uint8Array) {
	return bs58.encode(buffer);
}

export function fromBase58(base58: string) {
	return new Uint8Array(bs58.decode(base58));
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

import * as bs58 from 'bs58';

export async function generateKeys() {
	return crypto.subtle.generateKey(
		{
			name: 'ECDSA',
			namedCurve: 'P-256', // Select the elliptic curve, you can use other curves like "P-384" or "P-521"
			hash: {name: 'SHA-256'}, // Use SHA-256 for hashing
		},
		true, // The keys can be exported
		['sign', 'verify'], // Possible uses for the keys
	);
}

export async function exportPublicKey(publicKey: CryptoKey) {
	return crypto.subtle.exportKey('spki', publicKey);
}

export async function importPublicKey(publicKey: ArrayBuffer) {
	return crypto.subtle.importKey(
		'spki',
		publicKey,
		{
			name: 'ECDSA',
			namedCurve: 'P-256', // Same as "generateKey"
		},
		true,
		['verify'], // "verify" for public key import, "sign" for private key imports
	);
}

export async function createAddress(publicKey: CryptoKey) {
	const spkiKey = await crypto.subtle.exportKey('spki', publicKey);
	return crypto.subtle.digest('SHA-256', spkiKey);
}

export function toBase58(buffer: ArrayBuffer) {
	return bs58.encode(new Uint8Array(buffer));
}

export async function signChallenge(challenge: Uint8Array, privateKey: CryptoKey) {
	return crypto.subtle.sign(
		{name: 'ECDSA', hash: {name: 'SHA-256'}},
		privateKey,
		challenge,
	);
}

export async function verifySignature(challenge: Uint8Array, signature: ArrayBuffer, publicKey: CryptoKey) {
	return crypto.subtle.verify(
		{name: 'ECDSA', hash: {name: 'SHA-256'}},
		publicKey,
		signature,
		challenge,
	);
}

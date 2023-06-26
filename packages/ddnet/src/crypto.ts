import * as secp256k1 from '@noble/secp256k1';
import {hkdf} from '@noble/hashes/hkdf';
import {sha256} from '@noble/hashes/sha256';

export {sha256} from '@noble/hashes/sha256';
export {generateMnemonic, mnemonicToSeedSync} from 'bip39';

/**
 * Generates a new private key.
 */
export function generatePrivateKey(seed?: Uint8Array) {
	return seed
		? secp256k1.etc.hashToPrivateKey(seed)
		: secp256k1.utils.randomPrivateKey();
}

/**
 * Gets the public key from a private key.
 * @param privateKey - The private key to get the public key from.
 * @returns The public key.
 */
export function getPublicKey(privateKey: Uint8Array) {
	return secp256k1.getPublicKey(privateKey, true);
}

/**
 * Generates a new key pair.
 * @returns An object containing the privateKey and publicKey.
 */
export function generateKeyPair(seed?: Uint8Array) {
	const privateKey = generatePrivateKey(seed); // Generate a new private key.
	const publicKey = getPublicKey(privateKey); // Generate the corresponding public key.
	return {privateKey, publicKey};
}

/**
 * Generates an AES key based on the provided private key, public key and an optional salt.
 * @param privateKey - The private key used in the generation of the AES key.
 * @param publicKey - The public key used in the generation of the AES key.
 * @param salt - An optional salt to add randomness to the generation of the AES key.
 * @returns A Promise that resolves with the generated AES key.
 */
export async function generateAESKey(privateKey: Uint8Array, publicKey: Uint8Array, salt?: Uint8Array | string) {
	const secret = secp256k1.getSharedSecret(privateKey, publicKey); // Compute the shared secret.
	// Import the key derived from the secret into a usable format for AES-GCM.
	return crypto.subtle.importKey(
		'raw',
		hkdf(sha256, secret, salt, undefined, 32), // Use HKDF to derive a key from the secret.
		{name: 'AES-GCM'},
		false,
		['encrypt', 'decrypt'],
	);
}

/**
 * Encrypts a message using the provided private key, public key and the AES-GCM mode.
 * @param data - The data to be encrypted.
 * @param privateKey - The private key used in the encryption.
 * @param publicKey - The public key used in the encryption.
 * @returns A Promise that resolves with the encrypted data.
 */
export async function encryptMessage(data: Uint8Array, privateKey: Uint8Array, publicKey: Uint8Array) {
	const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a new random initialization vector (IV).
	const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a new random salt.
	const key = await generateAESKey(privateKey, publicKey, salt); // Generate an AES key.
	const ciphertext = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, data)); // Encrypt the data.
	const result = new Uint8Array(iv.length + salt.length + ciphertext.length);
	result.set(iv, 0);
	result.set(salt, iv.length);
	result.set(ciphertext, iv.length + salt.length);
	return result;
}

/**
 * Decrypts a message using the provided private key, public key and the AES-GCM mode.
 * @param data - The data to be decrypted.
 * @param privateKey - The private key used in the decryption.
 * @param publicKey - The public key used in the decryption.
 * @returns A Promise that resolves with the decrypted data.
 */
export async function decryptMessage(data: Uint8Array, privateKey: Uint8Array, publicKey: Uint8Array) {
	const iv = data.subarray(0, 12); // Extract the IV from the data.
	const salt = data.subarray(12, 28); // Extract the salt from the data.
	const ciphertext = data.subarray(28); // Extract the ciphertext from the data.
	const key = await generateAESKey(privateKey, publicKey, salt); // Generate an AES key.
	return new Uint8Array(await crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, ciphertext)); // Decrypt the data.
}

/**
 * Creates a signature for the provided message using the provided private key.
 * The message is hashed using SHA-256 before being signed.
 * @param message - The non-hashed message to be signed.
 * @param privateKey - The private key used in the signing.
 */
export async function createSignature(message: Uint8Array, privateKey: Uint8Array) {
	return (await secp256k1.signAsync(sha256(message), privateKey)).toCompactRawBytes();
}

/**
 * Verifies the provided signature for the provided message using the provided public key.
 * The message is hashed using SHA-256 before being verified.
 * @param message - The non-hashed message that was signed.
 * @param signature - The signature to be verified.
 * @param publicKey - The public key used in the verification.
 */
export function verifySignature(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) {
	return secp256k1.verify(signature, sha256(message), publicKey);
}

/**
 * Checks if the provided buffers are equal.
 * @param a - The first Uint8Array.
 * @param b - The second Uint8Array.
 */
export function uint8ArrayEquals(a: Uint8Array, b: Uint8Array) {
	return b.byteLength === a.byteLength
		? a.every((value, index) => value === b[index])
		: false;
}

export function mergeUint8Arrays(arrays: Uint8Array[]) {
	const result = new Uint8Array(arrays.reduce((a, b) => a + b.byteLength, 0));
	let offset = 0;
	for (const array of arrays) {
		result.set(array, offset);
		offset += array.length;
	}

	return result;
}

export function sha256Some(...data: Uint8Array[]) {
	return sha256(mergeUint8Arrays(data));
}

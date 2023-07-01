import * as secp256k1 from '@noble/secp256k1';
import {hkdf} from '@noble/hashes/hkdf';
import {sha256} from '@noble/hashes/sha256';
import {hmac} from '@noble/hashes/hmac';

export {sha256} from '@noble/hashes/sha256';
export {generateMnemonic, mnemonicToSeedSync} from 'srp';
export {bytesToHex, hexToBytes} from '@noble/hashes/utils';

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
 * Generates a new AES key based on the provided secret and salt.
 * @param secret - The secret used in the generation of the AES key.
 * @param salt - An optional salt to add randomness to the generation of the AES key.
 */
export async function generateAESKey(secret: Uint8Array, salt?: Uint8Array | string) {
	return crypto.subtle.importKey(
		'raw',
		hkdf(sha256, secret, salt, undefined, 32), // Use HKDF to derive a key from the secret.
		{name: 'AES-GCM'},
		false,
		['encrypt', 'decrypt'],
	);
}

/**
 * Generates an AES key based on the provided private key, public key and an optional salt.
 * @param privateKey - The private key used in the generation of the AES key.
 * @param publicKey - The public key used in the generation of the AES key.
 * @param salt - An optional salt to add randomness to the generation of the AES key.
 * @returns A Promise that resolves with the generated AES key.
 */
export async function generateSharedAESKey(privateKey: Uint8Array, publicKey: Uint8Array, salt?: Uint8Array | string) {
	const secret = secp256k1.getSharedSecret(privateKey, publicKey); // Compute the shared secret.
	return generateAESKey(secret, salt); // Generate an AES key from the shared secret.
}

/**
 * Encrypts the provided data using the provided secret.
 * @param data - The data to be encrypted.
 * @param secret - The secret used in the encryption.
 * @returns A Promise that resolves with the encrypted data.
 */
export async function encryptData(data: Uint8Array, secret: Uint8Array) {
	return encrypt(data, async salt => generateAESKey(secret, salt)); // Encrypt the data.
}

/**
 * Decrypts the provided data using the provided secret.
 * @param data - The data to be decrypted.
 * @param secret - The secret used in the decryption.
 * @returns A Promise that resolves with the decrypted data.
 */
export async function decryptData(data: Uint8Array, secret: Uint8Array) {
	return decrypt(data, async salt => generateAESKey(secret, salt)); // Decrypt the data.
}

/**
 * Encrypts a message using the provided private key, public key and the AES-GCM mode.
 * @param data - The data to be encrypted.
 * @param privateKey - The private key used in the encryption.
 * @param publicKey - The public key used in the encryption.
 * @returns A Promise that resolves with the encrypted data.
 */
export async function encryptMessage(data: Uint8Array, privateKey: Uint8Array, publicKey: Uint8Array) {
	return encrypt(data, async salt => generateSharedAESKey(privateKey, publicKey, salt)); // Encrypt the data.
}

/**
 * Decrypts a message using the provided private key, public key and the AES-GCM mode.
 * @param data - The data to be decrypted.
 * @param privateKey - The private key used in the decryption.
 * @param publicKey - The public key used in the decryption.
 * @returns A Promise that resolves with the decrypted data.
 */
export async function decryptMessage(data: Uint8Array, privateKey: Uint8Array, publicKey: Uint8Array) {
	return decrypt(data, async salt => generateSharedAESKey(privateKey, publicKey, salt)); // Decrypt the data.
}

/**
 * Creates a signature for the provided message using the provided private key.
 * The message is hashed using SHA-256 before being signed.
 * @param message - The non-hashed message to be signed.
 * @param privateKey - The private key used in the signing.
 */
export function createSignature(message: Uint8Array, privateKey: Uint8Array) {
	return (secp256k1.sign(sha256(message), privateKey)).toCompactRawBytes();
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
export function bytesEquals(a: Uint8Array, b: Uint8Array) {
	return b.byteLength === a.byteLength
		? a.every((value, index) => value === b[index])
		: false;
}

/**
 * Merges the provided Uint8Arrays into a single Uint8Array.
 * @param arrays - The Uint8Arrays to be merged.
 * @returns The merged Uint8Array.
 */
export function concatBytes(arrays: Uint8Array[]) {
	const result = new Uint8Array(arrays.reduce((a, b) => a + b.byteLength, 0));
	let offset = 0;
	arrays.forEach(array => {
		result.set(array, offset);
		offset += array.byteLength;
	});
	return result;
}

/**
 * Hashes multiple Uint8Arrays using SHA-256.
 * @param data - The Uint8Arrays to be hashed.
 * @returns The hash.
 */
export function sha256Some(...data: Uint8Array[]) {
	return sha256(concatBytes(data));
}

async function encrypt(data: Uint8Array, key: (salt: Uint8Array) => PromiseLike<CryptoKey>) {
	const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a new random initialization vector (IV).
	const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a new random salt.
	const ciphertext = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv}, await key(salt), data)); // Encrypt the data.
	return concatBytes([iv, salt, ciphertext]); // Concatenate the IV, salt and ciphertext.
}

async function decrypt(data: Uint8Array, key: (salt: Uint8Array) => PromiseLike<CryptoKey>) {
	const iv = data.subarray(0, 12); // Extract the IV from the data.
	const salt = data.subarray(12, 28); // Extract the salt from the data.
	const ciphertext = data.subarray(28); // Extract the ciphertext from the data.
	return new Uint8Array(await crypto.subtle.decrypt({name: 'AES-GCM', iv}, await key(salt), ciphertext)); // Decrypt the data.
}

// Allow hmacSha256Sync
secp256k1.etc.hmacSha256Sync = (k, ...m) => hmac(sha256, k, concatBytes(m));

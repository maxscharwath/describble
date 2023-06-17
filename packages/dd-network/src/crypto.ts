import * as secp256k1 from '@noble/secp256k1';
import {hkdf} from '@noble/hashes/hkdf';
import {sha256} from '@noble/hashes/sha256';

/**
 * Generates an AES key using HKDF with a shared secret and a salt
 * @param privateKey The sender's private key
 * @param publicKey The recipient's public key
 * @param salt The salt to use for HKDF (optional)
 * @param extractable Whether the key should be extractable (default: false)
 */
export async function generateAESKey(privateKey: Uint8Array, publicKey: Uint8Array, salt?: Uint8Array | string, extractable = false) {
	const secret = secp256k1.getSharedSecret(privateKey, publicKey);
	return crypto.subtle.importKey(
		'raw',
		hkdf(sha256, secret, salt, undefined, 32),
		{name: 'AES-GCM'},
		extractable,
		['encrypt', 'decrypt'],
	);
}

/**
 * Encrypts a message using AES-GCM
 * @param data The data to encrypt
 * @param privateKey The sender's private key
 * @param publicKey The recipient's public key
 */
export async function encryptMessage(data: Uint8Array, privateKey: Uint8Array, publicKey: Uint8Array) {
	// Generate Initialization Vector (iv) and salt
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const salt = crypto.getRandomValues(new Uint8Array(16));

	// Generate the AES key from the public key and salt
	const key = await generateAESKey(privateKey, publicKey, salt);

	// Encrypt the data
	const ciphertext = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, data));
	// Prepare the result - concatenate iv, salt and ciphertext
	const result = new Uint8Array(iv.length + salt.length + ciphertext.length);
	result.set(iv, 0);
	result.set(salt, iv.length);
	result.set(ciphertext, iv.length + salt.length);

	return result;
}

/**
 * Decrypts the provided data using the given public key.
 *
 * @param data - The data to be decrypted, which includes the initialization vector (IV), salt, and the ciphertext.
 * @param privateKey - The private key of the recipient.
 * @param publicKey - The public key of the sender.
 *
 * @returns The decrypted message as a Uint8Array.
 */
export async function decryptMessage(data: Uint8Array, privateKey: Uint8Array, publicKey: Uint8Array) {
	// Extract the initialization vector (iv), salt, and ciphertext from the data
	const iv = data.subarray(0, 12);
	const salt = data.subarray(12, 28);
	const ciphertext = data.subarray(28);

	// Generate the AES key from the public key and salt
	const key = await generateAESKey(privateKey, publicKey, salt);

	// Decrypt the ciphertext and return the decrypted data
	return new Uint8Array(await crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, ciphertext));
}

// Import cryptographic and utility functions
import {sha256} from '@noble/hashes/sha256';
import {sha512} from '@noble/hashes/sha512';
import {pbkdf2, pbkdf2Async} from '@noble/hashes/pbkdf2';
import {randomBytes} from '@noble/hashes/utils';

// Import the wordlist for mnemonic generation and validation
import wordlist from './wordlist.json' assert { type: 'json' };

// Constant error messages
const INVALID_MNEMONIC = 'Invalid mnemonic';
const INVALID_ENTROPY = 'Invalid entropy';
const INVALID_CHECKSUM = 'Invalid mnemonic checksum';

// Text encoder for encoding strings into Uint8Array format
const textEncoder = new TextEncoder();

/**
 * Normalize a string using Unicode Normalization Form KC.
 */
function normalize(str = ''): string {
	return str.normalize('NFKD');
}

/**
 * Normalize the mnemonic and password inputs.
 */
function normalizeInputs(mnemonic: string, password = ''): [string, string] {
	const normalizedMnemonic = normalize(mnemonic);
	const normalizedPassword = normalize(password);
	return [normalizedMnemonic, normalizedPassword];
}

/**
 * Converts a binary string to a byte (number).
 */
function binaryToByte(bin: string): number {
	return parseInt(bin, 2);
}

/**
 * Converts an array of bytes to a binary string representation.
 */
function bytesToBinary(bytes: Uint8Array): string {
	return bytes.reduce((bin, byte) => bin + byte.toString(2).padStart(8, '0'), '');
}

/**
 * Derives the checksum bits from the given entropy bytes using the SHA256 hash function.
 */
function deriveChecksumBits(entropyBytes: Uint8Array): string {
	const ENT = entropyBytes.byteLength * 8;
	const CS = ENT / 32;
	const hash = sha256(entropyBytes);
	return bytesToBinary(hash).slice(0, CS);
}

/**
 * Generates a salt string by appending the word "mnemonic" to the provided password (if any).
 */
function salt(password = ''): string {
	return `mnemonic${password}`;
}

/**
 * Converts a mnemonic phrase and an optional password into a cryptographic seed using PBKDF2 with SHA512.
 * This is the synchronous version.
 */
export function mnemonicToSeedSync(mnemonic: string, password?: string): Uint8Array {
	const [normalizedMnemonic, normalizedPassword] = normalizeInputs(mnemonic, password);
	const mnemonicBuffer = textEncoder.encode(normalizedMnemonic);
	const saltBuffer = textEncoder.encode(salt(normalizedPassword));
	return pbkdf2(sha512, mnemonicBuffer, saltBuffer, {
		c: 2048,
		dkLen: 64,
	});
}

/**
 * Converts a mnemonic phrase and an optional password into a cryptographic seed using PBKDF2 with SHA512.
 * This is the asynchronous version.
 */
export async function mnemonicToSeed(mnemonic: string, password?: string): Promise<Uint8Array> {
	const [normalizedMnemonic, normalizedPassword] = normalizeInputs(mnemonic, password);
	const mnemonicBuffer = textEncoder.encode(normalizedMnemonic);
	const saltBuffer = textEncoder.encode(salt(normalizedPassword));
	return pbkdf2Async(sha512, mnemonicBuffer, saltBuffer, {
		c: 2048,
		dkLen: 64,
	});
}

/**
 * Converts a mnemonic phrase into its corresponding entropy value.
 */
export function mnemonicToEntropy(mnemonic: string): string {
	const words = normalize(mnemonic).split(' ');
	if (words.length % 3 !== 0) {
		throw new Error(INVALID_MNEMONIC);
	}

	// Convert word indices to 11-bit binary strings
	const bits = words.reduce(
		(bin, word) => {
			const index = wordlist.indexOf(word);
			if (index === -1) {
				throw new Error(INVALID_MNEMONIC);
			}

			return bin + index.toString(2).padStart(11, '0');
		},
		'');
	// Derive entropy and checksum bits
	const dividerIndex = Math.floor(bits.length / 33) * 32;
	const entropyBits = bits.slice(0, dividerIndex);
	const checksumBits = bits.slice(dividerIndex);

	// Calculate the checksum and compare
	const entropyBytes = entropyBits.match(/(.{1,8})/g)!.map(binaryToByte);
	if (entropyBytes.length < 16 || entropyBytes.length > 32 || entropyBytes.length % 4 !== 0) {
		throw new Error(INVALID_ENTROPY);
	}

	const entropy = new Uint8Array(entropyBytes);
	const newChecksum = deriveChecksumBits(entropy);
	if (newChecksum !== checksumBits) {
		throw new Error(INVALID_CHECKSUM);
	}

	return entropy.reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '');
}

/**
 * Converts an entropy value into its corresponding mnemonic phrase.
 */
export function entropyToMnemonic(entropy: Uint8Array | string): string {
	if (typeof entropy === 'string') {
		entropy = new Uint8Array(
			entropy.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)),
		);
	}

	if (entropy.length < 16 || entropy.length > 32 || entropy.length % 4 !== 0) {
		throw new TypeError(INVALID_ENTROPY);
	}

	const entropyBits = bytesToBinary(entropy);
	const checksumBits = deriveChecksumBits(entropy);

	const bits = entropyBits + checksumBits;
	const chunks = bits.match(/(.{1,11})/g)!;

	const words = chunks.map((binary: string): string => {
		const index = binaryToByte(binary);
		return wordlist[index];
	});

	return words.join(' ');
}

/**
 * Generates a mnemonic phrase with the given strength (in bits) using the provided random number generator (or a default one if none is provided).
 */
export function generateMnemonic(strength?: number, rng?: (size: number) => Uint8Array): string {
	strength = strength ?? 128;
	if (strength % 32 !== 0) {
		throw new TypeError(INVALID_ENTROPY);
	}

	rng = rng ?? (size => randomBytes(size));
	return entropyToMnemonic(rng(strength / 8));
}

/**
 * Validates a mnemonic phrase by attempting to convert it into entropy.
 * Returns true if the conversion is successful, false otherwise.
 */
export function validateMnemonic(mnemonic: string): boolean {
	try {
		mnemonicToEntropy(mnemonic);
	} catch (e) {
		return false;
	}

	return true;
}

/**
 * Validates a word against the wordlist.
 * @param word - The word to validate.
 */
export function validateWord(word: string): boolean {
	return wordlist.includes(word);
}

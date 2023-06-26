import {sha256} from '@noble/hashes/sha256';
import {sha512} from '@noble/hashes/sha512';
import {pbkdf2, pbkdf2Async} from '@noble/hashes/pbkdf2';
import {randomBytes} from '@noble/hashes/utils';
import wordlist from './wordlist.json' assert { type: 'json' };

const INVALID_MNEMONIC = 'Invalid mnemonic';
const INVALID_ENTROPY = 'Invalid entropy';
const INVALID_CHECKSUM = 'Invalid mnemonic checksum';

/**
 * Normalizes a string by removing diacritical marks and converting it to a standardized form.
 */
function normalize(str?: string): string {
	return (str ?? '').normalize('NFKD');
}

/**
 * Pads a string on the left with a specified pad string until it reaches the desired length.
 */
function lpad(str: string, padString: string, length: number): string {
	while (str.length < length) {
		str = padString + str;
	}

	return str;
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
	return bytes.reduce(
		(bin: string, byte: number): string => bin + lpad(byte.toString(2), '0', 8),
		'',
	);
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
function salt(password?: string): string {
	return 'mnemonic' + (password ?? '');
}

/**
 * Converts a mnemonic phrase and an optional password into a cryptographic seed using PBKDF2 with SHA512.
 * This is the synchronous version.
 */
export function mnemonicToSeedSync(
	mnemonic: string,
	password?: string,
): Uint8Array {
	const mnemonicBuffer = new TextEncoder().encode(normalize(mnemonic));
	const saltBuffer = new TextEncoder().encode(salt(normalize(password)));
	return pbkdf2(sha512, mnemonicBuffer, saltBuffer, {
		c: 2048,
		dkLen: 64,
	});
}

/**
 * Converts a mnemonic phrase and an optional password into a cryptographic seed using PBKDF2 with SHA512.
 * This is the asynchronous version.
 */
export async function mnemonicToSeed(
	mnemonic: string,
	password?: string,
): Promise<Uint8Array> {
	const mnemonicBuffer = new TextEncoder().encode(normalize(mnemonic));
	const saltBuffer = new TextEncoder().encode(salt(normalize(password)));
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
	const bits = words
		.map((word: string): string => {
			const index = wordlist.indexOf(word);
			if (index === -1) {
				throw new Error(INVALID_MNEMONIC);
			}

			return lpad(index.toString(2), '0', 11);
		})
		.join('');

	// Split the binary string into ENT/CS
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

	return Array.from(entropy)
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Converts an entropy value (either as a Uint8Array or a hexadecimal string) into a mnemonic phrase.
 */
export function entropyToMnemonic(entropy: Uint8Array | string): string {
	if (typeof entropy === 'string') {
		entropy = new Uint8Array(
			entropy.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)),
		);
	}

	// 128 <= ENT <= 256
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

	return wordlist[0] === '\u3042\u3044\u3053\u304f\u3057\u3093' // Japanese wordlist
		? words.join('\u3000')
		: words.join(' ');
}

/**
 * Generates a new mnemonic phrase of the specified strength (in bits).
 * It uses a random number generator function (rng) to generate the entropy.
 */
export function generateMnemonic(
	strength?: number,
	rng?: (size: number) => Uint8Array,
): string {
	strength = strength ?? 128;
	if (strength % 32 !== 0) {
		throw new TypeError(INVALID_ENTROPY);
	}

	rng = rng ?? ((size: number): Uint8Array => randomBytes(size));
	return entropyToMnemonic(rng(strength / 8));
}

/**
 * Validates a mnemonic phrase by attempting to convert it into entropy and checking for any errors.
 */
export function validateMnemonic(mnemonic: string): boolean {
	try {
		mnemonicToEntropy(mnemonic);
	} catch (e) {
		return false;
	}

	return true;
}

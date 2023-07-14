import {decode, encode} from 'cbor-x';
import {
	concatBytes,
	createSignature,
	getPublicKey,
	sha256Some,
	bytesEquals,
	verifySignature,
	validatePublicKey,
} from '../crypto';
import {v4 as uuidv4} from 'uuid';
import {base58} from '@describble/base-x';
import {UnauthorizedAccessError, DocumentValidationError} from './errors';

/** Define the shape of the document header data */
export type DocumentHeaderData = {id: Uint8Array; owner: Uint8Array; allowedClients: Uint8Array[]; version: number};

/** Define a type for keys, which could be either Uint8Array or a string */
type Key = Uint8Array | string;

/**
 * Helper function to convert a key to Uint8Array if it's a string.
 * @param value - The value that should be converted to a Uint8Array
 * @returns The value as a Uint8Array
 */
const toUint8Array = (value: Key) => typeof value === 'string' ? base58.decode(value) : value;

/** Class representing a Document Header */
export class DocumentHeader {
	readonly #data: DocumentHeaderData;
	readonly #signature: Uint8Array;
	readonly #address: Uint8Array;

	/**
	 * DocumentHeader constructor.
	 * @param data - The document header data
	 * @param signature - The signature for the document header
	 * @throws {DocumentValidationError} When the document header signature is invalid
	 */
	private constructor(data: DocumentHeaderData, signature: Uint8Array) {
		if (!verifySignature(encode(data), signature, data.owner)) {
			throw new DocumentValidationError('Invalid document header signature.');
		}

		this.#data = data;
		this.#address = sha256Some(this.#data.id, this.#data.owner);
		this.#signature = signature;
	}

	/**
	 * Creates a new DocumentHeader with the provided allowed client keys.
	 * @param allowedClientKeys - An array of allowed client keys
	 * @param privateKey - The private key of the owner
	 * @returns A new DocumentHeader instance with the updated allowed clients
	 * @throws {UnauthorizedAccessError} When the private key provided does not match the document owner's key
	 */
	public withAllowedClients(allowedClientKeys: Key[], privateKey: Key): DocumentHeader {
		privateKey = toUint8Array(privateKey);

		if (!bytesEquals(getPublicKey(privateKey), this.#data.owner) || !verifySignature(encode(this.#data), this.#signature, this.#data.owner)) {
			throw new UnauthorizedAccessError('Only the document owner can update the allowed users list.');
		}

		// Build a new list of allowed clients, validating each client key
		const allowedClients = allowedClientKeys.reduce<Uint8Array[]>((acc, client) => {
			const publicKey = toUint8Array(client);
			if (validatePublicKey(publicKey) && acc.findIndex(c => bytesEquals(c, publicKey)) === -1) {
				acc.push(publicKey);
			}

			return acc;
		}, []);

		// Create a new DocumentHeaderData with the new allowed clients list and an incremented version
		const data: DocumentHeaderData = {
			...this.#data,
			allowedClients,
			version: this.#data.version + 1,
		};

		// Create a new signature for the updated data
		const signature = createSignature(encode(data), privateKey);

		// Return a new DocumentHeader instance with the updated data and signature
		return new DocumentHeader(data, signature);
	}

	/**
	 * Checks if a user is allowed to access the document.
	 * @param publicKey - The public key of the user
	 * @returns true if the user is allowed, false otherwise
	 */
	public hasAllowedUser(publicKey: Key): boolean {
		const key = toUint8Array(publicKey);
		return this.#data.allowedClients.some(client => bytesEquals(client, key)) || bytesEquals(this.#data.owner, key);
	}

	/**
	 * Getter for the document address.
	 * @returns An object containing the address as bytes and as a base58 string
	 */
	public get address(): {bytes: Uint8Array; base58: string} {
		return {
			bytes: new Uint8Array(this.#address),
			base58: base58.encode(this.#address),
		};
	}

	/**
	 * Getter for the document ID.
	 * @returns The document ID as a Uint8Array
	 */
	public get id(): Uint8Array {
		return new Uint8Array(this.#data.id);
	}

	/**
	 * Getter for the document owner.
	 * @returns An object containing the owner's public key as bytes and as a base58 string
	 */
	public get owner(): {bytes: Uint8Array; base58: string} {
		return {
			bytes: new Uint8Array(this.#data.owner),
			base58: base58.encode(this.#data.owner),
		};
	}

	/**
	 * Getter for the document's allowed clients.
	 * @returns An array of objects, each containing a client's public key as bytes and as a base58 string
	 */
	public get allowedClients(): Array<{bytes: Uint8Array; base58: string}> {
		return this.#data.allowedClients.map(client => ({
			bytes: new Uint8Array(client),
			base58: base58.encode(client),
		}));
	}

	/**
	 * Getter for the document's version.
	 * @returns The version of the document
	 */
	public get version(): number {
		return this.#data.version;
	}

	/**
	 * Getter for the document's signature.
	 * @returns An object containing the signature as bytes and as a base58 string
	 */
	public get signature(): {bytes: Uint8Array; base58: string} {
		return {
			bytes: new Uint8Array(this.#signature),
			base58: base58.encode(this.#signature),
		};
	}

	/**
	 * Verifies the signature of the provided content with the document owner's public key.
	 * @param content - The content to verify
	 * @param signature - The signature to verify
	 * @returns true if the signature is valid, false otherwise
	 */
	public verifySignature(content: Uint8Array, signature: Uint8Array): boolean {
		return verifySignature(content, signature, this.#data.owner) || this.#data.allowedClients.some(client => verifySignature(content, signature, client));
	}

	/**
	 * Exports the document header.
	 * @returns The document header as a Uint8Array
	 * @throws {DocumentValidationError} When the document header signature is invalid
	 */
	public export(): Uint8Array {
		const data = encode(this.#data);
		if (!verifySignature(data, this.#signature, this.#data.owner)) {
			throw new DocumentValidationError('Invalid document header signature.');
		}

		// Return the signature followed by the data
		return concatBytes([this.#signature, data]);
	}

	/**
	 * Creates a new DocumentHeader.
	 * @param privateKey - The private key of the document owner
	 * @param allowedClientKeys - An array of allowed client keys
	 * @returns A new DocumentHeader instance
	 */
	public static create(privateKey: Key, allowedClientKeys: Key[] = []): DocumentHeader {
		privateKey = toUint8Array(privateKey);
		const publicKey = getPublicKey(privateKey);

		// Build a new list of allowed clients, validating each client key
		const allowedClients = allowedClientKeys.reduce<Uint8Array[]>((acc, client) => {
			const key = toUint8Array(client);
			if (validatePublicKey(key) && acc.findIndex(c => bytesEquals(c, key)) === -1) {
				acc.push(key);
			}

			return acc;
		}, []);

		// Create a new DocumentHeaderData with a generated UUID as the id
		const data: DocumentHeaderData = {
			id: uuidv4({}, new Uint8Array(16)),
			owner: publicKey,
			allowedClients,
			version: 1,
		};

		// Create a new signature for the data
		const signature = createSignature(encode(data), privateKey);

		// Return a new DocumentHeader instance
		return new DocumentHeader(data, signature);
	}

	/**
	 * Imports a DocumentHeader from a Uint8Array.
	 * @param rawData - The raw data to import from
	 * @returns A new DocumentHeader instance
	 * @throws {DocumentValidationError} When the document header signature is invalid
	 */
	public static import(rawData: Uint8Array): DocumentHeader {
		// Slice the rawData into signature and data parts
		const signature = rawData.slice(0, 64);
		const data = decode(rawData.slice(64)) as DocumentHeaderData;

		// Return a new DocumentHeader with the parsed data and signature
		return new DocumentHeader(data, signature);
	}

	/**
	 * Checks if a new header is compatible with an old header.
	 * @param oldHeader - The old header
	 * @param newHeader - The new header
	 */
	public static isCompatible(oldHeader: DocumentHeader, newHeader: DocumentHeader): string | null {
		// Ensure the old and new headers have the same owner
		if (!bytesEquals(oldHeader.owner.bytes, newHeader.owner.bytes)) {
			return 'Owners do not match';
		}

		// Ensure the old and new headers have the same ID
		if (!bytesEquals(oldHeader.id, newHeader.id)) {
			return 'IDs do not match';
		}

		// Ensure the new version is greater or equal to the old version
		if (newHeader.version < oldHeader.version) {
			return 'New version is less than old version';
		}

		// Ensure the new header's signature is valid
		if (!newHeader.verifySignature(encode(newHeader.#data), newHeader.#signature)) {
			return 'Invalid document header signature in new header';
		}

		return null;
	}

	/**
	 * Upgrade the document header to a new version.
	 * @param oldHeader - The old document header
	 * @param newHeader - The new document header
	 * @returns A new DocumentHeader instance
	 * @throws {DocumentValidationError} When the document header validation checks fail
	 */
	public static upgrade(oldHeader: DocumentHeader, newHeader: DocumentHeader): DocumentHeader {
		const error = DocumentHeader.isCompatible(oldHeader, newHeader);
		if (error) {
			throw new DocumentValidationError(error);
		}

		if (newHeader.version === oldHeader.version) {
			return newHeader;
		}

		// Return a new DocumentHeader instance with the new data and signature
		return new DocumentHeader(newHeader.#data, newHeader.#signature);
	}
}

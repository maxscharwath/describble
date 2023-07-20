import {decode, encode} from 'cbor-x';
import {concatBytes, createSignature, getPublicKey, sha256Some, bytesEquals, verifySignature, validatePublicKey} from '../crypto';
import {v4 as uuidv4} from 'uuid';
import {base58} from '@describble/base-x';
import {UnauthorizedAccessError, DocumentValidationError} from './errors';

export type DocumentHeaderData<TMetadata extends Metadata = Metadata> = {
	id: Uint8Array;
	owner: Uint8Array;
	allowedClients: Uint8Array[];
	version: number;
	metadata: TMetadata;
};

type Key = Uint8Array | string;

export type Metadata = Record<string, unknown>;

/**
 * Helper function to convert a key to Uint8Array if it's a string.
 * @param value - The value that should be converted to a Uint8Array
 * @returns The value as a Uint8Array
 */
const toUint8Array = (value: Key) => typeof value === 'string' ? base58.decode(value) : value;

/**
 * Helper function to validate and convert array of client keys.
 * @param allowedClientKeys - The array of allowed client keys
 * @returns The array of valid client keys in Uint8Array format
 */
const prepareAllowedClients = (allowedClientKeys: Key[]): Uint8Array[] => allowedClientKeys.reduce<Uint8Array[]>((acc, client) => {
	const publicKey = toUint8Array(client);
	if (validatePublicKey(publicKey) && acc.findIndex(c => bytesEquals(c, publicKey)) === -1) {
		acc.push(publicKey);
	}

	return acc;
}, []);

/**
 * DocumentHeader represents the header of a document.
 * It contains data such as the document ID, the document owner, allowed clients, the version, and metadata.
 */
export class DocumentHeader<TMetadata extends Metadata = Metadata> {
	public readonly address: {bytes: Uint8Array; base58: string};
	public readonly id: Uint8Array;
	public readonly owner: {bytes: Uint8Array; base58: string};
	public readonly allowedClients: ReadonlyArray<{base58: string; bytes: Uint8Array}>;
	public readonly version: number;
	public readonly signature: {bytes: Uint8Array; base58: string};
	public readonly metadata: TMetadata;

	readonly #data: DocumentHeaderData<TMetadata>;
	readonly #signature: Uint8Array;
	readonly #address: Uint8Array;

	private constructor(data: DocumentHeaderData<TMetadata>, signature: Uint8Array) {
		this.#data = data;
		this.#address = sha256Some(this.#data.id, this.#data.owner);
		this.#signature = signature;

		if (!verifySignature(encode(data), this.#signature, data.owner)) {
			throw new DocumentValidationError('Invalid document header signature.');
		}

		// Compute these fields in the constructor and freeze the objects
		this.address = Object.freeze({
			bytes: new Uint8Array(this.#address),
			base58: base58.encode(this.#address),
		});
		this.id = new Uint8Array(this.#data.id);
		this.owner = Object.freeze({
			bytes: new Uint8Array(this.#data.owner),
			base58: base58.encode(this.#data.owner),
		});
		this.allowedClients = Object.freeze(this.#data.allowedClients.map(client => ({
			bytes: new Uint8Array(client),
			base58: base58.encode(client),
		})));
		this.version = this.#data.version;
		this.signature = Object.freeze({
			bytes: new Uint8Array(this.#signature),
			base58: base58.encode(this.#signature),
		});
		this.metadata = Object.freeze(this.#data.metadata ?? {}) as TMetadata;
		Object.freeze(this);
	}

	/**
	 * Creates a new DocumentHeader with the provided metadata and allowed clients.
	 * @param options - The options for the document header.
	 * @param privateKey - The private key of the document owner
	 */
	public update(options: Partial<{metadata: TMetadata; allowedClientKeys: Key[]}>, privateKey: Key): DocumentHeader<TMetadata> {
		this.verifyOwnerPrivateKey(toUint8Array(privateKey));
		const data: DocumentHeaderData<TMetadata> = {
			...this.#data,
			allowedClients: prepareAllowedClients(options.allowedClientKeys ?? this.#data.allowedClients),
			metadata: options.metadata ?? this.#data.metadata,
			version: this.#data.version + 1,
		};
		const signature = createSignature(encode(data), toUint8Array(privateKey));
		return new DocumentHeader<TMetadata>(data, signature);
	}

	/**
	 * Checks if a user is allowed to access this document.
	 * @param publicKey - The public key of the user
	 */
	public hasAllowedUser(publicKey: Key): boolean {
		const key = toUint8Array(publicKey);
		return this.#data.allowedClients.some(client => bytesEquals(client, key)) || bytesEquals(this.#data.owner, key);
	}

	/**
	 * Verifies the signature of a content.
	 * @param content - The content to verify the signature of
	 * @param signature - The signature of the content
	 */
	public verifySignature(content: Uint8Array, signature: Uint8Array): boolean {
		return verifySignature(content, signature, this.#data.owner) || this.#data.allowedClients.some(client => verifySignature(content, signature, client));
	}

	/**
	 * Exports the DocumentHeader as a Uint8Array.
	 */
	public export(): Uint8Array {
		const data = encode(this.#data);
		if (!verifySignature(data, this.signature.bytes, this.#data.owner)) {
			throw new DocumentValidationError('Invalid document header signature.');
		}

		return concatBytes([this.signature.bytes, data]);
	}

	/**
	 * Helper function to verify the owner's private key.
	 * @param privateKey - The private key of the document owner
	 * @throws {UnauthorizedAccessError} When the private key provided does not match the document owner's key
	 */
	private verifyOwnerPrivateKey(privateKey: Uint8Array) {
		if (!bytesEquals(getPublicKey(privateKey), this.#data.owner) || !verifySignature(encode(this.#data), this.#signature, this.#data.owner)) {
			throw new UnauthorizedAccessError('Only the document owner can update.');
		}
	}

	/**
	 * Creates a new instance of DocumentHeader with the provided private key, allowed clients and metadata
	 * @param privateKey - The private key of the document owner
	 * @param allowedClientKeys - The array of allowed client keys
	 * @param metadata - The metadata of the document
	 */
	public static create<TMetadata extends Metadata = Metadata>(privateKey: Key, allowedClientKeys: Key[] = [], metadata = {} as TMetadata): DocumentHeader<TMetadata> {
		const publicKey = getPublicKey(toUint8Array(privateKey));
		const data: DocumentHeaderData<TMetadata> = {
			id: uuidv4({}, new Uint8Array(16)),
			owner: publicKey,
			allowedClients: prepareAllowedClients(allowedClientKeys),
			version: 1,
			metadata,
		};
		const signature = createSignature(encode(data), toUint8Array(privateKey));
		return new DocumentHeader<TMetadata>(data, signature);
	}

	/**
	 * Constructs a DocumentHeader instance from the binary data.
	 * @param binary The binary data to create the document header with.
	 * @returns The newly created DocumentHeader instance.
	 */
	public static import<TMetadata extends Metadata = Metadata>(binary: Uint8Array): DocumentHeader<TMetadata> {
		const signature = binary.slice(0, 64);
		const data = decode(binary.slice(64)) as DocumentHeaderData<TMetadata>;

		return new DocumentHeader<TMetadata>(data, signature);
	}

	/**
	 * Upgrades a DocumentHeader to a new version.
	 * @param oldHeader - The old version of the DocumentHeader
	 * @param newHeader - The new version of the DocumentHeader
	 */
	public static upgrade<TMetadata extends Metadata = Metadata>(oldHeader: DocumentHeader<TMetadata>, newHeader: DocumentHeader<TMetadata>): DocumentHeader<TMetadata> {
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

	/**
	 * Checks if the oldHeader and newHeader are compatible.
	 * @param oldHeader - The old version of the DocumentHeader
	 * @param newHeader - The new version of the DocumentHeader
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
}

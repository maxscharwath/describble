import {decode, encode} from 'cbor-x';
import {concatBytes, createSignature, getPublicKey, sha256Some, bytesEquals, verifySignature} from '../crypto';
import {v4 as uuidv4} from 'uuid';
import {DocumentValidationError, UnauthorizedAccessError} from './Document';
import {base58} from 'base-x';

export type DocumentHeaderData = {id: Uint8Array; owner: Uint8Array; allowedClients: Uint8Array[]; version: number};

export class DocumentHeader {
	#data: DocumentHeaderData;
	#signature: Uint8Array;
	readonly #address: Uint8Array;

	private constructor(data: DocumentHeaderData, signature: Uint8Array) {
		if (!verifySignature(encode(data), signature, data.owner)) {
			throw new DocumentValidationError('Invalid document header signature.');
		}

		this.#data = data;
		this.#address = sha256Some(this.#data.id, this.#data.owner);
		this.#signature = signature;
	}

	public setAllowedClients(allowedClients: Uint8Array[], privateKey: Uint8Array) {
		if (!bytesEquals(getPublicKey(privateKey), this.#data.owner) || !verifySignature(encode(this.#data), this.#signature, this.#data.owner)) {
			throw new UnauthorizedAccessError('Only the document owner can update the allowed users list.');
		}

		allowedClients = allowedClients.filter((client, index) => allowedClients.findIndex(c => bytesEquals(c, client)) === index);

		const data = {
			...this.#data,
			allowedClients,
			version: this.#data.version + 1,
		} satisfies DocumentHeaderData;

		this.#signature = createSignature(encode(data), privateKey);
		this.#data = data;
	}

	public addAllowedClient(allowedClient: Uint8Array | string, privateKey: Uint8Array) {
		return this.setAllowedClients([
			...this.#data.allowedClients,
			typeof allowedClient === 'string' ? base58.decode(allowedClient) : allowedClient,
		], privateKey);
	}

	public hasAllowedUser(publicKey: Uint8Array): boolean {
		return this.#data.allowedClients.some(client => bytesEquals(client, publicKey)) || bytesEquals(this.#data.owner, publicKey);
	}

	public get address(): Uint8Array {
		return new Uint8Array(this.#address);
	}

	public get id(): Uint8Array {
		return new Uint8Array(this.#data.id);
	}

	public get owner(): {bytes: Uint8Array; base58: string} {
		return {
			bytes: new Uint8Array(this.#data.owner),
			base58: base58.encode(this.#data.owner),
		};
	}

	public get allowedClients(): Array<{bytes: Uint8Array; base58: string}> {
		return this.#data.allowedClients.map(client => ({
			bytes: new Uint8Array(client),
			base58: base58.encode(client),
		}));
	}

	public get version(): number {
		return this.#data.version;
	}

	public verifySignature(content: Uint8Array, signature: Uint8Array): boolean {
		return verifySignature(content, signature, this.#data.owner) || this.#data.allowedClients.some(client => verifySignature(content, signature, client));
	}

	public export(): Uint8Array {
		const data = encode(this.#data);
		if (!verifySignature(data, this.#signature, this.#data.owner)) {
			throw new DocumentValidationError('Invalid document header signature.');
		}

		return concatBytes([this.#signature, data]);
	}

	public static create(privateKey: Uint8Array, allowedClients: Uint8Array[] = []): DocumentHeader {
		const data: DocumentHeaderData = {
			id: uuidv4({}, new Uint8Array(16)),
			owner: getPublicKey(privateKey),
			allowedClients,
			version: 1,
		};

		const signature = createSignature(encode(data), privateKey);

		return new DocumentHeader(data, signature);
	}

	public static import(rawData: Uint8Array): DocumentHeader {
		const signature = rawData.slice(0, 64);
		const data = decode(rawData.slice(64)) as DocumentHeaderData;

		return new DocumentHeader(data, signature);
	}

	public static upgrade(oldHeader: DocumentHeader, newHeader: DocumentHeader): DocumentHeader {
		// Ensure the old and new headers have the same owner
		if (!bytesEquals(oldHeader.owner.bytes, newHeader.owner.bytes)) {
			throw new DocumentValidationError('Owners do not match.');
		}

		// Ensure the old and new headers have the same ID
		if (!bytesEquals(oldHeader.id, newHeader.id)) {
			throw new DocumentValidationError('IDs do not match.');
		}

		// Ensure the new version is higher
		if (newHeader.version <= oldHeader.version) {
			throw new DocumentValidationError('New version must be higher.');
		}

		// Ensure the new header's signature is valid
		if (!newHeader.verifySignature(encode(newHeader.#data), newHeader.#signature)) {
			throw new DocumentValidationError('Invalid document header signature in new header.');
		}

		return newHeader;
	}

	public static merge(oldHeader: DocumentHeader, newHeader: DocumentHeader): DocumentHeader {
		try {
			return DocumentHeader.upgrade(oldHeader, newHeader);
		} catch {
			return oldHeader;
		}
	}
}

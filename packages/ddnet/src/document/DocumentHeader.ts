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
import {DocumentValidationError, UnauthorizedAccessError} from './Document';
import {base58} from 'base-x';

export type DocumentHeaderData = {id: Uint8Array; owner: Uint8Array; allowedClients: Uint8Array[]; version: number};

type Key = Uint8Array | string;

const toUint8Array = (value: Key) => typeof value === 'string' ? base58.decode(value) : value;

export class DocumentHeader {
	readonly #data: DocumentHeaderData;
	readonly #signature: Uint8Array;
	readonly #address: Uint8Array;

	private constructor(data: DocumentHeaderData, signature: Uint8Array) {
		if (!verifySignature(encode(data), signature, data.owner)) {
			throw new DocumentValidationError('Invalid document header signature.');
		}

		this.#data = data;
		this.#address = sha256Some(this.#data.id, this.#data.owner);
		this.#signature = signature;
	}

	public withAllowedClients(allowedClientKeys: Key[], privateKey: Key): DocumentHeader {
		privateKey = toUint8Array(privateKey);

		if (!bytesEquals(getPublicKey(privateKey), this.#data.owner) || !verifySignature(encode(this.#data), this.#signature, this.#data.owner)) {
			throw new UnauthorizedAccessError('Only the document owner can update the allowed users list.');
		}

		const allowedClients = allowedClientKeys.reduce<Uint8Array[]>((acc, client) => {
			const publicKey = toUint8Array(client);
			if (validatePublicKey(publicKey) && acc.findIndex(c => bytesEquals(c, publicKey)) === -1) {
				acc.push(publicKey);
			}

			return acc;
		}, []);

		const data: DocumentHeaderData = {
			...this.#data,
			allowedClients,
			version: this.#data.version + 1,
		};

		const signature = createSignature(encode(data), privateKey);

		return new DocumentHeader(data, signature);
	}

	public hasAllowedUser(publicKey: Key): boolean {
		const key = toUint8Array(publicKey);
		return this.#data.allowedClients.some(client => bytesEquals(client, key)) || bytesEquals(this.#data.owner, key);
	}

	public get address(): {bytes: Uint8Array; base58: string} {
		return {
			bytes: new Uint8Array(this.#address),
			base58: base58.encode(this.#address),
		};
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

	public get signature(): {bytes: Uint8Array; base58: string} {
		return {
			bytes: new Uint8Array(this.#signature),
			base58: base58.encode(this.#signature),
		};
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

		return new DocumentHeader(newHeader.#data, newHeader.#signature);
	}

	public static merge(oldHeader: DocumentHeader, newHeader: DocumentHeader): DocumentHeader {
		try {
			return DocumentHeader.upgrade(oldHeader, newHeader);
		} catch {
			return oldHeader;
		}
	}
}

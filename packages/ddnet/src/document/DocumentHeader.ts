import {decode, encode} from 'cbor-x';
import {concatBytes, createSignature, getPublicKey, uint8ArrayEquals, verifySignature} from '../crypto';
import {v4 as uuidv4, v5 as uuidv5} from 'uuid';
import {DocumentValidationError, UnauthorizedAccessError} from './Document';

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
		this.#address = uuidv5(this.#data.owner, this.#data.id, new Uint8Array(16));
		this.#signature = signature;
	}

	public setAllowedClients(allowedClients: Uint8Array[], privateKey: Uint8Array) {
		if (!uint8ArrayEquals(getPublicKey(privateKey), this.#data.owner) || !verifySignature(encode(this.#data), this.#signature, this.#data.owner)) {
			throw new UnauthorizedAccessError('Only the document owner can update the allowed users list.');
		}

		const data = {
			...this.#data,
			allowedClients,
			version: this.#data.version + 1,
		} satisfies DocumentHeaderData;

		this.#signature = createSignature(encode(data), privateKey);
		this.#data = data;
	}

	public hasAllowedUser(publicKey: Uint8Array): boolean {
		return this.#data.allowedClients.some(client => uint8ArrayEquals(client, publicKey)) || uint8ArrayEquals(this.#data.owner, publicKey);
	}

	public get address(): Uint8Array {
		return this.#address;
	}

	public get id(): Uint8Array {
		return this.#data.id;
	}

	public get owner(): Uint8Array {
		return this.#data.owner;
	}

	public get allowedClients(): Uint8Array[] {
		return this.#data.allowedClients;
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
}

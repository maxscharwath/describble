import {decryptData, encryptData} from '../crypto';
import {type StorageProvider} from './StorageProvider';
import {type DocumentId} from '../types';
import {type SessionManager} from '../keys/SessionManager';

type SecureStorageProviderConfig = {
	encrypt: (data: Uint8Array, secret: Uint8Array | string) => Promise<Uint8Array> | Uint8Array;
	decrypt: (data: Uint8Array, secret: Uint8Array | string) => Promise<Uint8Array> | Uint8Array;
};

/**
 * SecureStorageProvider class wraps around another StorageProvider and provides encryption and decryption functionality.
 * This class makes use of the cryptography utilities provided by 'crypto' and applies these to the methods of the underlying StorageProvider.
 * The encryption and decryption functions used can be configured via a configuration object passed to the constructor.
 */
export class SecureStorageProvider implements StorageProvider {
	/**
	 * Constructs a new SecureStorageProvider.
	 * @param storageProvider - The underlying StorageProvider to use for storage operations.
	 * @param sessionManager - The SessionManager instance to get the current session's public and private keys.
	 * @param config - A configuration object specifying the encryption and decryption functions to use. Defaults to encryptData and decryptData from '../crypto'.
	 */
	public constructor(
		private readonly storageProvider: StorageProvider,
		private readonly sessionManager: SessionManager,
		private readonly config: SecureStorageProviderConfig = {
			encrypt: encryptData,
			decrypt: decryptData,
		},
	) {
	}

	public async saveDocumentHeader(namespace: string, documentId: DocumentId, header: Uint8Array): Promise<void> {
		return this.storageProvider.saveDocumentHeader(`${namespace}:${this.publicKey}`, documentId, await this.encrypt(header));
	}

	public async removeDocument(namespace: string, documentId: DocumentId): Promise<void> {
		return this.storageProvider.removeDocument(`${namespace}:${this.publicKey}`, documentId);
	}

	public async getDocumentHeader(namespace: string, documentId: DocumentId): Promise<Uint8Array | undefined> {
		return this.decrypt(await this.storageProvider.getDocumentHeader(`${namespace}:${this.publicKey}`, documentId));
	}

	public async listDocuments(namespace: string): Promise<DocumentId[]> {
		return this.storageProvider.listDocuments(`${namespace}:${this.publicKey}`);
	}

	public async getSnapshot(namespace: string, documentId: DocumentId): Promise<Uint8Array | undefined> {
		return this.decrypt(await this.storageProvider.getSnapshot(`${namespace}:${this.publicKey}`, documentId));
	}

	public async removeSnapshot(namespace: string, documentId: DocumentId): Promise<void> {
		return this.storageProvider.removeSnapshot(`${namespace}:${this.publicKey}`, documentId);
	}

	public async saveSnapshot(namespace: string, documentId: DocumentId, binary: Uint8Array, clearChunks: boolean): Promise<void> {
		return this.storageProvider.saveSnapshot(`${namespace}:${this.publicKey}`, documentId, await this.encrypt(binary), clearChunks);
	}

	public async getChunks(namespace: string, documentId: DocumentId, clear?: boolean): Promise<Uint8Array[]> {
		const chunks = await this.storageProvider.getChunks(`${namespace}:${this.publicKey}`, documentId, clear);
		return Promise.all(chunks.map(async chunk => this.decrypt(chunk)));
	}

	public async saveChunk(namespace: string, documentId: DocumentId, binary: Uint8Array, index: number): Promise<void> {
		return this.storageProvider.saveChunk(`${namespace}:${this.publicKey}`, documentId, await this.encrypt(binary), index);
	}

	/**
	 * Gets the base58 encoded public key of the current session.
	 */
	private get publicKey(): string {
		return this.sessionManager.currentSession.base58PublicKey;
	}

	/**
	 * Gets the private key of the current session.
	 */
	private get privateKey(): Uint8Array {
		return this.sessionManager.currentSession.privateKey;
	}

	/**
	 * Decrypts the given value using the private key of the current session.
	 * @param value - The value to decrypt.
	 * @returns The decrypted value.
	 */
	private async decrypt<T extends Uint8Array | undefined>(value: Promise<T> | T): Promise<T> {
		const data = await value;
		return (data && this.config.decrypt(data, this.privateKey)) as Promise<T>;
	}

	/**
	 * Encrypts the given value using the private key of the current session.
	 * @param value - The value to encrypt.
	 * @returns The encrypted value.
	 */
	private async encrypt<T extends Uint8Array | undefined>(value: Promise<T> | T): Promise<T> {
		const data = await value;
		return (data && this.config.encrypt(data, this.privateKey)) as Promise<T>;
	}
}

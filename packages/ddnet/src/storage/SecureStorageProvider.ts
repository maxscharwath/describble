import {decryptData, encryptData} from '../crypto';
import {type StorageProvider} from './StorageProvider';
import {type DocumentId} from '../types';
import {type SessionManager} from '../keys/SessionManager';

type SecureStorageProviderConfig = {
	encrypt: (data: Uint8Array, secret: Uint8Array | string) => Promise<Uint8Array> | Uint8Array;
	decrypt: (data: Uint8Array, secret: Uint8Array | string) => Promise<Uint8Array> | Uint8Array;
};

export class SecureStorageProvider implements StorageProvider {
	constructor(
		private readonly storageProvider: StorageProvider,
		private readonly sessionManager: SessionManager,
		private readonly config: SecureStorageProviderConfig = {
			encrypt: encryptData,
			decrypt: decryptData,
		},
	) {
	}

	async saveDocumentHeader(namespace: string, documentId: DocumentId, header: Uint8Array): Promise<void> {
		return this.storageProvider.saveDocumentHeader(`${namespace}:${this.publicKey}`, documentId, await this.encrypt(header));
	}

	async removeDocument(namespace: string, documentId: DocumentId): Promise<void> {
		return this.storageProvider.removeDocument(`${namespace}:${this.publicKey}`, documentId);
	}

	async getDocumentHeader(namespace: string, documentId: DocumentId): Promise<Uint8Array | undefined> {
		return this.decrypt(await this.storageProvider.getDocumentHeader(`${namespace}:${this.publicKey}`, documentId));
	}

	async listDocuments(namespace: string): Promise<DocumentId[]> {
		return this.storageProvider.listDocuments(`${namespace}:${this.publicKey}`);
	}

	async getSnapshot(namespace: string, documentId: DocumentId): Promise<Uint8Array | undefined> {
		return this.decrypt(await this.storageProvider.getSnapshot(`${namespace}:${this.publicKey}`, documentId));
	}

	async removeSnapshot(namespace: string, documentId: DocumentId): Promise<void> {
		return this.storageProvider.removeSnapshot(`${namespace}:${this.publicKey}`, documentId);
	}

	async saveSnapshot(namespace: string, documentId: DocumentId, binary: Uint8Array, clearChunks: boolean): Promise<void> {
		return this.storageProvider.saveSnapshot(`${namespace}:${this.publicKey}`, documentId, await this.encrypt(binary), clearChunks);
	}

	async getChunks(namespace: string, documentId: DocumentId, clear?: boolean): Promise<Uint8Array[]> {
		const chunks = await this.storageProvider.getChunks(`${namespace}:${this.publicKey}`, documentId, clear);
		return Promise.all(chunks.map(async chunk => this.decrypt(chunk)));
	}

	async saveChunk(namespace: string, documentId: DocumentId, binary: Uint8Array, index: number): Promise<void> {
		return this.storageProvider.saveChunk(`${namespace}:${this.publicKey}`, documentId, await this.encrypt(binary), index);
	}

	private get publicKey(): string {
		return this.sessionManager.currentSession.base58PublicKey;
	}

	private get privateKey(): Uint8Array {
		return this.sessionManager.currentSession.privateKey;
	}

	private async decrypt<T extends Uint8Array | undefined>(value: Promise<T> | T): Promise<T> {
		const data = await value;
		return (data && this.config.decrypt(data, this.privateKey)) as Promise<T>;
	}

	private async encrypt<T extends Uint8Array | undefined>(value: Promise<T> | T): Promise<T> {
		const data = await value;
		return (data && this.config.encrypt(data, this.privateKey)) as Promise<T>;
	}
}

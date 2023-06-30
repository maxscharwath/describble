import {decryptData, encryptData} from '../crypto';
import {type StorageProvider} from './StorageProvider';
import {type DocumentId} from '../types';

export class SecureStorageProvider implements StorageProvider {
	constructor(
		private readonly storageProvider: StorageProvider,
		private readonly privateKey: Uint8Array,
	) {}

	async saveDocumentHeader(documentId: DocumentId, header: Uint8Array): Promise<void> {
		return this.storageProvider.saveDocumentHeader(documentId, await this.encrypt(header));
	}

	async removeDocument(documentId: DocumentId): Promise<void> {
		return this.storageProvider.removeDocument(documentId);
	}

	async getDocumentHeader(documentId: DocumentId): Promise<Uint8Array | undefined> {
		return this.decrypt(await this.storageProvider.getDocumentHeader(documentId));
	}

	async listDocuments(): Promise<DocumentId[]> {
		return this.storageProvider.listDocuments();
	}

	async getSnapshot(documentId: DocumentId): Promise<Uint8Array | undefined> {
		return this.decrypt(await this.storageProvider.getSnapshot(documentId));
	}

	async removeSnapshot(documentId: DocumentId): Promise<void> {
		return this.storageProvider.removeSnapshot(documentId);
	}

	async saveSnapshot(documentId: DocumentId, binary: Uint8Array, clearChunks: boolean): Promise<void> {
		return this.storageProvider.saveSnapshot(documentId, await this.encrypt(binary), clearChunks);
	}

	async getChunks(documentId: DocumentId, clear?: boolean): Promise<Uint8Array[]> {
		const chunks = await this.storageProvider.getChunks(documentId, clear);
		return Promise.all(chunks.map(async chunk => this.decrypt(chunk)));
	}

	async saveChunk(documentId: DocumentId, binary: Uint8Array, index: number): Promise<void> {
		return this.storageProvider.saveChunk(documentId, await this.encrypt(binary), index);
	}

	private async decrypt<T extends Uint8Array | undefined>(value: Promise<T> | T): Promise<T> {
		const data = await value;
		return (data && decryptData(data, this.privateKey)) as Promise<T>;
	}

	private async encrypt<T extends Uint8Array | undefined>(value: Promise<T> | T): Promise<T> {
		const data = await value;
		return (data && encryptData(data, this.privateKey)) as Promise<T>;
	}
}

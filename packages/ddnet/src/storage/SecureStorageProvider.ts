import {decryptData, encryptData} from '../crypto';
import {type DocumentId, type StorageProvider} from './StorageProvider';

export class SecureStorageProvider implements StorageProvider {
	constructor(
		private readonly storageProvider: StorageProvider,
		private readonly privateKey: Uint8Array,
	) {}

	async addDocument(documentId: DocumentId, header: Uint8Array): Promise<void> {
		return this.storageProvider.addDocument(documentId, await this.encrypt(header));
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

	async loadSnapshot(documentId: DocumentId): Promise<Uint8Array | undefined> {
		return this.decrypt(await this.storageProvider.loadSnapshot(documentId));
	}

	async deleteSnapshot(documentId: DocumentId): Promise<void> {
		return this.storageProvider.deleteSnapshot(documentId);
	}

	async saveSnapshot(documentId: DocumentId, binary: Uint8Array, clearChunks: boolean): Promise<void> {
		return this.storageProvider.saveSnapshot(documentId, await this.encrypt(binary), clearChunks);
	}

	async loadChunks(documentId: DocumentId, clear?: boolean): Promise<Uint8Array[]> {
		const chunks = await this.storageProvider.loadChunks(documentId, clear);
		return Promise.all(chunks.map(async chunk => this.decrypt(chunk)));
	}

	async saveChunk(documentId: DocumentId, binary: Uint8Array, index: number): Promise<void> {
		return this.storageProvider.saveChunk(documentId, await this.encrypt(binary), index);
	}

	private async decrypt<T extends Uint8Array | undefined>(value: Promise<T> | T): Promise<T> {
		const data = await value;
		return (data && decryptData(this.privateKey, data)) as Promise<T>;
	}

	private async encrypt<T extends Uint8Array | undefined>(value: Promise<T> | T): Promise<T> {
		const data = await value;
		return (data && encryptData(this.privateKey, data)) as Promise<T>;
	}
}

import * as A from '@automerge/automerge';
import {type StorageProvider} from './StorageProvider';
import {type Doc} from '@automerge/automerge';
import {type DocumentId} from '../types';
import {type Document} from '../document/Document';

export class Storage {
	private readonly changeCount = new Map<DocumentId, number>();

	public constructor(private readonly storageProvider: StorageProvider) {}

	public async loadBinary(documentId: DocumentId): Promise<Uint8Array> {
		const [binary, chunks] = await Promise.all([
			this.storageProvider.getSnapshot('ddnet', documentId),
			this.storageProvider.getChunks('ddnet', documentId),
		]);

		const length = (binary?.byteLength ?? 0) + chunks.reduce((a, b) => a + b.byteLength, 0);
		const result = new Uint8Array(length);
		let offset = 0;

		if (binary) {
			result.set(binary, offset);
			offset += binary.byteLength;
		}

		chunks.forEach(chunk => {
			result.set(chunk, offset);
			offset += chunk.byteLength;
		});

		this.changeCount.set(documentId, chunks.length);

		return result;
	}

	public async setDocument(document: Document<any>): Promise<void> {
		return this.storageProvider.saveDocumentHeader(
			'ddnet',
			document.id,
			document.header.export(),
		);
	}

	public async loadHeader(documentId: DocumentId): Promise<Uint8Array | undefined> {
		return this.storageProvider.getDocumentHeader('ddnet', documentId);
	}

	public async save(document: Document<any>) {
		const documentId = document.id;
		if (this.shouldCompact(documentId)) {
			return this.saveTotal(documentId, document.data);
		}

		return this.saveIncremental(documentId, document.data);
	}

	public async remove(documentId: DocumentId) {
		return this.storageProvider.removeDocument('ddnet', documentId);
	}

	public async list() {
		return this.storageProvider.listDocuments('ddnet');
	}

	private shouldCompact(documentId: DocumentId) {
		return (this.changeCount.get(documentId) ?? 0) >= 20;
	}

	private async saveIncremental(documentId: DocumentId, doc: Doc<unknown>) {
		const binary = A.saveIncremental(doc);
		if (binary && binary.byteLength > 0) {
			const changeCount = this.changeCount.get(documentId) ?? 0;
			await this.storageProvider.saveChunk('ddnet', documentId, binary, changeCount);
			this.changeCount.set(documentId, changeCount + 1);
		}
	}

	private async saveTotal(documentId: DocumentId, doc: Doc<unknown>) {
		const binary = A.save(doc);
		await this.storageProvider.saveSnapshot('ddnet', documentId, binary, true);
		this.changeCount.set(documentId, 0);
	}
}

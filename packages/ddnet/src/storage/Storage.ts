import * as A from '@automerge/automerge';
import {type StorageProvider} from './StorageProvider';
import {type Doc} from '@automerge/automerge';

type DocumentId = string;

export class Storage {
	private readonly changeCount = new Map<DocumentId, number>();

	public constructor(private readonly storageProvider: StorageProvider) {}

	public async loadBinary(documentId: DocumentId): Promise<Uint8Array> {
		const [binary, chunks] = await Promise.all([
			this.storageProvider.loadSnapshot(documentId),
			this.storageProvider.loadChunks(documentId),
		]);

		const length = binary?.byteLength ?? 0 + chunks.reduce((a, b) => a + b.byteLength, 0);

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

	public async load<T>(documentId: DocumentId, prevDoc: A.Doc<T> = A.init<T>()): Promise<A.Doc<T>> {
		const doc = A.loadIncremental(prevDoc, await this.loadBinary(documentId));
		A.saveIncremental(doc);
		return doc;
	}

	public async save(documentId: DocumentId, doc: A.Doc<unknown>) {
		if (this.shouldCompact(documentId)) {
			return this.saveTotal(documentId, doc);
		}

		return this.saveIncremental(documentId, doc);
	}

	public async remove(documentId: DocumentId) {
		return this.storageProvider.removeDocument(documentId);
	}

	public async list() {
		return this.storageProvider.listDocuments();
	}

	private shouldCompact(documentId: DocumentId) {
		return (this.changeCount.get(documentId) ?? 0) >= 20;
	}

	private async saveIncremental(documentId: DocumentId, doc: Doc<unknown>) {
		const binary = A.saveIncremental(doc);
		if (binary && binary.byteLength > 0) {
			const changeCount = this.changeCount.get(documentId) ?? 0;
			await this.storageProvider.saveChunk(documentId, binary, changeCount);
			this.changeCount.set(documentId, changeCount + 1);
		}
	}

	private async saveTotal(documentId: DocumentId, doc: Doc<unknown>) {
		const binary = A.save(doc);
		await this.storageProvider.saveSnapshot(documentId, binary, true);
		this.changeCount.set(documentId, 0);
	}
}

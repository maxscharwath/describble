import * as A from '@automerge/automerge';
import {type StorageProvider} from './StorageProvider';
import {type Doc} from '@automerge/automerge';
import {type DocumentId} from '../types';
import {type Document} from '../document/Document';

/**
 * Storage class which provides various methods to interact with the storage provider.
 */
export class Storage {
	private readonly changeCount = new Map<DocumentId, number>();

	/**
	 * Storage constructor
	 * @param storageProvider The storage provider.
	 */
	public constructor(private readonly storageProvider: StorageProvider) {}

	/**
	 * Loads binary data for a given document id.
	 * @param documentId The document id.
	 * @returns Promise that resolves to a Uint8Array.
	 */
	public async loadBinary(documentId: DocumentId): Promise<Uint8Array> {
		const [binary, chunks] = await Promise.all([
			this.storageProvider.getSnapshot('ddnet', documentId),
			this.storageProvider.getChunks('ddnet', documentId),
		]);

		// Calculate total length
		const length = (binary?.byteLength ?? 0) + chunks.reduce((a, b) => a + b.byteLength, 0);
		const result = new Uint8Array(length);
		let offset = 0;

		// Add binary data if exists
		if (binary) {
			result.set(binary, offset);
			offset += binary.byteLength;
		}

		// Add chunks data
		chunks.forEach(chunk => {
			result.set(chunk, offset);
			offset += chunk.byteLength;
		});

		// Track changes count
		this.changeCount.set(documentId, chunks.length);

		return result;
	}

	/**
	 * Sets the document.
	 * @param document The document.
	 * @returns Promise<void>
	 */
	public async setDocument(document: Document<any>): Promise<void> {
		return this.storageProvider.saveDocumentHeader(
			'ddnet',
			document.id,
			document.header.export(),
		);
	}

	/**
	 * Loads header for a given document id.
	 * @param documentId The document id.
	 * @returns Promise that resolves to a Uint8Array or undefined.
	 */
	public async loadHeader(documentId: DocumentId): Promise<Uint8Array | undefined> {
		return this.storageProvider.getDocumentHeader('ddnet', documentId);
	}

	/**
	 * Saves the document.
	 * @param document The document.
	 * @returns Promise<void>
	 */
	public async save(document: Document<any>) {
		const documentId = document.id;
		if (this.shouldCompact(documentId)) {
			return this.saveTotal(documentId, document.data);
		}

		return this.saveIncremental(documentId, document.data);
	}

	/**
	 * Removes a document with a given id.
	 * @param documentId The document id.
	 * @returns Promise<void>
	 */
	public async remove(documentId: DocumentId) {
		return this.storageProvider.removeDocument('ddnet', documentId);
	}

	/**
	 * Lists all documents.
	 * @returns Promise that resolves to a list of documents.
	 */
	public async list() {
		return this.storageProvider.listDocuments('ddnet');
	}

	/**
	 * Checks if a document with a given id should be compacted.
	 * @param documentId The document id.
	 * @returns boolean.
	 */
	private shouldCompact(documentId: DocumentId) {
		return (this.changeCount.get(documentId) ?? 0) >= 50;
	}

	/**
	 * Saves incremental changes of the document with a given id.
	 * @param documentId The document id.
	 * @param doc The document.
	 * @returns Promise<void>
	 */
	private async saveIncremental(documentId: DocumentId, doc: Doc<unknown>) {
		const binary = A.saveIncremental(doc);
		if (binary && binary.byteLength > 0) {
			const changeCount = this.changeCount.get(documentId) ?? 0;
			await this.storageProvider.saveChunk('ddnet', documentId, binary, changeCount);
			this.changeCount.set(documentId, changeCount + 1);
		}
	}

	/**
	 * Saves total changes of the document with a given id.
	 * @param documentId The document id.
	 * @param doc The document.
	 * @returns Promise<void>
	 */
	private async saveTotal(documentId: DocumentId, doc: Doc<unknown>) {
		const binary = A.save(doc);
		await this.storageProvider.saveSnapshot('ddnet', documentId, binary, true);
		this.changeCount.set(documentId, 0);
	}
}

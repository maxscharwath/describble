import * as A from '@automerge/automerge';
import {type StorageProvider} from './StorageProvider';
import {type Doc} from '@automerge/automerge';
import {type DocumentId} from '../types';
import {type Document} from '../document/Document';
import {ConcurrencyLimiter} from '../utils';

/**
 * Storage class which provides various methods to interact with the storage provider.
 */
export class Storage {
	private readonly changeCount = new Map<DocumentId, number>();
	private readonly loadLimiter = new ConcurrencyLimiter();

	/**
	 * Storage constructor
	 * @param storageProvider The storage provider.
	 */
	public constructor(private readonly storageProvider: StorageProvider) {}

	/**
	 * Loads binary data for a given document id.
	 * Tries to load the document fully first, if that fails it discards one chunk at a time from the end until successful.
	 * If loading is successful after discarding, saves a fresh version with cleared chunks.
	 * @param documentId The document id.
	 * @returns Promise that resolves to a Uint8Array or throws an error if loading fails completely.
	 */
	public async loadBinary(documentId: DocumentId): Promise<Uint8Array> {
		return this.loadLimiter.execute(async () => {
			const [binary, chunks] = await Promise.all([
				this.storageProvider.getSnapshot('ddnet', documentId),
				this.storageProvider.getChunks('ddnet', documentId),
			]);

			// Binary data is considered as the first chunk
			if (binary) {
				chunks.unshift(binary);
			}

			const result = new Uint8Array(chunks.reduce((a, b) => a + b.byteLength, 0));
			let offset = 0;

			// Try to load the full document first
			chunks.forEach(chunk => {
				result.set(chunk, offset);
				offset += chunk.byteLength;
			});

			try {
				A.load(result);
				// If full load is successful, return the result
				return result;
			} catch (e) {
				console.error(`Full load error for document id: ${documentId}`, e);
			}

			// If loading full document failed, try discarding one chunk at a time from the end
			for (let i = chunks.length - 1; i >= 0; i--) {
				offset -= chunks[i].byteLength;

				try {
					const doc = A.load(result.subarray(0, offset));

					// If loading is successful after discarding, save a fresh version with cleared chunks
					// eslint-disable-next-line no-await-in-loop
					await this.saveTotal(documentId, doc);
					this.changeCount.set(documentId, 0);

					return result.subarray(0, offset);
				} catch (e) {
					console.error(`Loading error after discarding chunk for document id: ${documentId}`, e);
				}
			}

			// If all chunks have been discarded and the document still fails to load, throw an error
			throw new Error(`Failed to load document with id ${documentId}`);
		});
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

import {type DocumentId} from '../types';

export interface StorageProvider {
	/**
	 * Add a new document to storage.
	 * @param documentId - Identifier for the document
	 * @param header - Binary header data for the document
	 */
	addDocument(documentId: DocumentId, header: Uint8Array): Promise<void>;

	/**
	 * Remove a document from storage.
	 * Removes all data associated with the document.
	 * @param documentId - Identifier for the document
	 */
	removeDocument(documentId: DocumentId): Promise<void>;

	/**
	 * Retrieve the header data for a specific document.
	 * @param documentId - Identifier for the document
	 * @returns A Promise resolving with the binary header data for the document or undefined if not found
	 */
	getDocumentHeader(documentId: DocumentId): Promise<Uint8Array | undefined>;

	/**
	 * List all documents in storage.
	 * @returns A Promise resolving with an array of document identifiers
	 */
	listDocuments(): Promise<DocumentId[]>;

	/**
	 * Load a snapshot for a specific document.
	 * @param documentId - Identifier for the document
	 * @returns A Promise resolving with the binary snapshot data for the document or undefined if not found
	 */
	loadSnapshot(documentId: DocumentId): Promise<Uint8Array | undefined>;

	/**
	 * Delete a snapshot for a specific document.
	 * @param documentId - Identifier for the document
	 */
	deleteSnapshot(documentId: DocumentId): Promise<void>;

	/**
	 * Save a snapshot for a specific document.
	 * @param documentId - Identifier for the document
	 * @param binary - The binary snapshot data to be saved
	 * @param clearChunks - Boolean indicating if the chunks should be cleared from storage after saving
	 */
	saveSnapshot(documentId: DocumentId, binary: Uint8Array, clearChunks: boolean): Promise<void>;

	/**
	 * Load all chunks for a specific document.
	 * @param documentId - Identifier for the document
	 * @param clear - Boolean indicating if the chunks should be cleared from storage after loading
	 * @returns A Promise resolving with an array of binary chunk data for the document
	 */
	loadChunks(documentId: DocumentId, clear?: boolean): Promise<Uint8Array[]>;

	/**
	 * Save a chunk of data for a specific document.
	 * @param documentId - Identifier for the document
	 * @param binary - The binary chunk data to be saved
	 * @param index - The index of the chunk in the document
	 */
	saveChunk(documentId: DocumentId, binary: Uint8Array, index: number): Promise<void>;
}

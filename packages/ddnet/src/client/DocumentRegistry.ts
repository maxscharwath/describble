import Emittery from 'emittery';
import {Document} from '../document/Document';
import {type DocumentId} from '../types';
import {type SessionManager} from '../keys/SessionManager';
import {type Metadata} from '../document/DocumentHeader';

type DocumentRegistryEvent = {
	'document-added': Document<unknown>;
	'document-updated': Document<unknown>;
	'document-destroyed': Document<unknown>;
};

/**
 * The DocumentRegistry class manages a collection of Document objects and emits events whenever a document is added, updated, or destroyed.
 * It uses the `Emittery` library to emit these events.
 */
export class DocumentRegistry<TAdditionalEvent extends {} extends Partial<DocumentRegistryEvent> ? {} : DocumentRegistryEvent> extends Emittery<TAdditionalEvent & DocumentRegistryEvent> {
	// Map to store the registered documents
	private readonly documents = new Map<DocumentId, Document<any>>();

	/**
	 * Constructor for the DocumentRegistry class.
	 * @param sessionManager - Instance of a SessionManager
	 */
	public constructor(protected readonly sessionManager: SessionManager) {
		super();
	}

	/**
	 * Creates a new document and adds it to the registry. It emits a 'document-added' event after the document is added.
	 * @param options - The options for the document.
	 * @returns The created Document
	 */
	public createDocument<TData, TMetadata extends Metadata = Metadata>({allowedClients, metadata}: Partial<{allowedClients: Uint8Array[]; metadata: TMetadata}> = {}) {
		const {privateKey} = this.sessionManager.currentSession;
		const document = Document.create<TData, TMetadata>(privateKey, allowedClients, metadata);
		this.documents.set(document.id, document as Document<unknown>);
		// Emits 'document-added' event
		void this.emit('document-added', document as Document<unknown>);
		return document;
	}

	/**
	 * Finds a document in the registry by its id.
	 * @param id - The id of the document to find.
	 * @returns The found document or undefined if not found.
	 */
	public async findDocument<TData, TMetadata extends Metadata = Metadata>(id: DocumentId) {
		return this.documents.get(id) as Document<TData, TMetadata> | undefined;
	}

	/**
	 * Sets a document in the registry. If the document already exists, it is updated, otherwise it is added.
	 * Emits 'document-added' event if a document is added and 'document-updated' event if a document is updated.
	 * @param incomingDocument - The document to be set in the registry.
	 * @returns The updated or added document.
	 */
	public async setDocument<TData, TMetadata extends Metadata = Metadata>(incomingDocument: Document<TData, TMetadata>) {
		let targetDocument = this.documents.get(incomingDocument.id);

		if (targetDocument) {
			targetDocument.mergeDocument(incomingDocument as Document<unknown>);
			// Emits 'document-updated' event
			void this.emit('document-updated', targetDocument as Document<unknown>);
		} else {
			targetDocument = incomingDocument as Document<unknown>;
			this.documents.set(targetDocument.id, targetDocument);
			// Emits 'document-added' event
			void this.emit('document-added', targetDocument as Document<unknown>);
		}

		return targetDocument as Document<TData, TMetadata>;
	}

	/**
	 * Removes a document from the registry by its id. Emits a 'document-destroyed' event after the document is removed.
	 * @param id - The id of the document to be removed.
	 */
	public async removeDocument(id: DocumentId) {
		console.log('Removing document', id);
		const document = this.documents.get(id);
		if (document) {
			await document.destroy();
			this.documents.delete(id);
			// Emits 'document-destroyed' event
			void this.emit('document-destroyed', document as Document<unknown>);
		}
	}
}

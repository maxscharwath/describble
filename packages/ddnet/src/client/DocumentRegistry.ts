import Emittery from 'emittery';
import {Document} from '../document/Document';
import {type DocumentId} from '../types';

type DocumentRegistryEvent = {
	'document-added': Document<unknown>;
	'document-updated': Document<unknown>;
	'document-destroyed': Document<unknown>;
};

export class DocumentRegistry<TAdditionalEvent extends {} extends Partial<DocumentRegistryEvent> ? {} : DocumentRegistryEvent> extends Emittery<TAdditionalEvent & DocumentRegistryEvent> {
	private readonly documents = new Map<DocumentId, Document<any>>();

	constructor(protected readonly privateKey: Uint8Array) {
		super();
	}

	public createDocument<TData>(allowedClients: Uint8Array[] = []) {
		const document = Document.create<TData>(this.privateKey, allowedClients);
		this.documents.set(document.id, document);
		void this.emit('document-added', document as Document<unknown>);
		return document;
	}

	public async findDocument<TData>(id: DocumentId) {
		return this.documents.get(id) as Document<TData> | undefined;
	}

	public async setDocument<TData>(incomingDocument: Document<TData>) {
		let targetDocument = this.documents.get(incomingDocument.id);

		if (targetDocument) {
			targetDocument.mergeDocument(incomingDocument);
			void this.emit('document-updated', targetDocument as Document<unknown>);
		} else {
			targetDocument = incomingDocument;
			this.documents.set(targetDocument.id, targetDocument);
			void this.emit('document-added', targetDocument as Document<unknown>);
		}

		return targetDocument as Document<TData>;
	}

	public removeDocument(id: DocumentId) {
		const document = this.documents.get(id);
		if (document) {
			this.documents.delete(id);
			void this.emit('document-destroyed', document as Document<unknown>);
		}
	}
}

import Emittery from 'emittery';
import {Document} from '../document/Document';
import {type DocumentId} from '../types';

type DocumentRegistryEvent = {
	'document': Document<unknown>;
	'document-destroyed': Document<unknown>;
};

export class DocumentRegistry<TAdditionalEvent extends {} extends Partial<DocumentRegistryEvent> ? {} : DocumentRegistryEvent> extends Emittery<TAdditionalEvent & DocumentRegistryEvent> {
	private readonly documents = new Map<DocumentId, Document<any>>();

	constructor(protected readonly privateKey: Uint8Array) {
		super();
	}

	public create<TData>(allowedClients: Uint8Array[] = []) {
		const document = Document.create<TData>(this.privateKey, allowedClients);
		this.documents.set(document.id, document);
		void this.emit('document', document as Document<unknown>);
		return document;
	}

	public async find<TData>(id: DocumentId) {
		return this.documents.get(id) as Document<TData> | undefined;
	}

	public add<TData>(document: Document<TData>) {
		this.documents.set(document.id, document);
		void this.emit('document', document as Document<unknown>);
		return document;
	}

	public remove(id: DocumentId) {
		const document = this.documents.get(id);
		if (document) {
			this.documents.delete(id);
			void this.emit('document-destroyed', document as Document<unknown>);
		}
	}
}

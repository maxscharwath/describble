import Emittery from 'emittery';
import {Document} from '../document/Document';
import {base58} from 'base-x';

type DocumentRegistryEvent = {
	'document': Document<unknown>;
	'document-destroyed': Document<unknown>;
};

export type DocumentAddress = string | Uint8Array;

export class DocumentRegistry<TAdditionalEvent extends {} extends Partial<DocumentRegistryEvent> ? {} : DocumentRegistryEvent> extends Emittery<TAdditionalEvent & DocumentRegistryEvent> {
	private readonly documents = new Map<string, Document<any>>();

	constructor(protected readonly privateKey: Uint8Array) {
		super();
	}

	public create<TData>(allowedClients: Uint8Array[] = []) {
		const document = Document.create<TData>(this.privateKey, allowedClients);
		this.documents.set(this.encodeId(document.header.address), document);
		void this.emit('document', document as Document<unknown>);
		return document;
	}

	public async find<TData>(id: DocumentAddress) {
		return this.documents.get(this.encodeId(id)) as Document<TData> | undefined;
	}

	public add<TData>(document: Document<TData>) {
		this.documents.set(this.encodeId(document.header.address), document);
		void this.emit('document', document as Document<unknown>);
		return document;
	}

	public remove(documentId: DocumentAddress) {
		const document = this.documents.get(this.encodeId(documentId));
		if (document) {
			this.documents.delete(this.encodeId(documentId));
			void this.emit('document-destroyed', document as Document<unknown>);
		}
	}

	protected encodeId(id: DocumentAddress) {
		return typeof id === 'string' ? id : base58.encode(id);
	}
}

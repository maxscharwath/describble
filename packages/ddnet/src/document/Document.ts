import * as A from '@automerge/automerge';
import Emittery from 'emittery';
import {DocumentHeader} from './DocumentHeader';
import {createSignature, getPublicKey} from '../crypto';
import {decode, encode} from 'cbor-x';

export class UnauthorizedAccessError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'UnauthorizedAccessError';
	}
}

export class DocumentValidationError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'DocumentValidationError';
	}
}

type DocumentEvent<TData> = {
	patch: {document: Document<TData>; patches: A.Patch[]; before: A.Doc<TData>; after: A.Doc<TData>};
	change: {document: Document<TData>; data: A.Doc<TData>};
};

export class Document<TData> extends Emittery<DocumentEvent<TData>> {
	private document: A.Doc<TData>;

	protected constructor(public readonly header: DocumentHeader) {
		super();
		this.document = A.init<TData>({
			patchCallback: (patches, {before, after}) => {
				void this.emit('patch', {document: this, patches, before, after});
			},
		});
	}

	public load(binary: Uint8Array) {
		this.document = A.loadIncremental(this.document, binary);
	}

	public update(callback: (document: A.Doc<TData>) => A.Doc<TData>) {
		const newDocument = callback(this.document);
		if (this.hasChanged(newDocument)) {
			console.log('Document changed', newDocument);
			void this.emit('change', {document: this, data: newDocument});
		}

		this.document = newDocument;
	}

	public change(callback: A.ChangeFn<TData>, options: A.ChangeOptions<TData> = {}) {
		this.update(document => A.change(document, options, callback));
	}

	public changeAt(heads: A.Heads, callback: A.ChangeFn<TData>, options: A.ChangeOptions<TData> = {}) {
		this.update(document => A.changeAt(document, heads, options, callback));
	}

	public get value() {
		return this.document;
	}

	public export(privateKey: Uint8Array): Uint8Array {
		const header = this.header.export();

		if (!this.header.hasAllowedUser(getPublicKey(privateKey))) {
			throw new UnauthorizedAccessError('Only the document owner or an allowed user can export the document.');
		}

		const content = A.save(this.value);
		const signature = createSignature(content, privateKey);
		return encode({
			header,
			content,
			signature,
		});
	}

	public clone() {
		const document = new Document<TData>(this.header);
		document.document = A.clone(this.document);
		return document;
	}

	private hasChanged(document: A.Doc<TData>) {
		const aHeads = A.getHeads(this.document);
		const bHeads = A.getHeads(document);
		return !(aHeads.length === bHeads.length && aHeads.every(head => bHeads.includes(head)));
	}

	public static import<TData>(rawDocument: Uint8Array): Document<TData> {
		const {header: rawHeader, content, signature} = decode(rawDocument) as {header: Uint8Array; content: Uint8Array; signature: Uint8Array};
		const header = DocumentHeader.import(rawHeader);

		if (!header.verifySignature(content, signature)) {
			throw new DocumentValidationError('Invalid document signature.');
		}

		const document = new Document<TData>(header);
		document.load(content);
		return document;
	}

	public static create<TData>(privateKey: Uint8Array, allowedClients: Uint8Array[] = []): Document<TData> {
		const header = DocumentHeader.create(privateKey, allowedClients);
		return new Document(header);
	}
}

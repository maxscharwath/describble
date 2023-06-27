import * as A from '@automerge/automerge';
import Emittery from 'emittery';

type DocumentEvent<TData> = {
	patch: {document: Document<TData>; patches: A.Patch[]; before: A.Doc<TData>; after: A.Doc<TData>};
	change: {document: Document<TData>; data: A.Doc<TData>};
};

export class Document<TData> extends Emittery<DocumentEvent<TData>> {
	private document: A.Doc<TData>;

	constructor() {
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

	private hasChanged(document: A.Doc<TData>) {
		const aHeads = A.getHeads(this.document);
		const bHeads = A.getHeads(document);
		return !(aHeads.length === bHeads.length && aHeads.every(head => bHeads.includes(head)));
	}
}

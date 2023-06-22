import * as A from '@automerge/automerge';
import {State} from './State';
import Emittery from 'emittery';

type DocumentEvents<T> = {
	change: {document: Document<T>};
	patch: {document: Document<T>; patches: A.Patch[]; before: A.Doc<T>; after: A.Doc<T>};
	delete: {document: Document<T>};
};

type DocumentState =
	| 'idle'
	| 'loading'
	| 'requesting'
	| 'ready'
	| 'deleted';

export class Document<T> extends Emittery<DocumentEvents<T>> {
	private doc?: A.Doc<T>;
	private readonly state = new State<DocumentState>('idle');
	constructor(public readonly documentId: string, {isNew = false} = {}) {
		super();
		this.doc = A.init<T>({
			patchCallback: (patches, {before, after}) => {
				void this.emit('patch', {document: this, patches, before, after});
			},
		});
		this.state.value = isNew ? 'ready' : 'loading';
	}

	public update(callback: (doc: A.Doc<T>) => A.Doc<T>) {
		if (!this.doc) {
			throw new Error('Document is not available');
		}

		const doc = callback(this.doc);
		if (!headsAreSame(this.doc, doc)) {
			void this.emit('change', {document: this});
			if (!this.state.is('ready')) {
				this.state.value = 'ready';
			}
		}

		this.doc = doc;
	}

	public change(callback: A.ChangeFn<T>, options: A.ChangeOptions<T> = {}) {
		this.update(doc => A.change(doc, options, callback));
	}

	public load(binary: Uint8Array) {
		if (this.doc && this.state.is('loading')) {
			this.doc = A.loadIncremental(this.doc, binary);
			this.state.value = 'ready';
		}
	}

	public request() {
		if (this.state.is('loading')) {
			this.state.value = 'requesting';
		}
	}

	public delete() {
		this.state.value = 'deleted';
		void this.emit('delete', {document: this});
		this.doc = undefined;
	}

	public get value() {
		if (!this.doc) {
			throw new Error('Document is deleted');
		}

		return this.doc;
	}

	public async waitReadyOrRequesting() {
		await this.state.waitTransition(['ready', 'requesting'], 5000);
		return this.doc!;
	}

	public isReadyOrRequesting() {
		return this.state.is('ready', 'requesting');
	}
}

export const arraysAreEqual = <T>(a: T[], b: T[]) =>
	a.length === b.length && a.every((element, index) => element === b[index]);

export const headsAreSame = <T>(a: A.Doc<T>, b: A.Doc<T>) => {
	const aHeads = A.getHeads(a);
	const bHeads = A.getHeads(b);
	return arraysAreEqual(aHeads, bHeads);
};

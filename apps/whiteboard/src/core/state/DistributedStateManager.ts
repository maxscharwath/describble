import * as Automerge from '@automerge/automerge';
import {type Doc} from '@automerge/automerge';
import {type ChangeFn} from '@automerge/automerge/dist/stable';
import {type Patch} from '~core/types';

function applyPatch<T>(target: T, patch: Patch<T>): void {
	const entries = Object.entries(patch) as Array<[keyof T, T[keyof T]]>;
	for (const [key, value] of entries) {
		if (target[key] && value === Object(value) && !Array.isArray(value)) {
			applyPatch(target[key], value);
		} else if (target[key] && value === undefined) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete target[key];
		} else {
			target[key] = value;
		}
	}
}

type DistributedStateManagerOptions<T extends Record<string, unknown>> = {
	document?: Doc<T>;
	defaultState?: T;
};

export class DistributedStateManager<T extends Record<string, unknown>> {
	protected onChange?: (state: T) => void;
	protected document: Doc<T>;
	public constructor(options?: DistributedStateManagerOptions<T>) {
		if (options?.document) {
			this.document = options.document;
			if (options.defaultState) {
				this.patch(options.defaultState);
			}
		} else if (options?.defaultState) {
			this.document = Automerge.from<T>(options.defaultState);
		} else {
			throw new Error('You must provide either a document or a default state');
		}
	}

	public get actorId(): string {
		return Automerge.getActorId(this.document);
	}

	public change(fn: ChangeFn<T>, message?: string): void {
		this.setDocument(Automerge.change(this.document, {message}, fn));
	}

	public patch(patch: Patch<T>, message?: string): void {
		this.change(state => {
			applyPatch(state as T, patch);
		}, message);
	}

	public merge(doc: Doc<T>): void {
		this.setDocument(Automerge.merge(this.document, doc));
	}

	public save(): Uint8Array {
		return Automerge.save(this.document);
	}

	public load(data: Uint8Array): void {
		this.setDocument(Automerge.load(data), true);
	}

	public getHistory() {
		return Automerge.getHistory(this.document);
	}

	public get state(): T {
		return Automerge.toJS(this.document);
	}

	protected setDocument(doc: Doc<T>, force = false): void {
		if (!force) {
			const changes = Automerge.getChanges(this.document, doc);
			if (changes.length === 0) {
				return;
			}
		}

		this.document = doc;
		this.onChange?.(Automerge.toJS(this.document));
	}

	public static create<T extends Record<string, unknown>>(defaultState: T): DistributedStateManager<T> {
		return new DistributedStateManager({defaultState});
	}
}

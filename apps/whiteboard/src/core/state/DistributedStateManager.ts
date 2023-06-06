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
	defaultState: T;
};

export class DistributedStateManager<T extends Record<string, unknown>> {
	protected onChange?: (state: T) => void;
	protected document: Doc<T>;
	public constructor(private readonly options: DistributedStateManagerOptions<T>) {
		this.document = Automerge.from<T>(options.defaultState);
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

	public saveDocument(): number[] {
		return [...Automerge.save(this.document)];
	}

	public loadDocument(data: number[] | Uint8Array): Doc<T> {
		this.document = Automerge.load(new Uint8Array(data));
		return this.document;
	}

	public newDocument(): Doc<T> {
		this.document = Automerge.from<T>(this.options.defaultState);
		return this.document;
	}

	public getHistory() {
		return Automerge.getHistory(this.document);
	}

	public get state(): T {
		return this.document;
	}

	protected setDocument(doc: Doc<T>): void {
		this.document = doc;
		this.onChange?.(this.document);
	}

	public static create<T extends Record<string, unknown>>(defaultState: T): DistributedStateManager<T> {
		return new DistributedStateManager({defaultState});
	}
}

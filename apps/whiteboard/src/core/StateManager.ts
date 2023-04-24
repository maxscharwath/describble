import {createStore, type StoreApi} from 'zustand/vanilla';
import deepcopy from 'deepcopy';
import {create, type UseBoundStore, useStore} from 'zustand';
import * as idb from 'idb-keyval';

export type Patch<T> = Partial<{[P in keyof T]: Patch<T[P]>}>;

export interface Command<T extends Record<string, any>> {
	id?: string;
	before: Patch<T>;
	after: Patch<T>;
}

const createUseStore = <T>(store: StoreApi<T>) => ((selector, equalityFn) => useStore(store, selector, equalityFn)) as UseBoundStore<StoreApi<T>>;

export function deepmerge<T>(target: T, patch: Patch<T>): T {
	const result: T = {...target};

	const entries = Object.entries(patch) as Array<[keyof T, T[keyof T]]>;

	for (const [key, value] of entries) {
		result[key]
			= value === Object(value) && !Array.isArray(value)
				? deepmerge(result[key], value)
				: value;
	}

	return result;
}

export class StateManager<T extends Record<string, any>> {
	public useStore: UseBoundStore<StoreApi<T>>;

	protected onReady?: () => void;
	protected onPersist?: (state: T, patch: Patch<T>, id?: string) => void;
	protected onPatch?: (patch: Patch<T>, id?: string) => void;
	protected onCommand?: (state: T, command: Command<T>, id?: string) => void;
	protected onUndo?: (state: T) => void;
	protected onRedo?: (state: T) => void;
	protected onStateWillChange?: (state: T, id?: string) => void;
	protected onStateDidChange?: (state: T, id?: string) => void;

	private _state: T;
	private readonly store: StoreApi<T>;
	private readonly initialState: T;
	private readonly idbId?: string;
	private readonly ready: Promise<void>;
	private stack: Array<Command<T>> = [];
	private stackIndex = 0;

	constructor(initialState: T, id?: string) {
		this.idbId = id;
		this.initialState = deepcopy(initialState);
		this._state = deepcopy(initialState);
		this.store = createStore(() => this._state);
		this.useStore = createUseStore(this.store);
		this.ready = this.init().then(() => this.onReady?.());
	}

	public patchState(patch: Patch<T>, id?: string): this {
		this.applyPatch(patch, id);
		this.onPatch?.(patch, id);
		return this;
	}

	public forceUpdate(): this {
		this.store.setState(this._state, true);
		return this;
	}

	public get state(): T {
		return this._state;
	}

	public get canUndo(): boolean {
		return this.stackIndex > -1;
	}

	public get canRedo(): boolean {
		return this.stackIndex < this.stack.length - 1;
	}

	public undo(): this {
		if (this.canUndo) {
			const command = this.stack[this.stackIndex];
			this.stackIndex--;
			this.applyPatch(command.before, 'undo');
			void this.persist(command.before, 'undo');
			this.onUndo?.(this._state);
		}

		return this;
	}

	public redo(): this {
		if (this.canRedo) {
			this.stackIndex++;
			const command = this.stack[this.stackIndex];
			this.applyPatch(command.after, 'redo');
			void this.persist(command.after, 'redo');
			this.onRedo?.(this._state);
		}

		return this;
	}

	public reset(): this {
		this.onStateWillChange?.(this.initialState, 'reset');
		this._state = this.initialState;
		this.store.setState(this._state, true);
		this.resetHistory();
		void this.persist({}, 'reset');
		this.onStateDidChange?.(this._state, 'reset');
		return this;
	}

	public resetHistory(): this {
		this.stack = [];
		this.stackIndex = -1;
		return this;
	}

	protected applyPatch(patch: Patch<T>, id?: string): this {
		const prevState = this._state;
		const nextState = deepmerge(this._state, patch);
		const state = this.cleanup(nextState, prevState, patch, id);
		this.onStateWillChange?.(state, id);
		this._state = state;
		this.store.setState(state, true);
		this.onStateDidChange?.(state, id);
		return this;
	}

	protected replaceState(state: T, id?: string): this {
		const newState = this.cleanup(state, this._state, state, id);
		this.onStateWillChange?.(newState, id);
		this._state = newState;
		this.store.setState(newState, true);
		this.onStateDidChange?.(newState, id);
		return this;
	}

	protected setState(command: Command<T>, id = command.id): this {
		if (this.stackIndex < this.stack.length - 1) {
			this.stack = this.stack.slice(0, this.stackIndex + 1);
		}

		this.stack.push({...command, id});
		this.stackIndex = this.stack.length - 1;
		this.applyPatch(command.after, id);
		this.onCommand?.(this._state, command, id);
		void this.persist(command.after, id);
		return this;
	}

	protected async persist(patch: Patch<T>, id?: string) {
		this.onPersist?.(this._state, patch, id);
		if (this.idbId) {
			return idb.set(this.idbId, this._state).catch(console.error);
		}
	}

	protected migrate(state: T): T {
		return state;
	}

	protected cleanup(nextState: T, prevState: T, patch: Patch<T>, id?: string): T {
		return nextState;
	}

	private async init() {
		if (this.idbId) {
			let state = await idb.get<T>(this.idbId);
			if (state) {
				state = this.migrate(state);
				this._state = deepcopy(state);
				this.store.setState(this._state, true);
			}
		}
	}
}

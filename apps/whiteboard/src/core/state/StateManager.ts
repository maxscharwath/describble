import {createStore, type StoreApi} from 'zustand/vanilla';
import {type UseBoundStore} from 'zustand';
import * as idb from 'idb-keyval';
import {type Command, type Patch} from '../types';
import {createUseStore, deepcopy, deepmerge} from '../utils';

/**
 * State manager
 * @description A state manager that uses Zustand and IndexedDB
 */
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
	private readonly store: StoreApi<T>;
	private readonly initialState: T;
	private readonly idbId?: string;
	private readonly ready: Promise<void>;
	private stack: Array<Command<T>> = [];
	private stackIndex = -1;
	private _state: T;

	/**
   * Initialize the state manager
   * @param initialState - The initial state
   * @param id - The id of the state manager
   */
	public constructor(initialState: T, id?: string) {
		this.idbId = id;
		this.initialState = deepcopy(initialState);
		this._state = deepcopy(initialState);
		this.store = createStore(() => this._state);
		this.useStore = createUseStore(this.store);
		this.ready = this.init().then(() => this.onReady?.());
	}

	/**
   * Get the current state
   */
	public get state(): T {
		return this._state;
	}

	/**
   * Check if there is a command to undo
   */
	public get canUndo(): boolean {
		return this.stackIndex > -1;
	}

	/**
   * Check if there is a command to redo
   */
	public get canRedo(): boolean {
		return this.stackIndex < this.stack.length - 1;
	}

	/**
   * Patch without persisting
   * @param patch - The patch to apply
   * @param id - The id of the patch
   */
	public patchState(patch: Patch<T>, id?: string): this {
		this.applyPatch(patch, id);
		this.onPatch?.(patch, id);
		return this;
	}

	/**
   * Apply Command to state and persist
   * @param command - The command to apply
   * @param id - The id of the mutation
   * @protected
   */
	public setState(command: Command<T>, id = command.id): this {
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

	/**
   * Force updating Zustand store
   */
	public forceUpdate(): this {
		this.store.setState(this._state, true);
		return this;
	}

	/**
   * Undo the last command
   */
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

	/**
   * Redo the last command
   */
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

	/**
   * Reset the state to the initial state, clearing the history and persisting
   */
	public reset(): this {
		this.onStateWillChange?.(this.initialState, 'reset');
		this._state = this.initialState;
		this.store.setState(this._state, true);
		this.resetHistory();
		void this.persist({}, 'reset');
		this.onStateDidChange?.(this._state, 'reset');
		return this;
	}

	/**
   * Reset all history stacks
   */
	public resetHistory(): this {
		this.stack = [];
		this.stackIndex = -1;
		return this;
	}

	/**
   * Apply a patch without persisting
   * @param patch - The patch to apply
   * @param id - The id of the patch
   * @protected
   */
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

	/**
   * Replace state with new state without persisting
   * @param state - The new state
   * @param id - The id of the mutation
   * @protected
   */
	protected replaceState(state: T, id?: string): this {
		const newState = this.cleanup(state, this._state, state, id);
		this.onStateWillChange?.(newState, id);
		this._state = newState;
		this.store.setState(newState, true);
		this.onStateDidChange?.(newState, id);
		return this;
	}

	/**
   * Persist state to IndexedDB
   * @param patch - The patch that was applied
   * @param id - The id of the patch
   * @protected
   */
	protected async persist(patch: Patch<T>, id?: string) {
		this.onPersist?.(this._state, patch, id);
		if (this.idbId) {
			return idb.set(this.idbId, this._state).catch(console.error);
		}
	}

	/**
   * Migrate state from previous version
   * @param state - The state to migrate
   * @protected
   */
	protected migrate(state: T): T {
		return state;
	}

	/**
	 * Cleanup state before updating
	 * @param nextState - The next state
	 * @param _prevState
	 * @param _patch
	 * @param _id
	 * @protected
	 */
	protected cleanup(nextState: T, _prevState: T, _patch: Patch<T>, _id?: string): T {
		return nextState;
	}

	/**
   * Initialize StateManager
   * @returns Promise that resolves when ready
   * @private
   */
	private async init() {
		if (this.idbId) {
			let state = await idb.get<T>(this.idbId);
			if (state) {
				state = this.migrate(state);
				this._state = deepmerge(this._state, state);
				this.store.setState(this._state, true);
			}
		}
	}
}

import {StateManager} from './state/StateManager';
import {type Camera} from './types';
import {type Layer} from './layers';

type Document = {
	id: string;
	layers: Layer[];
	camera: Camera;
};

export type AppState = {
	settings: {
		theme: 'light' | 'dark';
	};
	appState: {

	};
	document: Document;
};

export type AppCallbacks = {
	onMount?: (app: App) => void;
	onChange?: (state: AppState, reason: string) => void;
};

export class App extends StateManager<AppState> {
	constructor(id: string, private readonly callbacks: AppCallbacks = {}) {
		super(App.defaultState, id);
	}

	public get documentState() {
		return this.state.document;
	}

	public get camera() {
		return this.documentState.camera;
	}

	protected onReady = () => {
		this.callbacks.onMount?.(this);
	};

	protected onStateDidChange = (state: AppState, id?: string) => {
		this.callbacks.onChange?.(state, id ?? 'unknown');
	};

	static defaultDocument: Document = {
		id: '',
		layers: [],
		camera: {x: 0, y: 0, zoom: 1},
	};

	static defaultState: AppState = {
		settings: {
			theme: 'light',
		},
		appState: {},
		document: App.defaultDocument,
	};
}

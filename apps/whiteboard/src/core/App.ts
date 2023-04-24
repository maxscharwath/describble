import {StateManager} from './StateManager';

type Document = {
	id: string;
	layers: [];
	camera: {
		x: number;
		y: number;
		zoom: number;
	};
};

export type AppState = {
	settings: {
		theme: 'light' | 'dark';
	};
	appState: {

	};
	document: Document;
};

export type AppCallback = {
	onMount?: () => void;
	onChange?: (state: AppState, reason: string) => void;
};

export class App extends StateManager<AppState> {
	constructor(id: string, private readonly callbacks: AppCallback = {}) {
		super(App.defaultState, id);
	}

	public get documentState() {
		return this.state.document;
	}

	public get camera() {
		return this.documentState.camera;
	}

	protected onReady = () => {
		this.callbacks.onMount?.();
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

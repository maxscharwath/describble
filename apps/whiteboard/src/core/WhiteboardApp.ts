import {StateManager} from './state/StateManager';
import {type Camera, type Patch} from './types';
import {type Layer} from './layers';
import {
	type BaseTool,
	CircleTool,
	createTools,
	ImageTool,
	MoveTool,
	PathTool,
	RectangleTool,
	SelectTool,
	type ToolsKey,
} from './tools';
import {defaultLayerStyle, type LayerStyle} from './layers/shared';

type Tools = ToolsKey<typeof WhiteboardApp.prototype.tools>;

type Document = {
	id: string;
	layers: Layer[];
	camera: Camera;
};

export type WhiteboardState = {
	settings: {
		theme: 'light' | 'dark';
	};
	appState: {
		currentTool?: Tools;
		currentStyle: LayerStyle;
		status: string;
	};
	document: Document;
};

export type WhiteboardCallbacks = {
	onMount?: (app: WhiteboardApp) => void;
	onChange?: (state: WhiteboardState, reason: string) => void;
};

export class WhiteboardApp extends StateManager<WhiteboardState> {
	tools = createTools(
		new RectangleTool(this),
		new CircleTool(this),
		new ImageTool(this),
		new PathTool(this),
		new SelectTool(this),
		new MoveTool(this),
	);

	currentTool?: BaseTool;

	constructor(id: string, private readonly callbacks: WhiteboardCallbacks = {}) {
		super(WhiteboardApp.defaultState, id);
	}

	public get documentState() {
		return this.state.document;
	}

	public get camera() {
		return this.documentState.camera;
	}

	public setStatus(status: string) {
		this.patchState({appState: {status}}, `set_status_${status}`);
	}

	public setTool(type: Tools | null) {
		if (type === null) {
			this.currentTool?.onDeactivate();
			this.currentTool = undefined;
			this.patchState({appState: {currentTool: undefined}}, 'set_tool_null');
			return this;
		}

		const tool = this.tools[type];
		if (!tool || tool === this.currentTool) {
			return this;
		}

		this.currentTool?.onDeactivate();
		this.currentTool = tool;
		this.currentTool.onActivate();
		this.patchState({appState: {currentTool: type}}, `set_tool_${type}`);
		return this;
	}

	protected onReady = () => {
		this.callbacks.onMount?.(this);
	};

	protected onStateDidChange = (state: WhiteboardState, id?: string) => {
		this.callbacks.onChange?.(state, id ?? 'unknown');
	};

	protected onPatch = (patch: Patch<WhiteboardState>, id?: string) => {
		console.log('patch', patch, id);
	};

	static defaultDocument: Document = {
		id: '',
		layers: [],
		camera: {x: 0, y: 0, zoom: 1},
	};

	static defaultState: WhiteboardState = {
		settings: {
			theme: 'light',
		},
		appState: {
			status: 'idle',
			currentStyle: defaultLayerStyle,
		},
		document: WhiteboardApp.defaultDocument,
	};
}

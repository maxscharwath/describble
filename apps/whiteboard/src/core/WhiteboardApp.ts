import {StateManager} from './state/StateManager';
import {type Camera, type Command, type Dimension, type Patch, type Point, type Pointer} from './types';
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
import {PointerEventManager} from './managers/PointerEventManager';
import {ActivityManager} from './managers/ActivityManager';
import {createLayersCommand} from './commands/CreateLayersCommand';
import {KeyboardEventManager} from './managers/KeyboardEventManager';
import {removeLayersCommand} from './commands/RemoveLayersCommand';
import {AssetManager} from './managers/AssetManager';

export enum Status {
	Idle = 'idle',
}

type Document = {
	id: string;
	layers: Record<string, Layer>;
	assets: Record<string, Asset>;
	camera: Camera;
};

export type Asset = {
	id: string;
	type: string;
	src: string;
};

export type WhiteboardState = {
	settings: {
		theme: 'light' | 'dark';
	};
	appState: {
		currentTool?: Tools;
		currentStyle: LayerStyle;
		selectedLayers: string[];
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

	public currentTool?: BaseTool;
	public currentPoint: Pointer = {id: 0, x: 0, y: 0, pressure: 0};
	public viewport: Dimension = {width: 0, height: 0};
	public readonly pointerEvent = new PointerEventManager(this);
	public readonly keyboardEvent = new KeyboardEventManager(this);
	public readonly activity = new ActivityManager(this);
	public readonly asset = new AssetManager(this);

	constructor(id: string, private readonly callbacks: WhiteboardCallbacks = {}) {
		super(WhiteboardApp.defaultState, id);
	}

	public get documentState() {
		return this.state.document;
	}

	public get camera() {
		return this.documentState.camera;
	}

	public setCamera(camera: Partial<Camera>) {
		this.patchState({document: {camera}}, 'set_camera');
	}

	public setStatus(status: string) {
		this.patchState({appState: {status}}, `set_status_${status}`);
	}

	public setTool(type: Tools | undefined) {
		if (!type) {
			this.currentTool?.onDeactivate();
			this.currentTool = undefined;
			this.patchState({appState: {currentTool: undefined}}, 'set_tool_none');
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

	public abort() {
		this.currentTool?.onAbort();
	}

	public getLayer<TLayer extends Layer>(id: string): TLayer | undefined {
		return this.state.document.layers[id] as TLayer | undefined;
	}

	public addLayer(...layers: Layer[]) {
		if (!layers.length) {
			return this;
		}

		this.setState(createLayersCommand(this, layers));
	}

	public removeLayer(...layersId: string[]) {
		if (!layersId.length) {
			return this;
		}

		const layers = layersId.map(id => this.state.document.layers[id]);
		this.setState(removeLayersCommand(this, layers));
	}

	public clearLayers() {
		const layers = Object.values(this.state.document.layers);
		this.setState(removeLayersCommand(this, layers));
	}

	public patchLayer(...layers: Layer[]) {
		if (!layers.length) {
			return this;
		}

		this.patchState(createLayersCommand(this, layers).after, 'patch_layer');
	}

	public updateInput(event: React.PointerEvent) {
		this.currentPoint = {
			id: event.pointerId,
			...this.getCanvasPoint({x: event.clientX, y: event.clientY}),
			pressure: event.pressure,
		};
	}

	public getCanvasPoint(point: Point) {
		const {x, y, zoom} = this.camera;
		return {
			x: (point.x - x) / zoom,
			y: (point.y - y) / zoom,
		};
	}

	public getScreenPoint(point: Point) {
		const {x, y, zoom} = this.camera;
		return {
			x: (point.x * zoom) + x,
			y: (point.y * zoom) + y,
		};
	}

	protected onReady = () => {
		this.patchState({
			appState: {
				status: Status.Idle,
			},
		});
		this.setTool(this.state.appState.currentTool);
		this.callbacks.onMount?.(this);
	};

	protected onStateDidChange = (state: WhiteboardState, id?: string) => {
		this.callbacks.onChange?.(state, id ?? 'unknown');
	};

	protected cleanup(state: WhiteboardState): WhiteboardState {
		const next = {...state};
		Object.entries(next.document.layers).forEach(([id, layer]) => {
			if (!layer) {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete next.document.layers[id];
			}
		});
		return next;
	}

	static defaultDocument: Document = {
		id: '',
		layers: {},
		camera: {x: 0, y: 0, zoom: 1},
		assets: {},
	};

	static defaultState: WhiteboardState = {
		settings: {
			theme: 'light',
		},
		appState: {
			status: Status.Idle,
			currentStyle: defaultLayerStyle,
			selectedLayers: [],
		},
		document: WhiteboardApp.defaultDocument,
	};
}

export type WhiteboardPatch = Patch<WhiteboardState>;
export type WhiteboardCommand = Command<WhiteboardState>;
export type Tools = ToolsKey<typeof WhiteboardApp.prototype.tools>;

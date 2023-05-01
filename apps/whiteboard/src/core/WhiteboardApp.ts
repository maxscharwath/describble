import {StateManager} from './state/StateManager';
import {type Camera, type Command, type Patch, type Point, type Pointer} from './types';
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
import {createLayersCommand} from './tools/Commands/CreateLayersCommand';
import {PointerEventManager} from './managers/PointerEventManager';
import {ActivityManager} from './managers/ActivityManager';

type Tools = ToolsKey<typeof WhiteboardApp.prototype.tools>;

export enum Status {
	Idle = 'idle',
}

type Document = {
	id: string;
	layers: Record<string, Layer>;
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

	public currentTool?: BaseTool;
	public currentPoint: Pointer = {id: 0, x: 0, y: 0, pressure: 0};
	public readonly pointerEvent: PointerEventManager;
	public readonly activity: ActivityManager;

	constructor(id: string, private readonly callbacks: WhiteboardCallbacks = {}) {
		super(WhiteboardApp.defaultState, id);
		this.pointerEvent = new PointerEventManager(this);
		this.activity = new ActivityManager(this);
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

	public getLayer<TLayer extends Layer>(id: string): TLayer | undefined {
		return this.state.document.layers[id] as TLayer | undefined;
	}

	public addLayer(...layers: Layer[]) {
		if (!layers.length) {
			return this;
		}

		this.setState(createLayersCommand(this, layers));
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
			x: (point.x / zoom) - x,
			y: (point.y / zoom) - y,
		};
	}

	protected onReady = () => {
		this.callbacks.onMount?.(this);
	};

	protected onStateDidChange = (state: WhiteboardState, id?: string) => {
		this.callbacks.onChange?.(state, id ?? 'unknown');
	};

	static defaultDocument: Document = {
		id: '',
		layers: {},
		camera: {x: 0, y: 0, zoom: 1},
	};

	static defaultState: WhiteboardState = {
		settings: {
			theme: 'light',
		},
		appState: {
			status: Status.Idle,
			currentStyle: defaultLayerStyle,
		},
		document: WhiteboardApp.defaultDocument,
	};
}

export type WhiteboardPatch = Patch<WhiteboardState>;
export type WhiteboardCommand = Command<WhiteboardState>;

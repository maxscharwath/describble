import {StateManager} from '~core/state/StateManager';
import {
	type Bounds,
	type Camera,
	type Command,
	type Patch,
	type Point,
	type Pointer,
} from '~core/types';
import {getLayerUtil} from '~core/layers';
import {
	ArrowTool,
	type BaseTool,
	CircleTool,
	createTools, EmbedTool,
	ImageTool, LineTool,
	MoveTool,
	PathTool,
	RectangleTool,
	SelectTool, TextTool,
	type ToolsKey,
} from '~core/tools';
import {defaultLayerStyle, type LayerStyle} from '~core/layers/shared';
import {ActivityManager, DocumentManager, KeyboardEventManager, PointerEventManager} from '~core/managers';
import React from 'react';
import {getCanvasBounds, getCanvasPoint, getScreenBounds, getScreenPoint} from '~core/utils';
export type {Document, Asset} from '~core/managers/DocumentManager';
export enum Status {
	Idle = 'idle',
}

export type WhiteboardState = {
	settings: {
		darkMode: boolean;
	};
	appState: {
		currentDocumentId: string;
		currentTool: Tools;
		currentStyle: LayerStyle;
		selectedLayers: string[];
		selection: Bounds | null;
		status: string;
	};
};

export type WhiteboardCallbacks = {
	onMount?: (app: WhiteboardApp) => void;
	onChange?: (state: WhiteboardState, reason: string) => void;
	onPatch?: (patch: Patch<WhiteboardState>, reason: string) => void;
};

export class WhiteboardApp extends StateManager<WhiteboardState> {
	tools = createTools(
		new RectangleTool(this),
		new CircleTool(this),
		new ImageTool(this),
		new PathTool(this),
		new LineTool(this),
		new ArrowTool(this),
		new SelectTool(this),
		new MoveTool(this),
		new TextTool(this),
		new EmbedTool(this),
	);

	public currentTool: BaseTool | null = this.tools.select;
	public currentPoint: Pointer = {id: 0, x: 0, y: 0, pressure: 0};
	public viewport: Bounds = {x: 0, y: 0, width: 0, height: 0};
	public whiteboardRef = React.createRef<SVGSVGElement>();
	public readonly pointerEvent = new PointerEventManager(this);
	public readonly keyboardEvent = new KeyboardEventManager(this);
	public readonly activity = new ActivityManager(this);
	public readonly document = new DocumentManager({
		id: 'default',
		camera: {x: 0, y: 0, zoom: 1},
		layers: {},
		assets: {},
	});

	constructor(id: string, private readonly callbacks: WhiteboardCallbacks = {}) {
		super(WhiteboardApp.defaultState, id);
	}

	public get currentDocumentId() {
		return this.state.appState.currentDocumentId;
	}

	public get documentState() {
		return this.document.state;
	}

	public get selectedLayers() {
		return this.state.appState.selectedLayers;
	}

	public get camera() {
		return this.documentState.camera;
	}

	public setCamera(camera: Partial<Camera>) {
		this.document.camera = camera;
	}

	public setStatus(status: string) {
		this.patchState({appState: {status}}, `set_status_${status}`);
	}

	public setTool(type: Tools | null) {
		if (!type) {
			this.currentTool?.onDeactivate();
			this.currentTool = null;
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

	public selectAll() {
		this.patchState({
			appState: {
				selectedLayers: Object.keys(this.documentState.layers),
			},
		});
	}

	public selectNone() {
		this.patchState({
			appState: {
				selectedLayers: [],
			},
		});
	}

	public abort() {
		this.currentTool?.onAbort();
	}

	public updateInput(event: React.PointerEvent) {
		const {viewport} = this;
		this.currentPoint = {
			id: event.pointerId,
			...this.getCanvasPoint({x: event.clientX - viewport.x, y: event.clientY - viewport.y}),
			pressure: event.pressure,
		};
	}

	public patchStyle(style: Patch<LayerStyle>, id?: string) {
		this.patchState({appState: {currentStyle: style}}, id);
		const {selectedLayers} = this.state.appState;
		if (selectedLayers.length) {
			this.document.layer.patch(
				selectedLayers.map(id => ({id, style})),
				id,
			);
		}
	}

	public targetLayer(layerId: string) {
		const layer = this.document.layer.get(layerId);
		if (!layer) {
			return this;
		}

		const {width, height} = this.viewport;
		const {x, y} = getLayerUtil(layer).getCenter(layer as never);

		this.setCamera({
			x: (width / 2) - (x * this.camera.zoom),
			y: (height / 2) - (y * this.camera.zoom),
		});
	}

	public getCanvasPoint(point: Point) {
		return getCanvasPoint(point, this.camera);
	}

	public getScreenPoint(point: Point) {
		return getScreenPoint(point, this.camera);
	}

	public getScreenBounds(bounds: Bounds) {
		return getScreenBounds(bounds, this.camera);
	}

	public getCanvasBounds(bounds: Bounds) {
		return getCanvasBounds(bounds, this.camera);
	}

	public toggleDarkMode() {
		const patch = {settings: {darkMode: !this.state.settings.darkMode}};
		this.patchState(patch, 'toggle_dark_mode');
		void this.persist(patch, 'toggle_dark_mode');
		return this;
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

	protected onPatch = (patch: Patch<WhiteboardState>, id?: string) => {
		this.callbacks.onPatch?.(patch, id ?? 'unknown');
	};

	protected preparePersist({settings}: WhiteboardState): Patch<WhiteboardState> {
		return {
			settings,
		};
	}

	static defaultState: WhiteboardState = {
		settings: {
			darkMode: false,
		},
		appState: {
			status: Status.Idle,
			currentStyle: defaultLayerStyle,
			selectedLayers: [],
			selection: null,
			currentTool: 'select',
			currentDocumentId: 'demo',
		},
	};
}

export type WhiteboardPatch = Patch<WhiteboardState>;
export type WhiteboardCommand = Command<WhiteboardState>;
export type Tools = ToolsKey<typeof WhiteboardApp.prototype.tools>;

import {StateManager} from '~core/state/StateManager';
import {
	type Bounds,
	type Camera,
	type Command,
	type Patch,
	type Point,
	type Pointer,
} from '~core/types';
import {type Layer} from '~core/layers';
import {
	type BaseTool,
	CircleTool,
	createTools, EmbedTool,
	ImageTool,
	MoveTool,
	PathTool,
	RectangleTool,
	SelectTool, TextTool,
	type ToolsKey,
} from '~core/tools';
import {defaultLayerStyle, type LayerStyle} from '~core/layers/shared';
import {ActivityManager, AssetManager, KeyboardEventManager, PointerEventManager} from '~core/managers';
import {createLayersCommand, removeLayersCommand} from '~core/commands';
import {patchLayersCommand} from '~core/commands/PatchLayersCommand';
import React from 'react';

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
	documents: Record<string, Document>;
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
	public readonly asset = new AssetManager(this);

	constructor(id: string, private readonly callbacks: WhiteboardCallbacks = {}) {
		super(WhiteboardApp.defaultState, id);
	}

	public get currentDocumentId() {
		return this.state.appState.currentDocumentId;
	}

	public get documentState() {
		return this.state.documents[this.currentDocumentId];
	}

	public get selectedLayers() {
		return this.state.appState.selectedLayers;
	}

	public get camera() {
		return this.documentState.camera;
	}

	public setCamera(camera: Partial<Camera>) {
		this.patchDocument({camera}, 'set_camera');
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

	public patchDocument(patch: Patch<Document>, id?: string) {
		this.patchState({documents: {[this.currentDocumentId]: patch}}, id);
	}

	public patchStyle(patch: Patch<LayerStyle>, id?: string) {
		this.patchState({appState: {currentStyle: patch}}, id);
		const {selectedLayers} = this.state.appState;
		if (selectedLayers.length) {
			this.setState(patchLayersCommand(this, selectedLayers, {style: patch}));
		}
	}

	public getLayer<TLayer extends Layer>(id: string): TLayer | undefined {
		return this.documentState.layers[id] as TLayer;
	}

	public getLayers(ids?: string[]): Layer[] {
		if (!ids) {
			return Object.values(this.documentState.layers);
		}

		const layers: Layer[] = [];
		for (const id of ids) {
			const layer = this.documentState.layers[id];
			if (layer) {
				layers.push(layer);
			}
		}

		return layers;
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

		this.setState(removeLayersCommand(this, layersId));
	}

	public clearLayers() {
		const layers = Object.keys(this.documentState.layers);
		this.setState(removeLayersCommand(this, layers));
	}

	public patchLayer(...layers: Layer[]) {
		if (!layers.length) {
			return this;
		}

		this.patchState(createLayersCommand(this, layers).after, 'patch_layer');
	}

	public updateInput(event: React.PointerEvent) {
		const {viewport} = this;
		this.currentPoint = {
			id: event.pointerId,
			...this.getCanvasPoint({x: event.clientX - viewport.x, y: event.clientY - viewport.y}),
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

	public getScreenBounds(bounds: Bounds) {
		const {x, y, zoom} = this.camera;
		return {
			x: (bounds.x * zoom) + x,
			y: (bounds.y * zoom) + y,
			width: bounds.width * zoom,
			height: bounds.height * zoom,
		};
	}

	public getCanvasBounds(bounds: Bounds) {
		const {x, y, zoom} = this.camera;
		return {
			x: (bounds.x - x) / zoom,
			y: (bounds.y - y) / zoom,
			width: bounds.width / zoom,
			height: bounds.height / zoom,
		};
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

	protected preparePersist({documents, settings}: WhiteboardState): Patch<WhiteboardState> {
		return {
			documents,
			settings,
		};
	}

	protected cleanup(state: WhiteboardState): WhiteboardState {
		const next = {...state};
		Object.entries(next.documents).forEach(([documentId, document]) => {
			Object.entries(document.layers).forEach(([layerId, layer]) => {
				if (!layer) {
					// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
					delete next.documents[documentId].layers[layerId];
				}
			});
		});
		return next;
	}

	static defaultDocument: Document = {
		id: 'demo',
		layers: {},
		camera: {x: 0, y: 0, zoom: 1},
		assets: {},
	};

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
		documents: {
			demo: WhiteboardApp.defaultDocument,
		},
	};
}

export type WhiteboardPatch = Patch<WhiteboardState>;
export type WhiteboardCommand = Command<WhiteboardState>;
export type Tools = ToolsKey<typeof WhiteboardApp.prototype.tools>;

import {StateManager} from '~core/state/StateManager';
import {
	type Bounds,
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
import {
	ActivityManager,
	DocumentManager,
	KeyboardEventManager,
	PointerEventManager,
} from '~core/managers';
import React from 'react';
import {getCanvasBounds, getCanvasPoint, getScreenBounds, getScreenPoint} from '~core/utils';
import {
	DocumentSharingClient,
	IDBStorageProvider,
	WebSocketNetworkAdapter,
} from 'ddnet';
import {SessionManager} from 'ddnet/src/keys/SessionManager';
import {KeyManager} from 'ddnet/src/keys/KeyManager';
export type {DocumentData, Asset} from '~core/managers/DocumentManager';
export enum Status {
	Idle = 'idle',
}

export type WhiteboardState = {
	settings: {
		darkMode: boolean;
	};
	appState: {
		currentDocumentId: string | null;
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
	public readonly documentManager: DocumentManager;
	public readonly repo: DocumentSharingClient;
	public readonly sessionManager: SessionManager;

	constructor(id: string) {
		super(WhiteboardApp.defaultState, id);
		this.sessionManager = new SessionManager(
			new KeyManager('ddnet-keys'),
		);
		this.repo = new DocumentSharingClient({
			sessionManager: this.sessionManager,
			network: new WebSocketNetworkAdapter('wss://ddnet-server.fly.dev'),
			storageProvider: new IDBStorageProvider(),
		});

		this.documentManager = new DocumentManager(this.repo);
	}

	public get document() {
		return this.documentManager.current.handle;
	}

	public get presence() {
		return this.documentManager.current.presence;
	}

	public get selectedLayers() {
		return this.state.appState.selectedLayers;
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
				selectedLayers: this.document?.layers.getAllIds() ?? [],
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

	public patchStyle(style: Patch<LayerStyle>, message?: string) {
		this.patchState({appState: {currentStyle: style}}, message);
		const {selectedLayers} = this.state.appState;
		if (selectedLayers.length) {
			this.document?.layers.patch(
				selectedLayers.map(id => ({id, style})),
				message,
			);
		}
	}

	public get camera() {
		return this.document?.camera ?? {x: 0, y: 0, zoom: 1};
	}

	public targetLayer(layerId: string) {
		const layer = this.document?.layers.get(layerId);
		if (!layer) {
			return this;
		}

		const {width, height} = this.viewport;
		const {x, y} = getLayerUtil(layer).getCenter(layer as never);
		this.document?.setCamera(({zoom}) => ({
			x: (width / 2) - (x * zoom),
			y: (height / 2) - (y * zoom),
		}));
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
	};

	protected preparePersist(state: WhiteboardState): Patch<WhiteboardState> {
		const {settings} = state;
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
			currentDocumentId: null,
		},
	};
}

export type WhiteboardPatch = Patch<WhiteboardState>;
export type WhiteboardCommand = Command<WhiteboardState>;
export type Tools = ToolsKey<typeof WhiteboardApp.prototype.tools>;

import {type Layer} from '~core/layers';
import {type Camera, type Patch, type PatchId} from '~core/types';
import {createUseStore, deepmerge} from '~core/utils';
import {createStore, type StoreApi} from 'zustand/vanilla';
import {nanoid} from 'nanoid';
import {type WhiteboardApp} from '~core/WhiteboardApp';
import {type DocHandle, type DocumentId, Repo} from 'automerge-repo';
import {LocalForageStorageAdapter} from 'automerge-repo-storage-localforage';
import type * as A from '@automerge/automerge';
import {type UseBoundStore} from 'zustand';
import {BrowserWebSocketClientAdapter} from 'automerge-repo-network-websocket';

type SyncedDocument = {
	layers: Record<string, Layer>;
	assets: Record<string, Asset>;
};

type BaseDocument = {
	id: string;
	camera: Camera;
};

export type Document = BaseDocument & SyncedDocument;

export type Asset = {
	id: string;
	type: string;
	src: string;
};

function applyPatch<T>(target: T, patch: Patch<T>): void {
	const entries = Object.entries(patch) as Array<[keyof T, T[keyof T]]>;
	for (const [key, value] of entries) {
		if (target[key] && value === Object(value) && !Array.isArray(value)) {
			applyPatch(target[key], value);
		} else if (target[key] && value === undefined) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete target[key];
		} else {
			target[key] = value;
		}
	}
}

class LayerManager {
	constructor(private readonly documentHandle: DocumentHandle) {
		this.documentHandle = documentHandle;
	}

	get<T extends Layer>(id: string): T | undefined;
	get(id: string[]): Layer[];
	get(id: string | string[]): Layer | Layer[] | undefined {
		if (Array.isArray(id)) {
			return id.map(id => this.documentHandle.state.layers[id]).filter(Boolean);
		}

		return this.documentHandle.state.layers[id] as Layer | undefined;
	}

	getAll() {
		return Object.values(this.documentHandle.state.layers);
	}

	getAllIds() {
		return Object.keys(this.documentHandle.state.layers);
	}

	patch<T extends Layer>(layer: PatchId<T>, message?: string): void;
	patch(layers: Array<PatchId<Layer>>, message?: string): void;
	patch(layers: PatchId<Layer> | Array<PatchId<Layer>>, message?: string): void {
		const patches = Array.isArray(layers) ? layers : [layers];
		this.documentHandle.change(state => {
			for (const patch of patches) {
				const currentLayer = state.layers[patch.id];
				if (!currentLayer) {
					continue;
				}

				applyPatch(currentLayer, patch as never);
				currentLayer.timestamp = Date.now();
			}
		}, message ?? `Patch ${patches.length} layers`);
	}

	change<T extends Layer>(layers: Array<[string, (layer: T) => void]>, message?: string): void {
		this.documentHandle.change(state => {
			for (const [id, fn] of layers) {
				const currentLayer = state.layers[id];
				if (!currentLayer) {
					continue;
				}

				fn(currentLayer as never);
				currentLayer.timestamp = Date.now();
			}
		}, message ?? `Set ${layers.length} layers`);
	}

	add(layer: Layer, message?: string): void;
	add(layers: Layer[], message?: string): void;
	add(layers: Layer | Layer[], message?: string) {
		const newLayers = Array.isArray(layers) ? layers : [layers];
		this.documentHandle.change(state => {
			for (const layer of newLayers) {
				state.layers[layer.id] = layer as never;
				state.layers[layer.id].timestamp = Date.now();
			}
		}, message ?? `Set ${newLayers.length} layers`);
	}

	delete(id: string | string[], message?: string) {
		const ids = Array.isArray(id) ? id : [id];
		this.documentHandle.change(state => {
			for (const id of ids) {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete state.layers[id];
			}
		}, message ?? `Delete layer ${ids.join(', ')}`);
	}

	deleteAll(message?: string) {
		this.documentHandle.change(state => {
			state.layers = {};
		}, message ?? 'Delete all layers');
	}
}

class AssetManager {
	constructor(private readonly documentHandle: DocumentHandle) {
		this.documentHandle = documentHandle;
	}

	get(id: string | undefined) {
		if (!id) {
			return undefined;
		}

		return this.documentHandle.state.assets[id] as Asset | undefined;
	}

	getAll() {
		return Object.values(this.documentHandle.state.assets);
	}

	create(src: string, type: string): Asset {
		return this.add({
			id: nanoid(),
			type,
			src,
		});
	}

	add(asset: Asset, message?: string) {
		const existingAsset = Object.values(this.documentHandle.state.assets).find(existing => existing.src === asset.src);
		if (existingAsset) {
			return existingAsset;
		}

		this.documentHandle.change(state => {
			state.assets[asset.id] = asset;
		}, message ?? `Create asset ${asset.id}`);
		return asset;
	}

	delete(id: string, message?: string) {
		this.documentHandle.change(state => {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete state.assets[id];
		}, message ?? `Delete asset ${id}`);
	}
}

const repo = new Repo({
	network: [
		new BrowserWebSocketClientAdapter('ws://192.168.2.3:3030'),
	],
	storage: new LocalForageStorageAdapter(),
});

export class DocumentHandle {
	public readonly useStore: UseBoundStore<StoreApi<Document>>;
	public readonly layers = new LayerManager(this);
	public readonly assets = new AssetManager(this);
	private readonly store: StoreApi<Document>;
	constructor(private readonly docHandle: DocHandle<SyncedDocument>) {
		this.store = createStore(() => ({
			id: docHandle.documentId,
			camera: {x: 0, y: 0, zoom: 1},
			layers: {},
			assets: {},
		}));
		this.docHandle = docHandle;
		void this.docHandle.value().then(value => {
			this.store.setState(value);
		});
		this.docHandle.on('patch', ({after}) => {
			this.store.setState(after);
		});
		this.useStore = createUseStore(this.store);
	}

	public change(fn: A.ChangeFn<SyncedDocument>, message?: string) {
		this.docHandle.change(fn, {
			message,
		});
	}

	public get state(): Readonly<Document> {
		return this.store.getState();
	}

	public get camera(): Readonly<Camera> {
		return this.state.camera;
	}

	public setCamera(camera: Partial<Camera> | ((camera: Camera) => Partial<Camera>)) {
		this.store.setState(state => ({
			camera: deepmerge(state.camera, typeof camera === 'function' ? camera(state.camera) : camera),
		}));
	}
}

export class DocumentManager {
	private readonly repo = repo;
	private currentDocumentHandle!: DocumentHandle;
	constructor(private readonly app: WhiteboardApp) {
		let documentId = document.location.hash.slice(1);
		console.log('documentId', documentId);
		if (!documentId) {
			documentId = this.create();
			document.location.hash = documentId;
		}

		this.open(documentId);
	}

	public get current() {
		return this.currentDocumentHandle;
	}

	public create() {
		const doc = this.repo.create<SyncedDocument>();
		doc.change(state => {
			state.layers = {};
			state.assets = {};
		});
		return doc.documentId;
	}

	public open(id: string) {
		const doc = this.repo.find<SyncedDocument>(id as DocumentId);
		this.currentDocumentHandle = new DocumentHandle(doc);
	}

	public list() {
		return Object.keys(this.repo.handles);
	}
}

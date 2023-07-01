import {type Layer} from '~core/layers';
import {type Camera, type Patch, type PatchId} from '~core/types';
import {createUseStore, deepmerge} from '~core/utils';
import {createStore, type StoreApi} from 'zustand/vanilla';
import {nanoid} from 'nanoid';
import {type WhiteboardApp} from '~core/WhiteboardApp';
import {type UseBoundStore} from 'zustand';
import {
	type A,
	type Document,
	DocumentSharingClient,
	generateKeyPair,
	IDBStorageProvider,
	mnemonicToSeedSync,
	WebSocketNetworkAdapter,
} from 'ddnet';

type SyncedDocument = {
	layers: Record<string, Layer>;
	assets: Record<string, Asset>;
};

type BaseDocument = {
	id: string;
	camera: Camera;
};

export type DocumentData = BaseDocument & SyncedDocument;

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

	async patch<T extends Layer>(layer: PatchId<T>, message?: string): Promise<void>;
	async patch(layers: Array<PatchId<Layer>>, message?: string): Promise<void>;
	async patch(layers: PatchId<Layer> | Array<PatchId<Layer>>, message?: string): Promise<void> {
		const patches = Array.isArray(layers) ? layers : [layers];
		return this.documentHandle.change(state => {
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

	async change<T extends Layer>(layers: Array<[string, (layer: T) => void]>, message?: string): Promise<void> {
		return this.documentHandle.change(state => {
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

	async add(layer: Layer, message?: string): Promise<void>;
	async add(layers: Layer[], message?: string): Promise<void>;
	async add(layers: Layer | Layer[], message?: string): Promise<void> {
		const newLayers = Array.isArray(layers) ? layers : [layers];
		return this.documentHandle.change(state => {
			for (const layer of newLayers) {
				state.layers[layer.id] = layer as never;
				state.layers[layer.id].timestamp = Date.now();
				console.log('add', layer.id);
			}
		}, message ?? `Set ${newLayers.length} layers`);
	}

	async delete(id: string | string[], message?: string) {
		const ids = Array.isArray(id) ? id : [id];
		return this.documentHandle.change(state => {
			for (const id of ids) {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete state.layers[id];
			}
		}, message ?? `Delete layer ${ids.join(', ')}`);
	}

	async deleteAll(message?: string) {
		return this.documentHandle.change(state => {
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

		void this.documentHandle.change(state => {
			state.assets[asset.id] = asset;
		}, message ?? `Create asset ${asset.id}`);
		return asset;
	}

	delete(id: string, message?: string) {
		void this.documentHandle.change(state => {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete state.assets[id];
		}, message ?? `Delete asset ${id}`);
	}
}

const repo = new DocumentSharingClient({
	...generateKeyPair(
		mnemonicToSeedSync('accident observe boss minute mixture goddess trash craft candy smooth rubber coffee'),
	),
	network: new WebSocketNetworkAdapter('wss://ddnet-server.fly.dev'),
	storageProvider: new IDBStorageProvider(),
});
const connected = repo.connect();

export class DocumentHandle {
	public readonly useStore: UseBoundStore<StoreApi<DocumentData>>;
	public readonly layers = new LayerManager(this);
	public readonly assets = new AssetManager(this);
	private readonly store: StoreApi<DocumentData>;
	constructor(documentId: string, private readonly docHandle: Promise<Document<SyncedDocument>>) {
		this.store = createStore(() => ({
			id: documentId,
			camera: {x: 0, y: 0, zoom: 1},
			layers: {},
			assets: {},
		}));
		void this.docHandle.then(doc => {
			this.store.setState(doc.data);
			doc.on('patch', ({after}) => {
				this.store.setState(after);
			});
		});
		this.useStore = createUseStore(this.store);
	}

	public async change(fn: A.ChangeFn<SyncedDocument>, message?: string) {
		(await this.docHandle).change(fn, {message});
	}

	public get state(): Readonly<DocumentData> {
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
		const doc = this.repo.createDocument<SyncedDocument>();
		doc.change(state => {
			state.layers = {};
			state.assets = {};
		});
		return doc.id;
	}

	public open(id: string) {
		this.currentDocumentHandle = new DocumentHandle(id, connected.then(async () => this.repo.requestDocument(id)));
	}

	public async list() {
		return this.repo.listDocumentIds();
	}
}

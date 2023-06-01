import {type Layer} from '~core/layers';
import {type Camera, type Patch, type PatchId} from '~core/types';
import {DistributedStateManager} from '~core/state/DistributedStateManager';
import {createUseStore, deepmerge} from '~core/utils';
import {createStore, type StoreApi} from 'zustand/vanilla';
import {type UseBoundStore} from 'zustand';

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

class LayerManager {
	constructor(private readonly documentManager: DocumentManager) {
		this.documentManager = documentManager;
	}

	get<T extends Layer>(id: string): T | undefined;
	get(id: string[]): Layer[];
	get(id: string | string[]): Layer | Layer[] | undefined {
		if (Array.isArray(id)) {
			return id.map(id => this.documentManager.state.layers[id]).filter(Boolean);
		}

		return this.documentManager.state.layers[id] as Layer | undefined;
	}

	getAll() {
		return Object.values(this.documentManager.state.layers);
	}

	patch<T extends Layer>(layer: PatchId<T>, message?: string): void;
	patch(layers: Array<PatchId<Layer>>, message?: string): void;
	patch(layers: PatchId<Layer> | Array<PatchId<Layer>>, message?: string): void {
		const patches = Array.isArray(layers) ? layers : [layers];
		this.documentManager.patch({
			layers: patches.reduce<Record<string, Patch<Layer>>>((acc, layer) => {
				acc[layer.id] = layer;
				return acc;
			}, {}),
		}, message ?? `Update ${patches.length} layers`);
	}

	change(layer: Record<string, <T extends Layer>(layer: T) => void>, message?: string): void {
		this.documentManager.change(state => {
			for (const [id, fn] of Object.entries(layer)) {
				const currentLayer = state.layers[id];
				if (!currentLayer) {
					continue;
				}

				fn(currentLayer as never);
			}
		}, message ?? `Set ${Object.keys(layer).length} layers`);
	}

	add(layer: Layer, message?: string): void;
	add(layers: Layer[], message?: string): void;
	add(layers: Layer | Layer[], message?: string) {
		const newLayers = Array.isArray(layers) ? layers : [layers];
		this.documentManager.change(state => {
			for (const layer of newLayers) {
				state.layers[layer.id] = layer as never;
			}
		}, message ?? `Set ${newLayers.length} layers`);
	}

	delete(id: string | string[], message?: string) {
		const ids = Array.isArray(id) ? id : [id];
		this.documentManager.change(state => {
			for (const id of ids) {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete state.layers[id];
			}
		}, message ?? `Delete layer ${ids.join(', ')}`);
	}

	deleteAll(message?: string) {
		this.documentManager.change(state => {
			state.layers = {};
		}, message ?? 'Delete all layers');
	}
}

class AssetManager {
	constructor(private readonly documentManager: DocumentManager) {
		this.documentManager = documentManager;
	}

	get(id: string | undefined) {
		if (!id) {
			return undefined;
		}

		return this.documentManager.state.assets[id] as Asset | undefined;
	}

	getAll() {
		return Object.values(this.documentManager.state.assets);
	}

	patch(asset: PatchId<Asset>, message?: string) {
		this.documentManager.patch({
			assets: {
				[asset.id]: asset,
			},
		}, message ?? `Update asset ${asset.id}`);
	}

	create(asset: Asset, message?: string) {
		const existingAsset = Object.values(this.documentManager.state.assets).find(existing => existing.src === asset.src);
		if (existingAsset) {
			return existingAsset;
		}

		this.documentManager.change(state => {
			state.assets[asset.id] = asset;
		}, message ?? `Create asset ${asset.id}`);
		return asset;
	}

	delete(id: string, message?: string) {
		this.documentManager.change(state => {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete state.assets[id];
		}, message ?? `Delete asset ${id}`);
	}
}

export class DocumentManager extends DistributedStateManager<SyncedDocument> {
	public useStore: UseBoundStore<StoreApi<Document>>;
	public readonly layer = new LayerManager(this);
	public readonly asset = new AssetManager(this);
	private readonly store: StoreApi<Document>;
	constructor(initialState: Document) {
		const {layers, assets} = initialState;
		super({
			defaultState: {
				layers,
				assets,
			},
		});
		this.store = createStore(() => initialState);
		this.useStore = createUseStore(this.store);
	}

	public get id(): string {
		return this.state.id;
	}

	public get state(): Readonly<Document> {
		return this.store.getState();
	}

	public get camera(): Readonly<Camera> {
		return this.state.camera;
	}

	public set camera(camera: Partial<Camera>) {
		this.store.setState({
			camera: deepmerge(this.state.camera, camera),
		});
	}

	protected onChange = (state: SyncedDocument) => {
		this.store.setState(state);
	};
}

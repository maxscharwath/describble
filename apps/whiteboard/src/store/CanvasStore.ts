import {type LayerData, Layers} from '../components/layers/Layer';
import {create, useStore} from 'zustand';
import {persist, type PersistStorage, type StorageValue} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';
import {del, get, set} from 'idb-keyval';
import {temporal} from 'zundo';
import computed from 'zustand-computed';

type LayerStore = {
	layerMap: Map<string, LayerData>;
	layersOrder: string[];
	addLayer: (...layers: LayerData[]) => void;
	removeLayer: (...layerUuids: string[]) => void;
	setOrder: (order: LayerData[]) => void;
	setLayer: (...layers: LayerData[]) => void;
	clearLayers: () => void;
};

type LayerStoreComputed = {
	layers: LayerData[];
};

const computedState = (state: LayerStore): LayerStoreComputed => ({
	layers: state.layersOrder.map(uuid => state.layerMap.get(uuid)!),
});

const indexDbStorage: PersistStorage<LayerStore> = {
	async getItem(name) {
		const item = await get<string>(name);
		if (!item) {
			return null;
		}

		const parsed = JSON.parse(item) as StorageValue<LayerStore>;
		return {
			...parsed,
			state: {
				...parsed.state,
				layerMap: new Map(parsed.state.layerMap),
			},
		};
	},

	async setItem(name, value) {
		await set(name, JSON.stringify({
			...value,
			state: {
				...value.state,
				layerMap: Array.from(value.state.layerMap.entries()),
			},
		}));
	},

	async removeItem(name) {
		await del(name);
	},
};

export const layersStore = create<LayerStore>()(
	computed(
		temporal(
			persist(set => ({
				layerMap: new Map(),
				layersOrder: [],
				addLayer(...layers: LayerData[]) {
					set(state => {
						const newLayers = new Map(state.layerMap);
						const newLayersOrder = [...state.layersOrder];

						layers.forEach(layer => {
							const parsedLayer = Layers.getFactory(layer.type)?.schema.safeParse(layer);
							if (!parsedLayer?.success) {
								return;
							}

							newLayers.set(layer.uuid, parsedLayer.data);
							newLayersOrder.push(layer.uuid);
						});

						return {
							layerMap: newLayers,
							layersOrder: newLayersOrder,
						};
					});
				},
				removeLayer(...layerUuids: string[]) {
					set(state => {
						const layers = new Map(state.layerMap);
						layerUuids.forEach(layerId => layers.delete(layerId));
						return {
							layerMap: layers,
							layersOrder: state.layersOrder.filter(id => !layerUuids.includes(id)),
						};
					});
				},
				setLayer(...layers: LayerData[]) {
					set(state => {
						const newLayers = new Map(state.layerMap);
						layers.forEach(layer => {
							const parsedLayer = Layers.getFactory(layer.type)?.schema.safeParse(layer);
							if (!parsedLayer?.success) {
								return;
							}

							newLayers.set(layer.uuid, parsedLayer.data);
						});

						return {
							layerMap: newLayers,
						};
					});
				},
				clearLayers() {
					set(state => ({
						layerMap: new Map(),
						layersOrder: [],
					}));
				},
				setOrder(order: LayerData[]) {
					set({
						layersOrder: order.map(layer => layer.uuid),
					});
				},
			}), {
				name: 'canvas',
				storage: indexDbStorage,
			}))
		, computedState));

export function useLayersStore(): LayerStore & LayerStoreComputed;
export function useLayersStore<T>(selector: (state: LayerStore & LayerStoreComputed) => T): T;
export function useLayersStore<T>(selector?: (state: LayerStore & LayerStoreComputed) => T): T {
	return useStore(layersStore, selector!, shallow);
}

export const useHistory = () => useStore(layersStore.temporal);

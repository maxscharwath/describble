import {BaseActivity} from '~core/activities/BaseActivity';
import {getLayerUtil, type Layer} from '~core/layers';
import {type Point} from '~core/types';
import {type WhiteboardCommand, type WhiteboardPatch} from '~core/WhiteboardApp';
import {Vector} from '~core/utils';

export class TranslateActivity extends BaseActivity {
	type = 'translate' as const;
	private initialLayers: Layer[] = [];
	private initialSelectedLayers: string[] = [];
	private iniPos?: Point;

	start(): WhiteboardPatch {
		this.iniPos = this.app.currentPoint;
		this.initialSelectedLayers = this.app.state.appState.selectedLayers;
		this.initialLayers = this.app.getLayers(this.initialSelectedLayers);
		return {
			appState: {
				selectedLayers: [],
			},
		};
	}

	update(): WhiteboardPatch | void {
		if (!this.iniPos) {
			return;
		}

		const delta = new Vector(this.app.currentPoint).subtract(this.iniPos);
		const layers: Record<string, Partial<Layer>> = {};

		for (const layer of this.initialLayers) {
			const layerUtil = getLayerUtil(layer);
			layers[layer.id] = layerUtil.translate(layer as never, delta.toPoint());
		}

		return {
			documents: {
				[this.app.currentDocumentId]: {
					layers,
				},
			},
		};
	}

	complete(): WhiteboardCommand {
		const beforeLayers: Record<string, Partial<Layer>> = {};
		const afterLayers: Record<string, Partial<Layer>> = {};

		for (const layer of this.initialLayers) {
			beforeLayers[layer.id] = layer;
			afterLayers[layer.id] = this.app.getLayer(layer.id)!;
		}

		return {
			id: 'translate-layer',
			before: {
				documents: {
					[this.app.currentDocumentId]: {
						layers: beforeLayers,
					},
				},
				appState: {
					selectedLayers: this.initialSelectedLayers,
				},
			},
			after: {
				documents: {
					[this.app.currentDocumentId]: {
						layers: afterLayers,
					},
				},
				appState: {
					selectedLayers: this.initialSelectedLayers,
				},
			},
		};
	}

	abort(): WhiteboardPatch | void {
		if (!this.iniPos) {
			return;
		}

		const layers: Record<string, Partial<Layer>> = {};

		for (const layer of this.initialLayers) {
			layers[layer.id] = layer;
		}

		return {
			documents: {
				[this.app.currentDocumentId]: {
					layers,
				},
			},
			appState: {
				selectedLayers: this.initialSelectedLayers,
			},
		};
	}
}

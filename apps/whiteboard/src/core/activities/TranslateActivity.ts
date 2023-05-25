import {BaseActivity} from '~core/activities/BaseActivity';
import {getLayerUtil, type Layer} from '~core/layers';
import {type Point} from '~core/types';
import {type WhiteboardCommand, type WhiteboardPatch} from '~core/WhiteboardApp';
import {Vector} from '~core/utils';

export class TranslateActivity extends BaseActivity {
	type = 'translate' as const;
	private initialLayers: Layer[] = [];
	private iniPos?: Point;

	start(): void {
		this.iniPos = this.app.currentPoint;
		this.initialLayers = this.app.getLayers(this.app.state.appState.selectedLayers);
	}

	update(): WhiteboardPatch | void {
		if (!this.iniPos) {
			return;
		}

		const delta = Vector.subtract(this.app.currentPoint, this.iniPos);
		const layers: Record<string, Partial<Layer>> = {};

		for (const layer of this.initialLayers) {
			const layerUtil = getLayerUtil(layer);
			layers[layer.id] = layerUtil.translate(layer as never, delta);
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
			},
			after: {
				documents: {
					[this.app.currentDocumentId]: {
						layers: afterLayers,
					},
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
		};
	}
}

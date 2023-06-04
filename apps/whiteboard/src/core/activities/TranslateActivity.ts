import {BaseActivity} from '~core/activities/BaseActivity';
import {getLayerUtil, type Layer} from '~core/layers';
import {type Point} from '~core/types';
import {Vector} from '~core/utils';
import {type BaseLayerUtil} from '~core/layers/BaseLayerUtil';

export class TranslateActivity extends BaseActivity {
	type = 'translate' as const;
	private initialLayers: Layer[] = [];
	private iniPos?: Point;

	start(): void {
		this.iniPos = this.app.currentPoint;
		this.initialLayers = this.app.document.layer.get(this.app.state.appState.selectedLayers);
	}

	update(): void {
		if (!this.iniPos) {
			return;
		}

		const delta = Vector.subtract(this.app.currentPoint, this.iniPos);
		this.app.document.layer.change(Object.fromEntries(this.initialLayers.map(layer => {
			const util = getLayerUtil(layer) as BaseLayerUtil<Layer>;
			return [layer.id, (l: Layer) => {
				util.translate(l, delta);
			}];
		}, 'translate-layer')));
	}

	complete(): void {
		// Do nothing
	}

	abort(): void {
		if (!this.iniPos) {
			return;
		}

		const layers: Record<string, Partial<Layer>> = {};

		for (const layer of this.initialLayers) {
			layers[layer.id] = layer;
		}

		this.app.document.patch({
			layers,
		}, 'abort-translate-layer');
	}
}

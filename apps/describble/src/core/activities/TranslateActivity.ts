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
		this.initialLayers = this.app.document.layers.get(this.app.state.appState.selectedLayers);
	}

	update(): void {
		if (!this.iniPos) {
			return;
		}

		const delta = Vector.subtract(this.app.currentPoint, this.iniPos);
		this.app.document.layers.change(this.initialLayers.map(layer => {
			const util = getLayerUtil(layer) as BaseLayerUtil<Layer>;
			return [layer.id, (l: Layer) => {
				util.translate(l, layer, delta);
			}];
		}, 'translate-layer'));
	}

	complete(): void {
		if (!this.iniPos) {
			return;
		}

		const {layers} = this.app.document.state;

		this.app.document.addCommand({
			message: 'Translate layers',
			before: state => {
				this.initialLayers.forEach(layer => {
					state.layers[layer.id].position = {...layer.position};
					state.layers[layer.id].timestamp = Date.now();
				});
			},
			after: state => {
				this.initialLayers.forEach(layer => {
					state.layers[layer.id].position = {...layers[layer.id].position};
					state.layers[layer.id].timestamp = Date.now();
				});
			},
		});
	}

	abort(): void {
		if (!this.iniPos) {
			return;
		}

		this.app.document.layers.change(this.initialLayers.map(layer => [layer.id, (l: Layer) => {
			l.position = {...layer.position};
		}], 'abort-translate-layer'));
	}
}

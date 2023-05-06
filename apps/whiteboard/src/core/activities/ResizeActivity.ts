import {BaseActivity} from './BaseActivity';
import {type WhiteboardApp, type WhiteboardCommand, type WhiteboardPatch} from '../WhiteboardApp';
import {getLayerUtil, type Layer} from '../layers';
import {normalizeBounds} from '../utils';

export class ResizeActivity extends BaseActivity {
	type = 'resize' as const;
	private readonly initLayer: Layer | undefined;

	constructor(app: WhiteboardApp, private readonly layerId: string, private readonly create = false) {
		super(app);
		this.initLayer = app.getLayer(layerId);
	}

	abort(): WhiteboardPatch {
		return {
			documents: {
				[this.app.currentDocumentId]: {
					layers: {
						[this.layerId]: this.create ? undefined : this.initLayer,
					},
				},
			},
		};
	}

	complete(): WhiteboardCommand | void {
		const layer = this.app.getLayer(this.layerId);
		if (!this.initLayer || !layer) {
			return;
		}

		return {
			id: 'resize-layer',
			before: {
				documents: {
					[this.app.currentDocumentId]: {
						layers: {
							[layer.id]: this.create ? undefined : this.initLayer,
						},
					},
				},
			},
			after: {
				documents: {
					[this.app.currentDocumentId]: {
						layers: {
							[layer.id]: layer,
						},
					},
				},
			},
		};
	}

	start(): void {
		//
	}

	update(): WhiteboardPatch | void {
		const layer = this.app.getLayer(this.layerId);
		if (!this.initLayer || !layer) {
			return;
		}

		const initPoint = this.initLayer.position;
		const utils = getLayerUtil(layer);
		const resized = utils.resize(this.initLayer as never, normalizeBounds({
			x: initPoint.x,
			y: initPoint.y,
			width: this.app.currentPoint.x - initPoint.x,
			height: this.app.currentPoint.y - initPoint.y,
		}));
		return {
			documents: {
				[this.app.currentDocumentId]: {
					layers: {
						[layer.id]: resized,
					},
				},
			},
		};
	}
}

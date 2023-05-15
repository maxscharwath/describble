import {BaseActivity} from '~core/activities/BaseActivity';
import {type WhiteboardApp, type WhiteboardCommand, type WhiteboardPatch} from '~core/WhiteboardApp';
import {getLayerUtil, type Layer} from '~core/layers';
import {normalizeBounds} from '~core/utils';
import {match} from 'ts-pattern';
import {type Bounds, BoundsHandle} from '~core/types';
import {type BaseLayerUtil} from '~core/layers/BaseLayerUtil';

export class ResizeActivity extends BaseActivity {
	type = 'resize' as const;
	private readonly initLayer: Layer;
	private readonly utils: BaseLayerUtil<any>;
	private readonly initBounds: Bounds;

	constructor(app: WhiteboardApp, private readonly layerId: string, private readonly create = false, private readonly resizeCorner: BoundsHandle = BoundsHandle.BOTTOM_RIGHT) {
		super(app);
		this.initLayer = app.getLayer(layerId)!;
		this.utils = getLayerUtil(this.initLayer);
		this.initBounds = this.utils.getBounds(this.initLayer);
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

	complete(): WhiteboardCommand | WhiteboardPatch | void {
		const layer = this.app.getLayer(this.layerId);
		if (!this.initLayer || !layer) {
			return;
		}

		if (this.create) {
			const bounds = normalizeBounds(getLayerUtil(layer).getBounds(layer as never));
			if (bounds.width < 2 || bounds.height < 2) {
				return this.abort();
			}
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
		const {x, y, width, height} = this.initBounds;
		const newBounds = match(this.resizeCorner)
			.with(BoundsHandle.BOTTOM_RIGHT, () => ({
				x,
				y,
				width: this.app.currentPoint.x - x,
				height: this.app.currentPoint.y - y,
			}))
			.with(BoundsHandle.BOTTOM_LEFT, () => ({
				x: this.app.currentPoint.x,
				y,
				width: x - this.app.currentPoint.x + width,
				height: this.app.currentPoint.y - y,
			}))
			.with(BoundsHandle.TOP_LEFT, () => ({
				x: this.app.currentPoint.x,
				y: this.app.currentPoint.y,
				width: x - this.app.currentPoint.x + width,
				height: y - this.app.currentPoint.y + height,
			}))
			.with(BoundsHandle.TOP_RIGHT, () => ({
				x,
				y: this.app.currentPoint.y,
				width: this.app.currentPoint.x - x,
				height: y - this.app.currentPoint.y + height,
			}))
			.otherwise(() => ({
				x,
				y,
				width,
				height,
			}));

		const resized = this.utils.resize(this.initLayer, normalizeBounds(newBounds));
		return {
			documents: {
				[this.app.currentDocumentId]: {
					layers: {
						[this.initLayer.id]: resized,
					},
				},
			},
		};
	}
}

import {BaseActivity} from '~core/activities/BaseActivity';
import {type WhiteboardApp, type WhiteboardCommand, type WhiteboardPatch} from '~core/WhiteboardApp';
import {getLayerUtil, type Layer} from '~core/layers';
import {normalizeBounds} from '~core/utils';
import {match} from 'ts-pattern';
import {type Bounds, BoundsHandle, type Point} from '~core/types';
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
		const newBounds = resizeBounds(this.initBounds, this.app.currentPoint, this.resizeCorner);
		const resized = this.utils.resize(this.initLayer, newBounds);
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

export function resizeBounds(bounds: Bounds, point: Point, resizeCorner: BoundsHandle): Bounds {
	const {x, y, width, height} = bounds;
	return match(resizeCorner)
		.with(BoundsHandle.BOTTOM_RIGHT, () => ({
			x,
			y,
			width: point.x - x,
			height: point.y - y,
		}))
		.with(BoundsHandle.BOTTOM_LEFT, () => ({
			x: point.x,
			y,
			width: x - point.x + width,
			height: point.y - y,
		}))
		.with(BoundsHandle.TOP_LEFT, () => ({
			x: point.x,
			y: point.y,
			width: x - point.x + width,
			height: y - point.y + height,
		}))
		.with(BoundsHandle.TOP_RIGHT, () => ({
			x,
			y: point.y,
			width: point.x - x,
			height: y - point.y + height,
		}))
		.otherwise(() => bounds);
}

import {BaseActivity} from '~core/activities/BaseActivity';
import {type WhiteboardApp, type WhiteboardCommand, type WhiteboardPatch} from '~core/WhiteboardApp';
import {getLayerUtil, type Layer} from '~core/layers';
import {normalizeBounds} from '~core/utils';
import {type Bounds, BoundsHandle, type Point} from '~core/types';
import {type BaseLayerUtil} from '~core/layers/BaseLayerUtil';

export class ResizeActivity extends BaseActivity {
	type = 'resize' as const;
	private readonly initLayer: Layer;
	private readonly utils: BaseLayerUtil<any>;
	private readonly initBounds: Bounds;
	private readonly aspectRatio?: number;

	constructor(app: WhiteboardApp, private readonly layerId: string, private readonly create = false, private readonly resizeCorner: BoundsHandle = BoundsHandle.BOTTOM + BoundsHandle.RIGHT) {
		super(app);
		this.initLayer = app.getLayer(layerId)!;
		this.utils = getLayerUtil(this.initLayer);
		this.initBounds = this.utils.getBounds(this.initLayer);
		if (this.initBounds.width && this.initBounds.height) {
			this.aspectRatio = this.initBounds.width / this.initBounds.height;
		}
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
		let aspectRatio;
		if (this.app.keyboardEvent.event?.shiftKey) {
			aspectRatio = this.aspectRatio;
		}

		const newBounds = resizeBounds(this.initBounds, this.app.currentPoint, this.resizeCorner, aspectRatio);
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

export function resizeBounds(bounds: Bounds, point: Point, resizeCorner: BoundsHandle, aspectRatio?: number): Bounds {
	const {x, y, width, height} = bounds;
	const newX = (resizeCorner & BoundsHandle.LEFT) ? point.x : x;
	const newY = (resizeCorner & BoundsHandle.TOP) ? point.y : y;
	let newWidth = (resizeCorner & BoundsHandle.LEFT) ? x - point.x + width : (resizeCorner & BoundsHandle.RIGHT) ? point.x - x : width;
	let newHeight = (resizeCorner & BoundsHandle.TOP) ? y - point.y + height : (resizeCorner & BoundsHandle.BOTTOM) ? point.y - y : height;

	if (aspectRatio && width && height) {
		if (resizeCorner & BoundsHandle.RIGHT || resizeCorner & BoundsHandle.LEFT) {
			newHeight = newWidth / aspectRatio;
		} else if (resizeCorner & BoundsHandle.TOP || resizeCorner & BoundsHandle.BOTTOM) {
			newWidth = newHeight * aspectRatio;
		}
	}

	return {
		x: newX,
		y: newY,
		width: newWidth,
		height: newHeight,
	};
}


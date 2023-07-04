import {BaseActivity} from '~core/activities/BaseActivity';
import {type WhiteboardApp} from '~core/WhiteboardApp';
import {getLayerUtil, type Layer} from '~core/layers';
import {normalizeBounds} from '~core/utils';
import {type Bounds, BoundsHandle, type Point} from '~core/types';
import {type BaseLayerUtil} from '~core/layers/BaseLayerUtil';

export class ResizeActivity extends BaseActivity {
	type = 'resize' as const;
	private readonly initLayer: Layer;
	private readonly utils: BaseLayerUtil<Layer>;
	private readonly initBounds: Bounds;
	private readonly aspectRatio?: number;

	constructor(app: WhiteboardApp, private readonly layerId: string, private readonly create = false, private readonly resizeCorner: BoundsHandle = BoundsHandle.BOTTOM + BoundsHandle.RIGHT) {
		super(app);
		this.initLayer = app.document.layers.get(layerId)!;
		this.utils = getLayerUtil(this.initLayer as never);
		this.initBounds = this.utils.getBounds(this.initLayer);
		if (this.initBounds.width && this.initBounds.height) {
			this.aspectRatio = this.initBounds.width / this.initBounds.height;
		}
	}

	abort(): void {
		if (this.create) {
			this.app.document.layers.delete(this.layerId, 'reset-layer');
		} else {
			this.app.document.layers.patch(this.initLayer, 'reset-layer');
		}
	}

	complete(): void {
		const layer = this.app.document.layers.get(this.layerId);
		if (!this.initLayer || !layer) {
			return;
		}

		if (this.create) {
			const bounds = normalizeBounds(getLayerUtil(layer).getBounds(layer as never));
			if (bounds.width < 2 || bounds.height < 2) {
				return this.abort();
			}
		}
	}

	start(): void {
		//
	}

	update(): void {
		if (!this.initLayer) {
			return;
		}

		let aspectRatio;
		if (this.app.keyboardEvent.event?.shiftKey) {
			aspectRatio = this.aspectRatio;
		}

		const newBounds = resizeBounds(this.initBounds, this.app.currentPoint, this.resizeCorner, aspectRatio);
		this.app.document.layers.change([
			[this.layerId, layer => {
				this.utils.resize(layer, this.initLayer, newBounds);
			}],
		]);
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


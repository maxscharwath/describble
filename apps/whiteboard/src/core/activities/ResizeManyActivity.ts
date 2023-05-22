import {BaseActivity} from '~core/activities/BaseActivity';
import {getLayerUtil, type Layer} from '~core/layers';
import {type BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, BoundsHandle} from '~core/types';
import {type WhiteboardApp, type WhiteboardCommand, type WhiteboardPatch} from '~core/WhiteboardApp';
import {resizeBounds} from '~core/activities/ResizeActivity';

export class ResizeManyActivity extends BaseActivity {
	type = 'resize-many' as const;
	private readonly initLayers: Record<string, Layer>;
	private readonly utils: Record<string, BaseLayerUtil<any>>;
	private readonly initBounds: Bounds;
	private readonly aspectRatio?: number;

	constructor(app: WhiteboardApp, private readonly layerIds: string[], private readonly create = false, private readonly resizeCorner: BoundsHandle = BoundsHandle.BOTTOM + BoundsHandle.RIGHT) {
		super(app);
		this.initLayers = {};
		this.utils = {};
		layerIds.forEach(id => {
			const layer = app.getLayer(id);
			if (layer) {
				this.initLayers[id] = layer;
				this.utils[id] = getLayerUtil(layer);
			}
		});
		this.initBounds = this.getMultiLayerBounds();
		if (this.initBounds.width && this.initBounds.height) {
			this.aspectRatio = this.initBounds.width / this.initBounds.height;
		}
	}

	public abort(): WhiteboardPatch {
		return {
			documents: {
				[this.app.currentDocumentId]: {
					layers: this.create ? undefined : {...this.initLayers},
				},
			},
		};
	}

	public complete(): WhiteboardCommand | WhiteboardPatch | void {
		const newLayers: Record<string, Layer> = {};
		for (const id of this.layerIds) {
			const layer = this.app.getLayer(id);
			if (layer) {
				newLayers[id] = layer;
			}
		}

		return {
			id: 'resize-layers',
			before: {
				documents: {
					[this.app.currentDocumentId]: {
						layers: this.create ? undefined : {...this.initLayers},
					},
				},
			},
			after: {
				documents: {
					[this.app.currentDocumentId]: {
						layers: newLayers,
					},
				},
			},
		};
	}

	public start(): void {
		//
	}

	public update(): WhiteboardPatch | void {
		// Compute new overall bounds
		const {x, y, width, height} = this.initBounds;

		let aspectRatio;
		if (this.app.keyboardEvent.event?.shiftKey) {
			aspectRatio = this.aspectRatio;
		}

		const newBounds = resizeBounds(this.initBounds, this.app.currentPoint, this.resizeCorner, aspectRatio);

		// Compute scaling and translation factors
		const scaleX = newBounds.width / width;
		const scaleY = newBounds.height / height;
		const deltaX = newBounds.x - x;
		const deltaY = newBounds.y - y;

		// Apply scaling and translation to each layer
		const newLayers: Record<string, Partial<Layer>> = {};
		for (const id of this.layerIds) {
			const layer = this.initLayers[id];
			const util = this.utils[id];
			const {x: lx, y: ly, width: lw, height: lh} = util.getBounds(layer);
			const resizedBounds = {
				x: x + ((lx - x) * scaleX) + deltaX,
				y: y + ((ly - y) * scaleY) + deltaY,
				width: lw * scaleX,
				height: lh * scaleY,
			};
			newLayers[id] = util.resize(layer, resizedBounds);
		}

		return {
			documents: {
				[this.app.currentDocumentId]: {
					layers: newLayers,
				},
			},
		};
	}

	private getMultiLayerBounds(): Bounds {
		// Compute the minimal bounding box that includes all layers' bounds.
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		Object.values(this.initLayers).forEach(layer => {
			const {x, y, width, height} = this.utils[layer.id].getBounds(layer);
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x + width);
			maxY = Math.max(maxY, y + height);
		});
		return {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
	}
}

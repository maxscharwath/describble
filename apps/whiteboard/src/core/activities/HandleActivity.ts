import {type Bounds, type Point} from '~core/types';
import {BaseActivity} from '~core/activities/BaseActivity';
import {getLayerUtil, type Layer} from '~core/layers';
import {type BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type WhiteboardApp, type WhiteboardCommand, type WhiteboardPatch} from '~core/WhiteboardApp';

export class HandleActivity extends BaseActivity {
	type = 'handle' as const;
	private readonly initLayer: Layer;
	private readonly utils: BaseLayerUtil<any>;
	private readonly initBounds: Bounds;

	constructor(app: WhiteboardApp, private readonly layerId: string, private readonly handleIndex: number) {
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
						[this.layerId]: this.initLayer,
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

		return {
			id: 'move-handle',
			before: {
				documents: {
					[this.app.currentDocumentId]: {
						layers: {
							[layer.id]: this.initLayer,
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
		// Define the behavior when the handle activity starts.
	}

	update(): WhiteboardPatch | void {
		const layer = this.app.getLayer(this.layerId);
		if (!layer) {
			return;
		}

		const {handles, position} = layer;
		const handle = handles?.[this.handleIndex];
		if (!handle || !handles) {
			return;
		}

		const newHandle = moveHandle(handle, this.app.currentPoint, position);
		const updatedLayer = this.utils.setHandle(layer, this.handleIndex, newHandle);

		return {
			documents: {
				[this.app.currentDocumentId]: {
					layers: {
						[layer.id]: updatedLayer,
					},
				},
			},
		};
	}
}

function moveHandle(handle: Point, newPoint: Point, layerPosition: Point): Point {
	return {
		x: newPoint.x - layerPosition.x,
		y: newPoint.y - layerPosition.y,
	};
}

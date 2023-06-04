import {type Bounds, type Handle, type Point} from '~core/types';
import {BaseActivity} from '~core/activities/BaseActivity';
import {getLayerUtil, type Layer} from '~core/layers';
import {type BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type WhiteboardApp} from '~core/WhiteboardApp';

export class HandleActivity extends BaseActivity {
	type = 'handle' as const;
	private readonly initLayer: Layer;
	private readonly utils: BaseLayerUtil<any>;
	private readonly initBounds: Bounds;

	constructor(app: WhiteboardApp, private readonly layerId: string, private readonly handleIndex: number) {
		super(app);
		this.initLayer = app.document.layer.get(layerId)!;
		this.utils = getLayerUtil(this.initLayer);
		this.initBounds = this.utils.getBounds(this.initLayer);
	}

	abort() {
		this.app.document.layer.patch(this.initLayer, 'reset-layer');
	}

	complete(): void {
		// Define the behavior when the handle activity completes.
	}

	start(): void {
		// Define the behavior when the handle activity starts.
	}

	update(): void {
		this.app.document.layer.change({
			[this.layerId]: layer => {
				const {handles, position} = layer;
				const handle = handles?.[this.handleIndex];
				if (!handle || !handles) {
					return;
				}

				const newHandle = moveHandle(handle, this.app.currentPoint, position);
				this.utils.setHandle(layer, this.handleIndex, newHandle);
			},
		}, 'resize-layer');
	}
}

function moveHandle(handle: Handle, newPoint: Point, layerPosition: Point): Handle {
	return {
		...handle,
		x: newPoint.x - layerPosition.x,
		y: newPoint.y - layerPosition.y,
	};
}

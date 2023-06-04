import {BaseActivity} from '~core/activities/BaseActivity';
import {type WhiteboardApp} from '~core/WhiteboardApp';
import {type Layer} from '~core/layers';
import {type PathLayer} from '~core/layers/Path';

export class DrawActivity extends BaseActivity {
	type = 'draw' as const;
	private readonly initLayer: Layer | undefined;

	constructor(app: WhiteboardApp, private readonly layerId: string) {
		super(app);
		this.initLayer = app.document.layer.get(layerId);
	}

	abort() {
		this.app.document.layer.delete(this.layerId);
	}

	complete(): void {
		const layer = this.app.document.layer.get<PathLayer>(this.layerId);
		if (!this.initLayer || !layer) {
			return;
		}

		if (layer.path.length < 2) {
			return this.abort();
		}
	}

	start(): void {
		//
	}

	update(): void {
		const layer = this.app.document.layer.get<PathLayer>(this.layerId);
		if (!this.initLayer || !layer) {
			return;
		}

		this.app.document.layer.change({
			[layer.id]: (layer: PathLayer) => {
				const {x, y, pressure} = this.app.currentPoint;
				const initPoint = this.initLayer!.position;
				const point = [x - initPoint.x, y - initPoint.y, pressure];
				const lastPoint = layer.path[layer.path.length - 1];
				if (lastPoint) {
					const delta: number = Math.hypot(point[0] - lastPoint[0], point[1] - lastPoint[1]);
					if (delta < 1) {
						return;
					}
				}

				layer.path.push(point);
			},
		}, 'add-point');
	}
}

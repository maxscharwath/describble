import {BaseActivity} from './BaseActivity';
import {type WhiteboardApp, type WhiteboardCommand, type WhiteboardPatch} from '../WhiteboardApp';
import {type Layer} from '../layers';
import {type PathLayer} from '../layers/Path';

export class DrawActivity extends BaseActivity {
	type = 'draw' as const;
	private readonly initLayer: Layer | undefined;
	private readonly path: number[][] = [];

	constructor(app: WhiteboardApp, private readonly layerId: string) {
		super(app);
		this.initLayer = app.getLayer(layerId);
	}

	abort(): WhiteboardPatch {
		return {
			document: {
				layers: {
					[this.layerId]: undefined,
				},
			},
		};
	}

	complete(): WhiteboardPatch | WhiteboardCommand | void {
		const layer = this.app.getLayer<PathLayer>(this.layerId);
		if (!this.initLayer || !layer) {
			return;
		}

		if (this.path.length < 2) {
			return this.abort();
		}

		return {
			id: 'draw-layer',
			before: {
				document: {
					layers: {
						[layer.id]: undefined,
					},
				},
			},
			after: {
				document: {
					layers: {
						[layer.id]: layer,
					},
				},
			},
		};
	}

	start(): void {
		//
	}

	update(): WhiteboardPatch | void {
		const layer = this.app.getLayer<PathLayer>(this.layerId);
		if (!this.initLayer || !layer) {
			return;
		}

		this.addPoint();

		return {
			document: {
				layers: {
					[layer.id]: {
						path: this.path,
					},
				},
			},
		};
	}

	private addPoint(): void {
		const {x, y, pressure} = this.app.currentPoint;
		const initPoint = this.initLayer!.position;
		const point = [x - initPoint.x, y - initPoint.y, pressure];
		const lastPoint = this.path.at(-1);
		if (lastPoint) {
			const delta: number = Math.hypot(point[0] - lastPoint[0], point[1] - lastPoint[1]);
			if (delta < 1) {
				return;
			}
		}

		this.path.push(point);
	}
}

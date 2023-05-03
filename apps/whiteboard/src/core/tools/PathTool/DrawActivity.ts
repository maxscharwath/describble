import {BaseActivity} from '../BaseActivity';
import {type WhiteboardApp, type WhiteboardCommand, type WhiteboardPatch} from '../../WhiteboardApp';
import {type Layer} from '../../layers';
import {type PathLayer} from '../../layers/Path';

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

	complete(): WhiteboardCommand | void {
		const layer = this.app.getLayer<PathLayer>(this.layerId);
		if (!this.initLayer || !layer) {
			return;
		}

		return {
			id: 'resize-layer',
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

		const {x, y, pressure} = this.app.currentPoint;
		this.path.push([x, y, pressure]);

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
}

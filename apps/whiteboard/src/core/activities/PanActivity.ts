import {BaseActivity} from './BaseActivity';
import {type WhiteboardPatch} from '../WhiteboardApp';
import {type Point} from '../types';
import {Vector} from '../utils';

export class PanActivity extends BaseActivity {
	type = 'pan' as const;
	private iniPos?: Point;
	private iniCamera?: Point;

	abort(): void {
		//
	}

	complete(): void {
		//
	}

	start(): void {
		this.iniPos = this.app.getScreenPoint(this.app.currentPoint);
		this.iniCamera = this.app.camera;
	}

	update(): WhiteboardPatch | void {
		const {iniPos} = this;
		if (!iniPos || !this.iniCamera) {
			return;
		}

		const pos = new Vector(iniPos).subtract(this.app.getScreenPoint(this.app.currentPoint));
		const camera = new Vector(this.iniCamera)
			.subtract(pos)
			.toPoint();
		return {
			document: {
				camera,
			},
		};
	}
}

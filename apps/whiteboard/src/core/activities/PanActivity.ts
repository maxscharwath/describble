import {BaseActivity} from '~core/activities/BaseActivity';
import {type WhiteboardPatch} from '~core/WhiteboardApp';
import {type Point} from '~core/types';
import {Vector} from '~core/utils';

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

		const pos = Vector.subtract(iniPos, this.app.getScreenPoint(this.app.currentPoint));
		const camera = Vector.subtract(this.iniCamera, pos);
		this.app.setCamera(camera);
	}
}

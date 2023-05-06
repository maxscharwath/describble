import {BaseActivity} from './BaseActivity';
import {type WhiteboardPatch} from '../WhiteboardApp';
import {createBounds} from '../utils';
import {type Point} from '../types';

export class SelectActivity extends BaseActivity {
	type = 'select' as const;
	private initPoint?: Point;

	abort(): WhiteboardPatch {
		return {
			appState: {
				selection: null,
			},
		};
	}

	complete(): WhiteboardPatch {
		return this.abort();
	}

	start(): void {
		this.initPoint = this.app.currentPoint;
	}

	update(): WhiteboardPatch | void {
		if (!this.initPoint) {
			return;
		}

		return {
			appState: {
				selection: createBounds(this.initPoint, this.app.currentPoint),
			},
		};
	}
}

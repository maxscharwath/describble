import {BaseActivity} from '~core/activities/BaseActivity';
import {type WhiteboardPatch} from '~core/WhiteboardApp';
import {createBounds} from '~core/utils';
import {type Point} from '~core/types';

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

import {BaseActivity} from '../BaseActivity';
import {type WhiteboardApp} from '../../WhiteboardApp';

export class SelectActivity extends BaseActivity {
	type = 'select' as const;

	constructor(app: WhiteboardApp, test: number, yolo: string) {
		super(app);
	}

	abort(): void {
		console.log('SelectActivity aborted');
	}

	complete(): void {
		console.log('SelectActivity completed');
	}

	start(): void {
		console.log('SelectActivity started');
	}

	update(): void {
		console.log('SelectActivity updated');
	}
}

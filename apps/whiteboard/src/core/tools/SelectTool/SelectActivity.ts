import {BaseActivity} from '../BaseActivity';

export class SelectActivity extends BaseActivity {
	type = 'select' as const;

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

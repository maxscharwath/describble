import {Status, type WhiteboardApp} from '~core/WhiteboardApp';
import {type Class, type OmitFirst} from '~core/types';
import {type BaseActivity} from '~core/activities/BaseActivity';

export class ActivityManager {
	activity?: BaseActivity;

	constructor(private readonly app: WhiteboardApp) {}

	public startActivity<T extends Class<T, typeof BaseActivity>>(Activity: T, ...args: OmitFirst<ConstructorParameters<T>>) {
		if (this.activity) {
			this.abortActivity();
		}

		this.activity = new Activity(this.app, ...args);
		this.activity.start();

		return this;
	}

	public completeActivity(): this {
		if (!this.activity) {
			return this;
		}

		this.activity.complete();
		this.app.patchState({
			appState: {
				status: Status.Idle,
			},
		});
		this.activity = undefined;
		return this;
	}

	public abortActivity(): this {
		if (!this.activity) {
			return this;
		}

		this.activity.abort();
		this.activity = undefined;
		return this;
	}

	public updateActivity(): this {
		if (!this.activity) {
			return this;
		}

		this.activity.update();

		return this;
	}
}

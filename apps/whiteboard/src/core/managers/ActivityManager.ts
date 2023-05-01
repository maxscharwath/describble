import {Status, type WhiteboardApp} from '../WhiteboardApp';
import {type Class, type OmitFirst} from '../types';
import {type BaseActivity} from '../tools/BaseActivity';

export class ActivityManager {
	activity?: BaseActivity;

	constructor(private readonly app: WhiteboardApp) {}

	public startActivity<T extends Class<T, typeof BaseActivity>>(Activity: T, ...args: OmitFirst<ConstructorParameters<T>>) {
		if (this.activity) {
			this.abortActivity();
		}

		this.activity = new Activity(this, ...args);
		const patch = this.activity.start();
		if (patch) {
			this.app.patchState(patch, `activity_start_${this.activity.type}`);
		}

		return this;
	}

	public completeActivity(): this {
		if (!this.activity) {
			return this;
		}

		const patch = this.activity.complete();
		if (!patch) {
			this.app.patchState({
				appState: {
					status: Status.Idle,
				},
			});
		} else if ('after' in patch) {
			patch.after = {
				...patch.after,
				appState: {
					...patch.after.appState,
					status: Status.Idle,
				},
			};
			this.app.setState(patch, `activity_complete_${this.activity.type}`);
		} else {
			patch.appState = {
				...patch.appState,
				status: Status.Idle,
			};
			this.app.patchState(patch, `activity_complete_${this.activity.type}`);
		}

		this.activity = undefined;
		return this;
	}

	public abortActivity(): this {
		if (!this.activity) {
			return this;
		}

		const patch = this.activity.abort();
		if (patch) {
			this.app.patchState(patch, `activity_abort_${this.activity.type}`);
		}

		this.activity = undefined;
		return this;
	}

	public updateActivity(): this {
		if (!this.activity) {
			return this;
		}

		const patch = this.activity.update();
		if (patch) {
			this.app.patchState(patch, `activity_update_${this.activity.type}`);
		}

		return this;
	}
}

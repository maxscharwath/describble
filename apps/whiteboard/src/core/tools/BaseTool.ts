import {type WhiteboardApp} from '../WhiteboardApp';
import {type PointerEventHandler} from 'react';

export enum Status {
	Idle = 'idle',
	Creating = 'creating',
}

export abstract class BaseTool<TStatus extends string = any> {
	abstract type: string;
	protected status: Status | TStatus = Status.Idle;
	public constructor(protected app: WhiteboardApp) {}

	onPointerDown: PointerEventHandler = () => {
		//
	};

	onPointerMove: PointerEventHandler = () => {
		if (this.status === Status.Creating) {
			this.app.activity.updateActivity();
		}
	};

	onPointerUp: PointerEventHandler = () => {
		if (this.status === Status.Creating) {
			this.app.activity.completeActivity();
		}

		this.setStatus(Status.Idle);
	};

	onActivate(): void {
		this.setStatus(Status.Idle);
	}

	onDeactivate(): void {
		this.setStatus(Status.Idle);
	}

	protected setStatus(status: Status | TStatus) {
		this.app.setStatus(status);
		this.status = status;
	}
}

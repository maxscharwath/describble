import {type WhiteboardApp} from '../WhiteboardApp';
import {type PointerEventHandler} from 'react';

export enum Status {
	Idle = 'idle',
	Creating = 'creating',
	Dragging = 'dragging',
}

export abstract class BaseTool<TStatus extends string = any> {
	abstract type: string;
	protected status: Status | TStatus = Status.Idle;

	public constructor(protected app: WhiteboardApp) {}

	onPointerDown: PointerEventHandler = () => {
		//
	};

	onPointerMove: PointerEventHandler = () => {
		if (this.status !== Status.Idle) {
			this.app.activity.updateActivity();
		}
	};

	onPointerUp: PointerEventHandler = () => {
		if (this.status === Status.Creating) {
			this.app.activity.completeActivity();
		}

		this.setStatus(Status.Idle);
	};

	onKeyDown: (e: KeyboardEvent) => void = ({key}) => {
		if (key === 'Escape') {
			this.onAbort();
		}
	};

	onKeyUp: (e: KeyboardEvent) => void = () => {
		//
	};

	onActivate(): void {
		this.setStatus(Status.Idle);
	}

	onDeactivate(): void {
		this.setStatus(Status.Idle);
	}

	onAbort(): void {
		if (this.status === Status.Idle) {
			this.app.setTool('select');
		} else {
			this.setStatus(Status.Idle);
		}

		this.app.activity.abortActivity();
	}

	protected setStatus(status: Status | TStatus) {
		this.app.setStatus(status);
		this.status = status;
	}
}

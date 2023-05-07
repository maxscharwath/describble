import {type WhiteboardApp} from '~core/WhiteboardApp';
import {type KeyboardEventHandler, type PointerEventHandler, WhiteboardEvents} from '~core/types';

export enum Status {
	Idle = 'idle',
	Creating = 'creating',
	Dragging = 'dragging',
}

export abstract class BaseTool<TStatus extends string = any> extends WhiteboardEvents {
	abstract type: string;
	protected status: Status | TStatus = Status.Idle;

	public constructor(protected app: WhiteboardApp) {
		super();
	}

	onPointerMove: PointerEventHandler = () => {
		if (this.status !== Status.Idle) {
			this.app.activity.updateActivity();
		}
	};

	onPointerUp: PointerEventHandler = () => {
		if (this.status !== Status.Idle) {
			this.app.activity.completeActivity();
		}

		this.setStatus(Status.Idle);
	};

	onKeyDown: KeyboardEventHandler = ({key}) => {
		if (key === 'Escape') {
			this.onAbort();
		}
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

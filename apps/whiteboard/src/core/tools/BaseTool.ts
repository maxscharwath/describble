import {type WhiteboardApp} from '../WhiteboardApp';
import {type PointerEventHandler} from 'react';

export abstract class BaseTool {
	abstract type: string;
	public constructor(protected app: WhiteboardApp) {}

	onPointerDown: PointerEventHandler = () => {
		//
	};

	onPointerMove: PointerEventHandler = () => {
		//
	};

	onPointerUp: PointerEventHandler = () => {
		//
	};

	onActivate(): void {
		//
	}

	onDeactivate(): void {
		//
	}

	protected setStatus(status: string) {
		this.app.setStatus(status);
	}
}

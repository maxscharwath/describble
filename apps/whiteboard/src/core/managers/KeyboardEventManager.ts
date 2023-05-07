import {type WhiteboardApp} from '~core/WhiteboardApp';

export class KeyboardEventManager {
	constructor(private readonly app: WhiteboardApp) {}

	public onKeyDown = (event: KeyboardEvent) => {
		this.app.currentTool?.onKeyDown?.(event);
	};

	public onKeyUp = (event: KeyboardEvent) => {
		this.app.currentTool?.onKeyUp?.(event);
	};
}

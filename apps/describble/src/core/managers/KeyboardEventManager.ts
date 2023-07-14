import {type WhiteboardApp} from '~core/WhiteboardApp';

export class KeyboardEventManager {
	public event?: KeyboardEvent;
	constructor(private readonly app: WhiteboardApp) {}

	public onKeyDown = (event: KeyboardEvent) => {
		this.event = event;
		this.app.currentTool?.onKeyDown?.(event);
	};

	public onKeyUp = (event: KeyboardEvent) => {
		this.event = event;
		this.app.currentTool?.onKeyUp?.(event);
	};

	public isKeyDown(key: string) {
		return this.event?.type === 'keydown' && this.event.key === key;
	}
}

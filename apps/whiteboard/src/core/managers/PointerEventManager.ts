import {type WhiteboardApp} from '../WhiteboardApp';

export class PointerEventManager {
	constructor(private readonly app: WhiteboardApp) {}

	public onPointerMove = (event: React.PointerEvent) => {
		this.app.updateInput(event);
		this.app.currentTool?.onPointerMove(event);
	};

	public onPointerDown = (event: React.PointerEvent) => {
		this.app.updateInput(event);
		this.app.currentTool?.onPointerDown(event);
	};

	public onPointerUp = (event: React.PointerEvent) => {
		this.app.updateInput(event);
		this.app.currentTool?.onPointerUp(event);
	};

	public onPointerCancel = (event: React.PointerEvent) => {
		this.app.updateInput(event);
	};
}

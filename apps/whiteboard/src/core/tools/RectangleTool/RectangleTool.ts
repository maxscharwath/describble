import {BaseTool, Status} from '../BaseTool';
import {ResizeActivity} from '../shared/ResizeActivity';
import {Rectangle} from '../../layers';
import {nanoid} from 'nanoid';

export class RectangleTool extends BaseTool {
	type = 'rectangle' as const;
	onPointerDown = (event: React.PointerEvent) => {
		if (this.status !== Status.Idle) {
			return;
		}

		const initPoint = this.app.getCanvasPoint({x: event.clientX, y: event.clientY});
		const layer = Rectangle.create({
			id: nanoid(),
			position: initPoint,
			style: this.app.state.appState.currentStyle,
		});
		this.app.patchLayer(layer);
		this.app.activity.startActivity(ResizeActivity, layer.id, true);
		this.setStatus(Status.Creating);
	};
}

import {BaseTool, Status} from '../BaseTool';
import {Circle} from '../../layers';
import {nanoid} from 'nanoid';
import {ResizeActivity} from '../../activities/ResizeActivity';

export class CircleTool extends BaseTool {
	type = 'circle' as const;
	onPointerDown = (event: React.PointerEvent) => {
		if (this.status !== Status.Idle) {
			return;
		}

		const initPoint = this.app.getCanvasPoint({x: event.clientX, y: event.clientY});
		console.log(initPoint);
		const layer = Circle.create({
			id: nanoid(),
			position: initPoint,
			style: this.app.state.appState.currentStyle,
		});
		this.app.patchLayer(layer);
		this.app.activity.startActivity(ResizeActivity, layer.id, true);
		this.setStatus(Status.Creating);
	};
}

import {BaseTool, Status} from '../BaseTool';
import {Path} from '../../layers';
import {nanoid} from 'nanoid';
import {DrawActivity} from './DrawActivity';

export class PathTool extends BaseTool {
	type = 'path' as const;
	onPointerDown = (event: React.PointerEvent) => {
		if (this.status !== Status.Idle) {
			return;
		}

		const initPoint = this.app.getCanvasPoint({x: event.clientX, y: event.clientY});
		const layer = Path.create({
			id: nanoid(),
			position: initPoint,
			style: this.app.state.appState.currentStyle,
		});
		this.app.patchLayer(layer);
		this.app.activity.startActivity(DrawActivity, layer.id);
		this.setStatus(Status.Creating);
	};
}

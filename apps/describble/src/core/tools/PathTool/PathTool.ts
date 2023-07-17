import {nanoid} from 'nanoid';
import {BaseTool, Status} from '~core/tools';
import {Path} from '~core/layers';
import {DrawActivity} from '~core/activities/DrawActivity';

export class PathTool extends BaseTool {
	type = 'path' as const;
	onPointerDown = (event: React.PointerEvent) => {
		if (this.status !== Status.Idle || event.button !== 0) {
			return;
		}

		const initPoint = this.app.getCanvasPoint({x: event.clientX, y: event.clientY});
		const layer = Path.create({
			id: nanoid(),
			position: initPoint,
			style: this.app.state.appState.currentStyle,
		});
		this.app.document.layers.add(layer);
		this.app.activity.startActivity(DrawActivity, layer.id);
		this.setStatus(Status.Creating);
	};
}

import {nanoid} from 'nanoid';
import {Line} from '~core/layers';
import {ResizeActivity} from '~core/activities/ResizeActivity';
import {BaseTool, Status} from '../BaseTool';

export class LineTool extends BaseTool {
	type = 'line' as const;
	onPointerDown = (event: React.PointerEvent) => {
		if (this.status !== Status.Idle) {
			return;
		}

		const initPoint = this.app.getCanvasPoint({x: event.clientX, y: event.clientY});
		const layer = Line.create({
			id: nanoid(),
			position: initPoint,
			style: this.app.state.appState.currentStyle,
		});
		this.app.document.layer.add(layer);
		this.app.activity.startActivity(ResizeActivity, layer.id, true);
		this.setStatus(Status.Creating);
	};
}

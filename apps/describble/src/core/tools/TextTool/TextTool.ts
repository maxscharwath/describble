import {nanoid} from 'nanoid';
import {BaseTool, Status} from '~core/tools';
import {ResizeActivity} from '~core/activities/ResizeActivity';
import {Text} from '~core/layers';

export class TextTool extends BaseTool {
	type = 'text' as const;
	onPointerDown = (event: React.PointerEvent) => {
		if (this.status !== Status.Idle || event.button !== 0) {
			return;
		}

		const initPoint = this.app.getCanvasPoint({x: event.clientX, y: event.clientY});
		const layer = Text.create({
			id: nanoid(),
			position: initPoint,
			style: this.app.state.appState.currentStyle,
		});
		this.app.document.layers.add(layer);
		this.app.activity.startActivity(ResizeActivity, layer.id, true);
		this.setStatus(Status.Creating);
	};
}

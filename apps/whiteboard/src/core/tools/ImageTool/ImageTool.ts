import {BaseTool, Status} from '../BaseTool';
import {Image} from '../../layers';
import {nanoid} from 'nanoid';
import {ResizeActivity} from '../../activities/ResizeActivity';

export class ImageTool extends BaseTool {
	type = 'image' as const;

	onPointerDown = (event: React.PointerEvent) => {
		if (this.status !== Status.Idle) {
			return;
		}

		const initPoint = this.app.getCanvasPoint({x: event.clientX, y: event.clientY});
		const layer = Image.create({
			id: nanoid(),
			position: initPoint,
			src: 'https://media.tenor.com/mKfeCtD5EukAAAAM/the-office-the.gif',
			style: this.app.state.appState.currentStyle,
		});
		this.app.patchLayer(layer);
		this.app.activity.startActivity(ResizeActivity, layer.id, true);
		this.setStatus(Status.Creating);
	};
}

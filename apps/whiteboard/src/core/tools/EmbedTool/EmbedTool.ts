import {nanoid} from 'nanoid';
import {BaseTool, Status} from '~core/tools';
import {ResizeActivity} from '~core/activities/ResizeActivity';
import {Embed} from '~core/layers';

export class EmbedTool extends BaseTool {
	type = 'embed' as const;
	private url?: string;

	onActivate() {
		super.onActivate();
		this.openUrlDialog();
	}

	onPointerDown = (event: React.PointerEvent) => {
		if (this.status !== Status.Idle) {
			return;
		}

		const initPoint = this.app.getCanvasPoint({x: event.clientX, y: event.clientY});
		const layer = Embed.create({
			id: nanoid(),
			url: this.url!,
			position: initPoint,
			style: this.app.state.appState.currentStyle,
		});
		this.app.patchLayer(layer);
		this.app.activity.startActivity(ResizeActivity, layer.id, true);
		this.setStatus(Status.Creating);
	};

	private openUrlDialog() {
		const url = prompt('Enter URL');
		if (url) {
			this.url = url;
		}
	}
}

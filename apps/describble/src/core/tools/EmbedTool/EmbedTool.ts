import {nanoid} from 'nanoid';
import {BaseTool, Status} from '~core/tools';
import {ResizeActivity} from '~core/activities/ResizeActivity';
import {Embed} from '~core/layers';

export class EmbedTool extends BaseTool {
	type = 'embed' as const;
	private url?: string;

	onActivate(config?: {url: string}) {
		super.onActivate();
		if (config) {
			this.url = config.url;
		} else {
			this.openUrlDialog();
		}
	}

	onPointerDown = (event: React.PointerEvent) => {
		if (this.status !== Status.Idle || !this.url || event.button !== 0) {
			return;
		}

		const initPoint = this.app.getCanvasPoint({x: event.clientX, y: event.clientY});
		const layer = Embed.create({
			id: nanoid(),
			url: this.url,
			position: initPoint,
			style: this.app.state.appState.currentStyle,
		});
		this.app.document.layers.add(layer);
		this.app.activity.startActivity(ResizeActivity, layer.id, true);
		this.setStatus(Status.Creating);
	};

	private openUrlDialog() {
		// eslint-disable-next-line no-alert
		const url = prompt('Enter URL');
		if (url) {
			this.url = url;
		}
	}
}

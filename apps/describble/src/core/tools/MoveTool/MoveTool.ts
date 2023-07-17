import {BaseTool, Status} from '~core/tools';
import {PanActivity} from '~core/activities/PanActivity';

export class MoveTool extends BaseTool {
	type = 'move' as const;

	onPointerDown = (event: React.PointerEvent) => {
		if (event.button !== 0) {
			return;
		}

		this.app.activity.startActivity(PanActivity);
		this.setStatus(Status.Dragging);
	};
}

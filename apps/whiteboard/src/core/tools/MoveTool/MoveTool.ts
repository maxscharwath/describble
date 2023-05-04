import {BaseTool, Status} from '../BaseTool';
import {PanActivity} from '../../activities/PanActivity';

export class MoveTool extends BaseTool {
	type = 'move' as const;

	onPointerDown = (): void => {
		this.app.activity.startActivity(PanActivity);
		this.setStatus(Status.Dragging);
	};
}

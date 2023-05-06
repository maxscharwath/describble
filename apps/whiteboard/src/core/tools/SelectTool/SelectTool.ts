import {BaseTool} from '../BaseTool';
import {SelectActivity} from '../../activities/SelectActivity';

enum Status {
	Selecting = 'selecting',
}

export class SelectTool extends BaseTool {
	type = 'select' as const;

	onPointerDown = () => {
		this.app.activity.startActivity(SelectActivity);
		this.setStatus(Status.Selecting);
	};
}

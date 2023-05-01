import {BaseTool} from '../BaseTool';
import {SelectActivity} from './SelectActivity';

export class SelectTool extends BaseTool {
	type = 'select' as const;

	onActivate = () => {
		super.onActivate();
		this.app.activity.startActivity(SelectActivity, 1, 'yolo');
	};
}

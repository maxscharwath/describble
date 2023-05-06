import {BaseTool} from '../BaseTool';
import {SelectActivity} from '../../activities/SelectActivity';
import {type PointerEventHandler} from '../../types';

enum Status {
	Idle = 'idle',
	Selecting = 'selecting',
	LayerPointing = 'layer-pointing',
	CanvasPointing = 'canvas-pointing',
}

export class SelectTool extends BaseTool<Status> {
	type = 'select' as const;

	onPointerUp: PointerEventHandler = () => {
		this.app.activity.completeActivity();
		this.setStatus(Status.Idle);
	};

	onPointerMove: PointerEventHandler = () => {
		if (this.app.activity.activity) {
			this.app.activity.updateActivity();
		} else if (this.app.pointerEvent.isPointerDown) {
			this.app.activity.startActivity(SelectActivity);
			this.setStatus(Status.Selecting);
		}
	};

	onLayerDown: PointerEventHandler = (event, layer) => {
		this.app.activity.abortActivity();
		this.setStatus(Status.LayerPointing);
		this.app.patchState({
			appState: {
				selectedLayers: [layer],
			},
		});
	};

	onCanvasDown = () => {
		this.setStatus(Status.CanvasPointing);
		this.app.patchState({
			appState: {
				selectedLayers: [],
			},
		});
	};
}

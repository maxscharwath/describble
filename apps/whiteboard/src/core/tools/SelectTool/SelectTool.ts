import {BaseTool} from '~core/tools';
import {SelectActivity} from '~core/activities/SelectActivity';
import {type BoundsEventHandler, BoundsHandle, type HandleEventHandler, type PointerEventHandler} from '~core/types';
import {TranslateActivity} from '~core/activities/TranslateActivity';
import {ResizeManyActivity} from '~core/activities/ResizeManyActivity';
import {HandleActivity} from '~core/activities/HandleActivity';

enum Status {
	Idle = 'idle',
	Selecting = 'selecting',
	Translating = 'translating',
	Resizing = 'resizing',
	LayerPointing = 'layer-pointing',
	CanvasPointing = 'canvas-pointing',
	BoundsPointing = 'bounds-pointing',
	HandlePointing = 'handle-pointing',
}

export class SelectTool extends BaseTool<Status> {
	type = 'select' as const;

	onPointerMove: PointerEventHandler = () => {
		if (this.app.activity.activity) {
			this.app.activity.updateActivity();
		} else if (this.app.pointerEvent.isPointerDown) {
			if (this.app.state.appState.selectedLayers.length > 0) {
				this.app.activity.startActivity(TranslateActivity);
				this.setStatus(Status.Translating);
			} else {
				this.app.activity.startActivity(SelectActivity);
				this.setStatus(Status.Selecting);
			}
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

	onCanvasDown: PointerEventHandler = () => {
		this.setStatus(Status.CanvasPointing);
		this.app.patchState({
			appState: {
				selectedLayers: [],
			},
		});
	};

	onBoundsDown: BoundsEventHandler = (event, handle) => {
		this.setStatus(Status.BoundsPointing);
		const layers = this.app.state.appState.selectedLayers;
		if (layers.length > 0 && handle !== BoundsHandle.NONE) {
			this.app.activity.startActivity(ResizeManyActivity, layers, false, handle);
			this.setStatus(Status.Resizing);
		}
	};

	onHandleDown: HandleEventHandler = (event, handle) => {
		this.setStatus(Status.HandlePointing);
		if (this.app.state.appState.selectedLayers.length > 0) {
			const layer = this.app.state.appState.selectedLayers[0];
			this.app.activity.startActivity(HandleActivity, layer, handle);
			this.setStatus(Status.Resizing);
		}
	};
}

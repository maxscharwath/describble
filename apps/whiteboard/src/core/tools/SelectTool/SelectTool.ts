import {BaseTool} from '~core/tools';
import {SelectActivity} from '~core/activities/SelectActivity';
import {type BoundsEventHandler, BoundsHandle, type PointerEventHandler} from '~core/types';
import {TranslateActivity} from '~core/activities/TranslateActivity';
import {ResizeActivity} from '~core/activities/ResizeActivity';

enum Status {
	Idle = 'idle',
	Selecting = 'selecting',
	Translating = 'translating',
	Resizing = 'resizing',
	LayerPointing = 'layer-pointing',
	CanvasPointing = 'canvas-pointing',
	BoundsPointing = 'bounds-pointing',
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
				selectedLayers: [...new Set([...this.app.state.appState.selectedLayers, layer])],
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
		const firstSelectedLayer = this.app.state.appState.selectedLayers[0];
		if (firstSelectedLayer && handle !== BoundsHandle.NONE) {
			this.app.activity.startActivity(ResizeActivity, firstSelectedLayer, false, handle);
			this.setStatus(Status.Resizing);
		}
	};
}

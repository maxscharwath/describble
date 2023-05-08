import {BaseTool} from '~core/tools';
import {SelectActivity} from '~core/activities/SelectActivity';
import {type KeyboardEventHandler, type PointerEventHandler} from '~core/types';
import {TranslateActivity} from '~core/activities/TranslateActivity';

enum Status {
	Idle = 'idle',
	Selecting = 'selecting',
	Translating = 'translating',
	LayerPointing = 'layer-pointing',
	CanvasPointing = 'canvas-pointing',
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

	onKeyDown: KeyboardEventHandler = ({key}) => {
		if (this.status === Status.Idle && (key === 'Delete' || key === 'Backspace')) {
			this.app.removeLayer(...this.app.state.appState.selectedLayers);
			this.app.patchState({
				appState: {
					selectedLayers: [],
				},
			});
		}

		if (key === 'Escape') {
			this.onAbort();
		}
	};
}

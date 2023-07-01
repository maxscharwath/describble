import {nanoid} from 'nanoid';
import {BaseTool, Status} from '~core/tools';
import {Image} from '~core/layers';
import {ResizeActivity} from '~core/activities/ResizeActivity';

export class ImageTool extends BaseTool {
	type = 'image' as const;
	private assetId?: string;

	onActivate() {
		super.onActivate();
		this.openFileDialog();
	}

	onPointerDown = async (event: React.PointerEvent) => {
		if (this.status !== Status.Idle) {
			return;
		}

		const initPoint = this.app.getCanvasPoint({x: event.clientX, y: event.clientY});
		const layer = Image.create({
			id: nanoid(),
			position: initPoint,
			assetId: this.assetId!,
			style: this.app.state.appState.currentStyle,
		});
		await this.app.document.layers.add(layer);
		this.app.activity.startActivity(ResizeActivity, layer.id, true);
		this.setStatus(Status.Creating);
	};

	openFileDialog() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';

		input.onchange = event => {
			const file = (event.target as HTMLInputElement).files![0];
			if (file) {
				const reader = new FileReader();
				reader.onloadend = () => {
					const asset = this.app.document.assets.create(reader.result as string, 'image');
					this.assetId = asset.id;
				};

				reader.readAsDataURL(file);
			}
		};

		input.click();
	}
}

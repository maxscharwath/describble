import {useEvent} from '~core/hooks/useEvents';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
import {nanoid} from 'nanoid';
import * as Layers from '~core/layers';

/**
 * This hook allows you to drop an image onto the canvas
 */
export const useDropImageTool = (canvasRef: React.RefObject<Element>) => {
	const app = useWhiteboard();
	useEvent(canvasRef, 'drop', (event: DragEvent) => {
		event.preventDefault();
		const {dataTransfer} = event;

		if (dataTransfer) {
			const file = dataTransfer.files[0];

			const imageUrl = dataTransfer.getData('text/html');
			const webImageUrl = /<img.*?src="(.*?)"/.exec(imageUrl)?.[1];

			const createImage = (imageSrc: string) => {
				const img = new Image();
				img.src = imageSrc;
				img.onload = () => {
					const asset = app.asset.createAsset(imageSrc, 'image');
					const initPoint = app.getCanvasPoint({x: event.clientX, y: event.clientY});
					const layer = Layers.Image.create({
						id: nanoid(),
						position: initPoint,
						assetId: asset.id,
						dimensions: {
							width: img.width / 2,
							height: img.height / 2,
						},
						style: app.state.appState.currentStyle,
					});
					app.addLayer(layer);
				};
			};

			if (file) {
				const reader = new FileReader();
				reader.onload = e => {
					if (e.target?.result) {
						const imageSrc = e.target.result as string;
						createImage(imageSrc);
					}
				};

				reader.readAsDataURL(file);
			} else if (webImageUrl) {
				createImage(webImageUrl);
			}
		}
	});

	useEvent(canvasRef, 'dragover', (e: DragEvent) => {
		e.preventDefault();
	});
};


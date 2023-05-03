import {useEvent} from './useEvents';

/**
 * This hook allows you to drop an image onto the canvas
 */
export const useDropImageTool = (canvasRef: React.RefObject<Element>) => {
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
					// Do something with the image here
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


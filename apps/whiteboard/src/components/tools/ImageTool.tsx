import {useWhiteboardContext, whiteboardStore} from '../WhiteboardContext';
import React, {useState} from 'react';
import {type z} from 'zod';
import {type ImageSchema} from '../layers/factory/ImageFactory';
import {useEvent} from '../../hooks/useEvents';
import {nanoid} from 'nanoid';
import {Layer} from '../layers/Layer';
import {computePointerPosition} from './Tools';
import {usePointerEvents} from '../../hooks/usePointerEvents';

/**
 * This tool allows the user to add an image to the canvas.
 */
export const ImageTool: React.FC = () => {
	const {camera, canvasRef, addLayer} = useWhiteboardContext();
	const [imageData, setImageData] = useState<z.infer<typeof ImageSchema> | null>(null);
	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			if (event.buttons !== 1) {
				return;
			}

			const {x, y} = computePointerPosition(event, camera);
			setImageData({
				type: 'image',
				uuid: nanoid(),
				visible: true,
				x,
				y,
				width: 0,
				height: 0,
				src: 'https://i0.wp.com/www.printmag.com/wp-content/uploads/2021/02/4cbe8d_f1ed2800a49649848102c68fc5a66e53mv2.gif',
			});
		},
		onPointerMove(event) {
			if (event.buttons !== 1 || !imageData) {
				return;
			}

			const {x, y} = computePointerPosition(event, camera);
			setImageData({
				...imageData,
				width: x - imageData.x,
				height: y - imageData.y,
			});
		},
		onPointerUp() {
			if (imageData) {
				addLayer(imageData);
				setImageData(null);
			}
		},
	});

	return imageData ? <Layer {...imageData} /> : null;
};

/**
 * This hook allows you to drop an image onto the canvas
 */
export const useDropImageTool = () => {
	const {canvasRef} = useWhiteboardContext();
	const {camera} = useWhiteboardContext();
	const store = whiteboardStore;

	useEvent(canvasRef, 'drop', (e: DragEvent) => {
		e.preventDefault();
		const {x, y} = computePointerPosition(e, camera);
		const {dataTransfer} = e;

		if (dataTransfer) {
			const file = dataTransfer.files[0];

			const imageUrl = dataTransfer.getData('text/html');
			const webImageUrl = /<img.*?src="(.*?)"/.exec(imageUrl)?.[1];

			const createImage = (imageSrc: string) => {
				const img = new Image();
				img.src = imageSrc;
				img.onload = () => {
					const newImageData = {
						type: 'image',
						uuid: nanoid(),
						visible: true,
						x: x - (img.width / 2),
						y: y - (img.height / 2),
						width: img.width,
						height: img.height,
						src: imageSrc,
					} satisfies z.infer<typeof ImageSchema>;

					store.setState(l => ({
						layers: [...l.layers, newImageData],
						history: [],
					}));
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


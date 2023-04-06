import {useWhiteboardContext, whiteboardStore} from '../WhiteboardContext';
import React, {useState} from 'react';
import {type z} from 'zod';
import {type ImageSchema} from '../layers/factory/ImageFactory';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {nanoid} from 'nanoid';
import {Layer} from '../layers/Layer';
import {computePointerPosition} from './Tools';

export const ImageTool = () => {
	const {camera, canvasRef} = useWhiteboardContext();
	const store = whiteboardStore;
	const [imageData, setImageData] = useState<z.infer<typeof ImageSchema> | null>(null);
	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			const {x, y} = computePointerPosition(event, camera);
			setImageData({
				type: 'image',
				uuid: nanoid(),
				visible: true,
				x,
				y,
				width: 0,
				height: 0,
				src: 'https://i.imgur.com/1ZQ3wZQ.jpg',
			});
		},
		onPointerMove(event) {
			if (event.buttons !== 1) {
				return;
			}

			const {x, y} = computePointerPosition(event, camera);
			if (imageData) {
				setImageData({
					...imageData,
					width: x - imageData.x,
					height: y - imageData.y,
				});
			}
		},
		onPointerUp() {
			if (imageData) {
				store.setState(l => ({
					layers: [...l.layers, imageData],
					history: [],
				}));
			}

			setImageData(null);
		},
	});

	return imageData ? <Layer {...imageData} /> : null;
};

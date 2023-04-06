import {useWhiteboardContext, whiteboardStore} from '../WhiteboardContext';
import React, {useState} from 'react';
import {type z} from 'zod';
import {type RectangleSchema} from '../layers/factory/RectangleFactory';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {nanoid} from 'nanoid';
import {Layer} from '../layers/Layer';
import {computePointerPosition} from './Tools';

/**
 * This tool allows the user to add a rectangle to the canvas.
 * @constructor
 */
export const RectangleTool: React.FC = () => {
	const {selectedColor, camera, canvasRef} = useWhiteboardContext();
	const store = whiteboardStore;
	const [rectangleData, setRectangleData] = useState<z.infer<typeof RectangleSchema> | null>(null);
	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			const {x, y} = computePointerPosition(event, camera);
			setRectangleData({
				type: 'rectangle',
				uuid: nanoid(),
				visible: true,
				x,
				y,
				width: 0,
				height: 0,
				color: selectedColor,
			});
		},
		onPointerMove(event) {
			if (event.buttons !== 1) {
				return;
			}

			const {x, y} = computePointerPosition(event, camera);
			if (rectangleData) {
				setRectangleData({
					...rectangleData,
					width: x - rectangleData.x,
					height: y - rectangleData.y,
				});
			}
		},
		onPointerUp() {
			if (rectangleData) {
				store.setState(l => ({
					layers: [...l.layers, rectangleData],
					history: [],
				}));
			}

			setRectangleData(null);
		},
	});

	return rectangleData ? <Layer {...rectangleData} /> : null;
};

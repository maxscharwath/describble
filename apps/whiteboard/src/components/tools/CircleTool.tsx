import {useWhiteboardContext, whiteboardStore} from '../WhiteboardContext';
import React, {useState} from 'react';
import {type z} from 'zod';
import {type CircleSchema} from '../layers/factory/CircleFactory';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {nanoid} from 'nanoid';
import {Layer} from '../layers/Layer';
import {computePointerPosition} from './Tools';

/**
 * This tool allows the user to add a circle to the canvas.
 * @constructor
 */
export const CircleTool: React.FC = () => {
	const {selectedColor, camera, canvasRef} = useWhiteboardContext();
	const store = whiteboardStore;
	const [circleData, setCircleData] = useState<z.infer<typeof CircleSchema> | null>(null);
	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			const {x, y} = computePointerPosition(event, camera);
			setCircleData({
				type: 'circle',
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
			if (circleData) {
				setCircleData({
					...circleData,
					width: x - circleData.x,
					height: y - circleData.y,
				});
			}
		},
		onPointerUp() {
			if (circleData) {
				store.setState(l => ({
					layers: [...l.layers, circleData],
					history: [],
				}));
			}

			setCircleData(null);
		},
	});

	return circleData ? <Layer {...circleData} /> : null;
};

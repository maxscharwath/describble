import {useWhiteboardStore, whiteboardStore} from '../../store/WhiteboardStore';
import React, {useState} from 'react';
import {type z} from 'zod';
import {type CircleSchema} from '../layers/factory/CircleFactory';
import {nanoid} from 'nanoid';
import {Layer} from '../layers/Layer';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {mouseEventToCanvasPoint} from '../../utils/coordinateUtils';
import {useLayersStore} from '../../store/CanvasStore';

/**
 * This tool allows the user to add a circle to the canvas.
 * @constructor
 */
export const CircleTool: React.FC = () => {
	const {canvasRef} = useWhiteboardStore(({canvasRef}) => ({canvasRef}));
	const {addLayer} = useLayersStore(({addLayer}) => ({addLayer}));

	const [circleData, setCircleData] = useState<z.infer<typeof CircleSchema> | null>(null);
	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			if (event.buttons !== 1) {
				return;
			}

			const {selectedColor, camera} = whiteboardStore.getState();

			const {x, y} = mouseEventToCanvasPoint(event, camera);
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
			if (event.buttons !== 1 || !circleData) {
				return;
			}

			const {camera} = whiteboardStore.getState();

			const {x, y} = mouseEventToCanvasPoint(event, camera);
			setCircleData({
				...circleData,
				width: x - circleData.x,
				height: y - circleData.y,
			});
		},
		onPointerUp() {
			if (circleData) {
				addLayer(circleData);
				setCircleData(null);
			}
		},
	});

	return circleData ? <Layer layer={circleData}/> : null;
};

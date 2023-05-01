import {useWhiteboardStore, whiteboardStore} from '../../store/WhiteboardStore';
import React, {useState} from 'react';
import {type z} from 'zod';
import {type RectangleSchema} from '../layers/factory/RectangleFactory';
import {nanoid} from 'nanoid';
import {Layer} from '../layers/Layer';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {mouseEventToCanvasPoint} from '../../utils/coordinateUtils';
import {useLayersStore} from '../../store/CanvasStore';
import {useWhiteboard} from '../../core/useWhiteboard';

/**
 * This tool allows the user to add a rectangle to the canvas.
 * @constructor
 */
export const RectangleTool: React.FC = () => {
	const {canvasRef} = useWhiteboardStore(({canvasRef}) => ({canvasRef}));
	const {addLayer} = useLayersStore(({addLayer}) => ({addLayer}));
	const app = useWhiteboard();
	const [rectangleData, setRectangleData] = useState<z.infer<typeof RectangleSchema> | null>(null);
	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			if (event.buttons !== 1) {
				return;
			}

			const {camera} = whiteboardStore.getState();
			const selectedColor = app.state.appState.currentStyle.color;

			const {x, y} = mouseEventToCanvasPoint(event, camera);
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
			if (event.buttons !== 1 || !rectangleData) {
				return;
			}

			const {camera} = whiteboardStore.getState();

			const {x, y} = mouseEventToCanvasPoint(event, camera);
			setRectangleData({
				...rectangleData,
				width: x - rectangleData.x,
				height: y - rectangleData.y,
			});
		},
		onPointerUp() {
			if (rectangleData) {
				addLayer(rectangleData);
				setRectangleData(null);
			}
		},
	});

	return rectangleData ? <Layer layer={rectangleData}/> : null;
};

import {useWhiteboardStore, whiteboardStore} from '../../store/WhiteboardStore';
import React, {useState} from 'react';
import {type z} from 'zod';
import {type PathSchema} from '../layers/factory/PathFactory';
import {nanoid} from 'nanoid';
import {simplify} from '../../utils/simplify-path';
import {Layer} from '../layers/Layer';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {mouseEventToCanvasPoint} from '../../utils/coordinateUtils';
import {useLayersStore} from '../../store/CanvasStore';
import {useWhiteboard} from '../../core/useWhiteboard';
import {shallow} from 'zustand/shallow';

/**
 * This tool allows the user to add a path to the canvas.
 * @constructor
 */
export const PathTool: React.FC = () => {
	const app = useWhiteboard();
	const {canvasRef} = useWhiteboardStore(({canvasRef}) => ({canvasRef}));
	const {addLayer} = useLayersStore(({addLayer}) => ({addLayer}));
	const [pathData, setPathData] = useState<z.infer<typeof PathSchema> | null>(null);
	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			if (event.buttons !== 1) {
				return;
			}

			const {camera} = whiteboardStore.getState();
			const selectedColor = app.state.appState.currentStyle.color;

			const {x, y} = mouseEventToCanvasPoint(event, camera);
			setPathData({
				type: 'path',
				uuid: nanoid(),
				visible: true,
				x,
				y,
				points: [[0, 0, event.pressure]],
				color: selectedColor,
				strokeOptions: {
					size: 16,
					thinning: 0.5,
					smoothing: 0.5,
					roundness: 0.5,
				},
			});
		},
		onPointerMove(event) {
			if (event.buttons !== 1 || !pathData) {
				return;
			}

			const {camera} = whiteboardStore.getState();
			const {x, y} = mouseEventToCanvasPoint(event, camera);
			setPathData({
				...pathData,
				points: simplify([...pathData.points, [x - pathData.x, y - pathData.y, event.pressure]], 0.4, true),
			});
		},
		onPointerUp() {
			if (pathData) {
				addLayer(pathData);
				setPathData(null);
			}
		},
	});

	return pathData ? <Layer layer={pathData}/> : null;
};

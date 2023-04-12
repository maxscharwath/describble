import {useWhiteboardContext, whiteboardStore} from '../WhiteboardContext';
import React, {useState} from 'react';
import {type z} from 'zod';
import {type PathSchema} from '../layers/factory/PathFactory';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {nanoid} from 'nanoid';
import {simplify} from '../../utils/simplify-path';
import {Layer} from '../layers/Layer';
import {computePointerPosition} from './Tools';

/**
 * This tool allows the user to add a path to the canvas.
 * @constructor
 */
export const PathTool: React.FC = () => {
	const {selectedColor, camera, canvasRef, addLayer} = useWhiteboardContext();
	const [pathData, setPathData] = useState<z.infer<typeof PathSchema> | null>(null);
	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			if (event.buttons !== 1) {
				return;
			}

			const {x, y} = computePointerPosition(event, camera);
			setPathData({
				type: 'path',
				uuid: nanoid(),
				visible: true,
				points: [[x, y, event.pressure]],
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

			const {x, y} = computePointerPosition(event, camera);
			setPathData({
				...pathData,
				points: simplify([...pathData.points, [x, y, event.pressure]], 0.2, true),
			});
		},
		onPointerUp() {
			if (pathData) {
				addLayer(pathData);
				setPathData(null);
			}
		},
	});

	return pathData ? <Layer {...pathData} /> : null;
};

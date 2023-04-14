import {useCamera, useWhiteboardContext} from '../WhiteboardContext';
import type React from 'react';
import {usePointerEvents} from '../../hooks/usePointerEvents';

/**
 * Tool to move the camera around the canvas
 * @constructor
 */
export const MoveTool: React.FC = () => {
	const {canvasRef} = useWhiteboardContext();
	const {camera, setCamera} = useCamera();
	usePointerEvents(canvasRef, {
		onPointerMove(event) {
			if (event.buttons !== 1) {
				return;
			}

			setCamera({
				...camera,
				x: camera.x + event.movementX,
				y: camera.y + event.movementY,
			});
		},
	});

	return null;
};

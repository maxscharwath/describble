import {useCamera, useWhiteboardContext} from '../WhiteboardContext';
import type React from 'react';
import {useRef} from 'react';
import {usePointerEvents} from '../../hooks/usePointerEvents';

/**
 * Tool to move the camera around the canvas
 * @constructor
 */
export const MoveTool: React.FC = () => {
	const {canvasRef} = useWhiteboardContext();
	const {camera, setCamera} = useCamera();
	const lastPosition = useRef({x: 0, y: 0});

	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			lastPosition.current = {x: event.pageX, y: event.pageY};
		},
		onPointerMove(event) {
			if (event.buttons !== 1) {
				return;
			}

			const movementX = event.pageX - lastPosition.current.x;
			const movementY = event.pageY - lastPosition.current.y;

			setCamera({
				...camera,
				x: camera.x + movementX,
				y: camera.y + movementY,
			});

			lastPosition.current = {x: event.pageX, y: event.pageY};
		},
	});

	return null;
};

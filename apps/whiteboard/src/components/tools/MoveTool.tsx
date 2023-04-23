import {useWhiteboardStore, whiteboardStore} from '../../store/WhiteboardStore';
import type React from 'react';
import {useRef} from 'react';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {type Point} from '../../utils/types';

/**
 * Tool to move the camera around the canvas
 * @constructor
 */
export const MoveTool: React.FC = () => {
	const {canvasRef} = useWhiteboardStore();
	const lastPosition = useRef<Point | null>(null);

	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			lastPosition.current = {x: event.pageX, y: event.pageY};
		},
		onPointerMove(event) {
			const {camera, setCamera} = whiteboardStore.getState();
			if (event.buttons !== 1) {
				return;
			}

			if (!lastPosition.current) {
				lastPosition.current = {x: event.pageX, y: event.pageY};
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

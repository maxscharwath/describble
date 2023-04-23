import {whiteboardStore} from '../store/WhiteboardStore';
import {type EventElement, useEvents} from './useEvents';
import {type MouseEvent, type RefObject, useRef} from 'react';

export const useWheelPan = (canvasRef: RefObject<EventElement>) => {
	const initialWheelPosition = useRef<{x: number; y: number} | null>(null);

	useEvents(canvasRef, {
		mousedown(e: MouseEvent) {
			if (e.button === 1) {
				initialWheelPosition.current = {x: e.clientX, y: e.clientY};
			}
		},
		mousemove(e: MouseEvent) {
			if (initialWheelPosition.current) {
				const {camera, setCamera} = whiteboardStore.getState();

				const deltaX = e.clientX - initialWheelPosition.current.x;
				const deltaY = e.clientY - initialWheelPosition.current.y;

				setCamera({...camera, x: camera.x + deltaX, y: camera.y + deltaY});

				initialWheelPosition.current = {x: e.clientX, y: e.clientY};
			}
		},
		mouseup(e: MouseEvent) {
			if (e.button === 1) {
				initialWheelPosition.current = null;
			}
		},
	});
};

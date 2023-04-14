import {useCamera} from '../components/WhiteboardContext';
import {type EventElement, useEvent} from './useEvents';
import {type RefObject} from 'react';

export const useWheelZoom = (canvasRef: RefObject<EventElement>) => {
	const {camera, setCamera} = useCamera();

	useEvent(canvasRef, 'wheel', (e: WheelEvent) => {
		const scale = Math.max(0.1, Math.min(10, camera.scale + ((e.deltaY > 0 ? -0.1 : 0.1) * camera.scale)));
		const x = e.clientX - ((e.clientX - camera.x) * scale / camera.scale);
		const y = e.clientY - ((e.clientY - camera.y) * scale / camera.scale);
		setCamera({x, y, scale});
	});
};

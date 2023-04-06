import React, {type PointerEvent, type WheelEvent} from 'react';
import {type Camera, useCamera, useWhiteboardContext} from '../WhiteboardContext';
import {useEvent} from '../../hooks/usePointerEvents';
import {type Point} from '../../utils/types';
import {PathTool} from './PathTool';
import {CircleTool} from './CircleTool';
import {RectangleTool} from './RectangleTool';
import {ImageTool} from './ImageTool';
import {MoveTool} from './MoveTool';
import {SelectedTool} from './SelectedTool';

export const computePointerPosition = (event: PointerEvent, camera: Camera): Point => ({
	x: (event.clientX - camera.x) / camera.scale,
	y: (event.clientY - camera.y) / camera.scale,
});

export const invertPointerPosition = (point: Point, camera: Camera): Point => ({
	x: (point.x * camera.scale) + camera.x,
	y: (point.y * camera.scale) + camera.y,
});

export const useZoomTool = () => {
	const {canvasRef} = useWhiteboardContext();
	const {camera, setCamera} = useCamera();
	useEvent(canvasRef, 'wheel', (e: WheelEvent<SVGElement>) => {
		const scale = Math.max(0.1, Math.min(10, camera.scale + ((e.deltaY > 0 ? -0.1 : 0.1) * camera.scale)));
		const x = e.clientX - ((e.clientX - camera.x) * scale / camera.scale);
		const y = e.clientY - ((e.clientY - camera.y) * scale / camera.scale);
		setCamera({x, y, scale});
	});
};

export const LayerTools = () => {
	const {currentTool} = useWhiteboardContext();
	switch (currentTool) {
		case 'path':
			return <PathTool />;
		case 'rectangle':
			return <RectangleTool />;
		case 'circle':
			return <CircleTool />;
		case 'image':
			return <ImageTool />;
		default:
			return null;
	}
};

export const GlobalTools = () => {
	const {currentTool} = useWhiteboardContext();
	switch (currentTool) {
		case 'move':
			return <MoveTool />;
		case 'select':
			return <SelectedTool />;
		default:
			return null;
	}
};

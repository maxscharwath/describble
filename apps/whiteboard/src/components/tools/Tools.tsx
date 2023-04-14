import React, {type WheelEvent} from 'react';
import {type Camera, useCamera, useWhiteboardContext} from '../WhiteboardContext';
import {useEvent} from '../../hooks/useEvents';
import {type Point} from '../../utils/types';
import {PathTool} from './PathTool';
import {CircleTool} from './CircleTool';
import {RectangleTool} from './RectangleTool';
import {ImageTool} from './ImageTool';
import {MoveTool} from './MoveTool';
import {SelectedTool} from './SelectedTool';

type ClientEvent = {
	clientX: number;
	clientY: number;
};

export const computePointerPosition = (event: ClientEvent, camera: Camera): Point => ({
	x: Math.round((event.clientX - camera.x) / camera.scale),
	y: Math.round((event.clientY - camera.y) / camera.scale),
});

export const invertPointerPosition = (point: Point, camera: Camera): Point => ({
	x: (point.x * camera.scale) + camera.x,
	y: (point.y * camera.scale) + camera.y,
});

/**
 * This hook allows the user to zoom in and out of the canvas.
 */
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

/**
 * This component renders the correct tool based on the current tool.
 * @constructor
 */
export const LayerTools = () => {
	const {currentTool} = useWhiteboardContext();
	switch (currentTool) {
		case 'path':
			return <PathTool/>;
		case 'rectangle':
			return <RectangleTool/>;
		case 'circle':
			return <CircleTool/>;
		case 'image':
			return <ImageTool/>;
		default:
			return null;
	}
};

/**
 * This component renders the correct tool based on the current tool.
 * @constructor
 */
export const GlobalTools = () => {
	const {currentTool} = useWhiteboardContext();
	switch (currentTool) {
		case 'move':
			return <MoveTool/>;
		case 'select':
			return <SelectedTool/>;
		default:
			return null;
	}
};

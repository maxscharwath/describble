import React from 'react';
import {type Camera, useWhiteboardContext} from '../WhiteboardContext';
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

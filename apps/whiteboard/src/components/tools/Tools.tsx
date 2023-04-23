import React from 'react';
import {useWhiteboardStore} from '../../store/WhiteboardStore';
import {PathTool} from './PathTool';
import {CircleTool} from './CircleTool';
import {RectangleTool} from './RectangleTool';
import {ImageTool} from './ImageTool';
import {MoveTool} from './MoveTool';
import {SelectedTool} from './SelectedTool';

/**
 * This component renders the correct tool based on the current tool.
 * @constructor
 */
export const LayerTools = () => {
	const {currentTool} = useWhiteboardStore(({currentTool}) => ({currentTool}));
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
	const {currentTool} = useWhiteboardStore(({currentTool}) => ({currentTool}));
	switch (currentTool) {
		case 'move':
			return <MoveTool/>;
		case 'select':
			return <SelectedTool/>;
		default:
			return null;
	}
};

import React from 'react';
import {useWhiteboard} from '../../core/useWhiteboard';

export const DebugBar = () => {
	const app = useWhiteboard();
	const status = app.useStore(state => state.appState.status);
	const currentTool = app.useStore(state => state.appState.currentTool);
	const camera = app.useStore(state => state.document.camera);

	return (
		<div className='fixed bottom-0 left-0 flex w-full items-center justify-between border-t border-gray-200 bg-gray-100/75 p-2 backdrop-blur'>
			<span className='text-sm text-gray-500'>{currentTool} - {status}</span>
			<span className='text-sm text-gray-500'>{(camera.zoom * 100).toFixed(1)}%</span>
		</div>
	);
};

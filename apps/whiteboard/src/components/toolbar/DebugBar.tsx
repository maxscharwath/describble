import React from 'react';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
import {cameraSelector} from '~core/selectors';

export const DebugBar = () => {
	const app = useWhiteboard();
	const status = app.useStore(state => state.appState.status);
	const currentTool = app.useStore(state => state.appState.currentTool);
	const camera = app.useStore(cameraSelector);

	return (
		<div className='standalone:px-10 flex w-full items-center justify-between border-t border-gray-200 bg-gray-100/75 p-2 backdrop-blur dark:border-gray-600 dark:bg-gray-800/75 dark:text-gray-200 dark:backdrop-blur'>
			<span className='text-sm text-gray-500 dark:text-gray-200'>
				{currentTool} - {status}
			</span>
			<span className='text-sm text-gray-500 dark:text-gray-200'>
				{(camera.zoom * 100).toFixed(1)}%
			</span>
		</div>
	);
};

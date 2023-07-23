import React from 'react';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
import {cameraSelector} from '~core/selectors';
import {DropdownSettings} from '~components/ui/DropdownSettings';
import {InfoIcon} from 'ui/components/Icons';

export const DebugBar = () => {
	const app = useWhiteboard();
	const status = app.useStore(state => state.appState.status);
	const currentTool = app.useStore(state => state.appState.currentTool);
	const camera = app.document.useStore(cameraSelector);

	return (
		<div className='flex w-full items-center gap-2 border-t border-gray-200 bg-gray-100/75 p-2 backdrop-blur dark:border-gray-600 dark:bg-gray-800/75 dark:text-gray-200 dark:backdrop-blur standalone:px-10'>
			<span className='text-sm text-gray-500 dark:text-gray-200'>
				{currentTool} - {status}
			</span>
			<div className='grow' />
			<span className='text-sm text-gray-500 dark:text-gray-200'>
				{(camera.zoom * 100).toFixed(1)}%
			</span>
			<DropdownSettings>
				<button className='btn-ghost btn-sm btn-circle btn pointer-events-auto'>
					<InfoIcon className='h-6 w-6' />
				</button>
			</DropdownSettings>
		</div>
	);
};

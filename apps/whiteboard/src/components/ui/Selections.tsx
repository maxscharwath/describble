import React from 'react';
import {LayersIcon} from 'ui/components/Icons';

export const SelectionsToolbar = () => {
	const selectedLayers = [];

	if (selectedLayers.length <= 0) {
		return null;
	}

	return (
		<div
			className='pointer-events-auto m-2 flex flex-col items-center justify-center space-y-2 rounded-lg border border-gray-200 bg-gray-100/80 p-4 shadow-lg backdrop-blur sm:flex-row sm:space-x-4 sm:space-y-0'
		>
			<div className='flex flex-col items-center sm:flex-row sm:space-x-2'>
				<LayersIcon className='text-2xl text-gray-500'/>
				<span className='font-bold text-gray-700'>{selectedLayers.length}</span>
				<span className='text-gray-500'>
					{selectedLayers.length > 1 ? 'Layers Selected' : 'Layer Selected'}
				</span>
			</div>
		</div>
	);
};

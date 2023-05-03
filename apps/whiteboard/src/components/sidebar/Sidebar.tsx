import React, {memo} from 'react';
import {Reorder} from 'framer-motion';
import {ClosedEyeIcon, OpenEyeIcon, TargetIcon, TrashIcon} from 'ui/components/Icons';
import {Button} from '../ui/Buttons';
import {Spacer} from '../ui/Utils';
import {useWhiteboard} from '../../core/useWhiteboard';
import {shallow} from 'zustand/shallow';
import {type Layer} from '../../core/layers';
import {PreviewLayer} from '../Layer';

const Separator = () => <div className='my-2 h-px bg-gray-300'/>;

export const Sidebar = () => {
	const app = useWhiteboard();
	const layers = app.useStore(state =>
		Object.values(state.document.layers)
			.sort((a, b) => (b.zIndex ?? Infinity) - (a.zIndex ?? Infinity))
	, shallow);
	function handleLayerReorder(_layers: Layer[]) {
		const newLayers = Object.fromEntries(_layers.map((layer, index, {length}) => [layer.id, {zIndex: length - index}]));
		app.patchState({
			document: {
				layers: newLayers,
			},
		});
	}

	if (layers.length === 0) {
		return null;
	}

	return (
		<div
			className='pointer-events-auto m-2 flex max-h-96 w-72 flex-col overflow-y-auto rounded-lg border border-gray-200 bg-gray-100/80 p-2 shadow-lg backdrop-blur'
		>
			<h2 className='text-base font-bold text-gray-800'>Layers</h2>
			<Separator/>
			<Reorder.Group
				axis='y'
				values={layers}
				onReorder={handleLayerReorder}
				className='flex w-full flex-col space-y-1 overflow-y-auto'
				layoutScroll
			>
				{layers.map(layer => (
					<Reorder.Item key={layer.id} value={layer}
						className='flex w-full items-center space-x-2 rounded-lg bg-gray-200/50 p-1 backdrop-blur hover:bg-gray-200/80'>
						<LayerItem layer={layer}/>
					</Reorder.Item>
				))}
			</Reorder.Group>
		</div>
	);
};

const LayerItem = memo(({layer}: {layer: Layer}) => {
	const app = useWhiteboard();
	function handleLayerVisibilityChange() {
		app.patchState({
			document: {
				layers: {
					[layer.id]: {
						visible: !layer.visible,
					},
				},
			},
		}, 'set_layer_visibility');
	}

	function handleLayerDelete() {
		app.removeLayer(layer.id);
	}

	function handleTargetLayer() {
		//
	}

	return (
		<>
			<PreviewLayer layer={layer}
				className='h-8 w-8 shrink-0 rounded-lg border border-gray-300 bg-gray-100/50 p-0.5 shadow-sm'/>
			<span className='overflow-hidden text-ellipsis whitespace-nowrap text-sm'
				title={layer.id}>
				{layer.type}
			</span>
			<Spacer/>
			<span className='whitespace-nowrap font-mono text-xs text-gray-500'>
				{objectToStorageSize(layer).toFixed(2)} KB
			</span>
			<Button
				aria-label='Target layer'
				onClick={handleTargetLayer}
			>
				<TargetIcon/>
			</Button>
			<Button
				aria-label='Toggle layer visibility'
				active={layer.visible}
				activeSlot={<OpenEyeIcon/>}
				inactiveSlot={<ClosedEyeIcon/>}
				onClick={handleLayerVisibilityChange}
			/>
			<Button
				aria-label='Delete layer'
				onClick={handleLayerDelete}
				className='text-red-900'
			>
				<TrashIcon/>
			</Button>
		</>
	);
});

LayerItem.displayName = 'LayerItem';

function objectToStorageSize(obj: any): number {
	return new Blob([JSON.stringify(obj)]).size / 1024;
}

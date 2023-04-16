import {useWhiteboardContext, whiteboardStore} from '../WhiteboardContext';
import React from 'react';
import {Reorder} from 'framer-motion';
import {type LayerData, Layers, PreviewLayer} from '../layers/Layer';
import {type LayerFactory} from '../layers/factory/LayerFactory';
import {ClosedEyeIcon, OpenEyeIcon, TargetIcon, TrashIcon} from 'ui/components/Icons';
import {Button} from '../ui/Buttons';
import {Spacer} from '../ui/Utils';

const Separator = () => <div className='my-2 h-px bg-gray-300'/>;

export const Sidebar = () => {
	const context = useWhiteboardContext(({layers}) => ({layers}));

	function handleLayerReorder(layers: LayerData[]) {
		whiteboardStore.setState({layers});
	}

	if (context.layers.length === 0) {
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
				values={context.layers}
				onReorder={handleLayerReorder}
				className='flex w-full flex-col space-y-1 overflow-y-auto'
				layoutScroll
			>
				{context.layers.map(layer => (
					<Reorder.Item key={layer.uuid} value={layer}
						className='flex w-full items-center space-x-2 rounded-lg bg-gray-200/50 p-1 backdrop-blur hover:bg-gray-200/80'>
						<LayerItem layer={layer}/>
					</Reorder.Item>
				))}
			</Reorder.Group>
		</div>
	);
};

const LayerItem = (({layer}: {layer: LayerData}) => {
	function handleLayerVisibilityChange() {
		whiteboardStore.setState(state => ({
			layers: state.layers.map(l => {
				if (l.uuid === layer.uuid) {
					l.visible = !l.visible;
				}

				return l;
			}),
		}));
	}

	function handleLayerDelete() {
		whiteboardStore.setState(state => ({
			layers: state.layers.filter(l => l.uuid !== layer.uuid),
		}));
	}

	function handleTargetLayer() {
		// Set camera target to layer
		whiteboardStore.setState(state => {
			const factory = Layers.getFactory(layer.type) as LayerFactory;
			const bound = factory.getBounds(layer);
			return {
				camera: {
					...state.camera,
					x: (window.innerWidth / 2) + -((bound.x + (bound.width / 2)) * state.camera.scale),
					y: (window.innerHeight / 2) + -((bound.y + (bound.height / 2)) * state.camera.scale),
				},
			};
		});
	}

	return (
		<>
			<PreviewLayer layer={layer}
				className='h-8 w-8 shrink-0 rounded-lg border border-gray-300 bg-gray-100/50 p-0.5 shadow-sm'/>
			<span className='overflow-hidden text-ellipsis whitespace-nowrap text-sm'
				title={layer.uuid}>
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

function objectToStorageSize(obj: any): number {
	return new Blob([JSON.stringify(obj)]).size / 1024;
}

import {useWhiteboardContext, whiteboardStore} from '../WhiteboardContext';
import clsx from 'clsx';
import React from 'react';
import {Reorder} from 'framer-motion';
import {type LayerData, PreviewLayer} from '../layers/Layer';

const SwitchIconButton = ({active, disabled, activeSlot, inactiveSlot, ...props}: React.ComponentProps<'button'> & {
	active?: boolean;
	disabled?: boolean;
	activeSlot: React.ReactNode;
	inactiveSlot: React.ReactNode;
}) => (
	<button
		type='button'
		className={clsx(
			'rounded-full bg-gray-200 p-1 transition-all hover:scale-110 active:scale-90',
			active && 'bg-gray-900 text-white',
			disabled && 'cursor-not-allowed opacity-50',
		)}
		disabled={disabled}
		{...props}
	>
		{active ? activeSlot : inactiveSlot}
	</button>
);

const Separator = () => <div className='my-2 h-px bg-gray-300'/>;

const DeleteButton = (props: React.ComponentProps<'button'>) => (
	<button
		type='button'
		className='rounded-full bg-gray-200 p-2 text-red-900 transition-all hover:scale-110 active:scale-90'
		{...props}
	>
		<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'>
			<path fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'
				d='M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6'></path>
		</svg>
	</button>
);

const Spacer = () => <div className='flex-1'/>;

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
	function handleLayerVisibilityChange(uuid: string) {
		whiteboardStore.setState(state => ({
			layers: state.layers.map(l => {
				if (l.uuid === uuid) {
					l.visible = !l.visible;
				}

				return l;
			}),
		}));
	}

	function handleLayerDelete(uuid: string) {
		whiteboardStore.setState(state => ({
			layers: state.layers.filter(l => l.uuid !== uuid),
		}));
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
			<SwitchIconButton
				active={layer.visible}
				activeSlot={<svg xmlns='http://www.w3.org/2000/svg' width='1rem' height='1rem' viewBox='0 0 24 24'>
					<path fill='currentColor'
						d='M1.182 12C2.122 6.88 6.608 3 12 3c5.392 0 9.878 3.88 10.819 9c-.94 5.12-5.427 9-10.819 9c-5.392 0-9.878-3.88-10.818-9ZM12 17a5 5 0 1 0 0-10a5 5 0 0 0 0 10Zm0-2a3 3 0 1 1 0-6a3 3 0 0 1 0 6Z'/>
				</svg>}
				inactiveSlot={<svg xmlns='http://www.w3.org/2000/svg' width='1rem' height='1rem' viewBox='0 0 24 24'>
					<path fill='currentColor'
						d='M4.52 5.935L1.394 2.808l1.414-1.414l19.799 19.798l-1.414 1.415l-3.31-3.31A10.949 10.949 0 0 1 12 21c-5.392 0-9.878-3.88-10.818-9A10.982 10.982 0 0 1 4.52 5.935Zm10.238 10.237l-1.464-1.464a3 3 0 0 1-4.001-4.001L7.829 9.243a5 5 0 0 0 6.929 6.929ZM7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.947 10.947 0 0 1-2.012 4.593l-3.86-3.86a5 5 0 0 0-5.68-5.68L7.975 3.76Z'/>
				</svg>}
				onClick={() => handleLayerVisibilityChange(layer.uuid)}
			/>
			<DeleteButton
				onClick={() => handleLayerDelete(layer.uuid)}
			/>
		</>
	);
});

function objectToStorageSize(obj: any): number {
	return new Blob([JSON.stringify(obj)]).size / 1024;
}

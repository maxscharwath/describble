import React, {memo} from 'react';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import List, {type ListRowProps} from 'react-virtualized/dist/commonjs/List';
import {ClosedEyeIcon, OpenEyeIcon, TargetIcon, TrashIcon} from 'ui/components/Icons';
import {Button} from '~components/ui/Buttons';
import {Spacer} from '~components/ui/Utils';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
import {PreviewLayerElement} from '~components/LayerElement';
import {Sidebar} from '~components/ui/Sidebar';
import {layerSelector, layersSelector} from '~core/selectors';
import {shallow} from 'zustand/shallow';

export const LayersSidebar = () => {
	const app = useWhiteboard();
	const layerIds = app.document.useStore(state =>
		Object.values(layersSelector(state))
			.sort((a, b) => (b.zIndex ?? Infinity) - (a.zIndex ?? Infinity))
			.map(layer => layer.id)
	, shallow);

	if (layerIds.length === 0) {
		return null;
	}

	return (
		<Sidebar title='Layers'>
			<div
				className='h-72 w-full'
			>
				<AutoSizer>
					{({width, height}) => (
						<List
							width={width}
							height={height}
							rowHeight={50}
							rowCount={layerIds.length}
							rowRenderer={props => rowRenderer({
								layerId: layerIds[props.index],
								...props,
							})}
						/>
					)}
				</AutoSizer>
			</div>
		</Sidebar>
	);
};

const rowRenderer = ({layerId, key, style, isScrolling}: ListRowProps & {layerId: string}) => (
	<div key={key} style={style}>
		<div className='flex w-full items-center space-x-2 rounded-lg bg-gray-200/50 p-2 backdrop-blur hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-800'>
			{isScrolling ? <LayerItemBase/> : <LayerItem layerId={layerId}/>}
		</div>
	</div>
);

const LayerItemBase = () => (
	<>
		<div
			className='h-8 w-8 shrink-0 rounded-lg border border-gray-300 bg-gray-100/50 p-0.5 shadow-sm dark:border-gray-600 dark:bg-gray-800/50'
		/>
		<span
			className='truncate text-sm dark:text-gray-200'
		>
				...
		</span>
		<Spacer />
		<Button
			aria-label='Target layer'
		>
			<TargetIcon/>
		</Button>
		<Button
			aria-label='Toggle layer visibility'
			activeSlot={<OpenEyeIcon/>}
			inactiveSlot={<ClosedEyeIcon/>}
		/>
		<Button
			aria-label='Delete layer'
			className='text-red-900 dark:text-red-500'
		>
			<TrashIcon/>
		</Button>
	</>
);

const LayerItem = memo(({layerId}: {layerId: string}) => {
	const app = useWhiteboard();
	const layer = app.document.useStore(layerSelector(layerId), (a, b) => a.timestamp === b.timestamp);
	function handleLayerVisibilityChange() {
		app.document.layers.patch({
			id: layer.id,
			visible: !layer.visible,
		}, 'set_layer_visibility');
	}

	function handleLayerDelete() {
		app.document.layers.delete(layer.id);
	}

	function handleTargetLayer() {
		app.targetLayer(layer.id);
	}

	return (
		<>
			<PreviewLayerElement
				layer={layer}
				className='h-8 w-8 shrink-0 rounded-lg border border-gray-300 bg-gray-100/50 p-0.5 shadow-sm dark:border-gray-600 dark:bg-gray-800/50'
			/>
			<span
				className='truncate text-sm dark:text-gray-200'
				title={layer.id}
			>
				{layer.type}
			</span>
			<Spacer />
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
				className='text-red-900 dark:text-red-500'
			>
				<TrashIcon/>
			</Button>
		</>
	);
});

LayerItem.displayName = 'LayerItem';

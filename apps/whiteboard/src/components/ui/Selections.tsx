import {useEvent} from '../../hooks/useEvents';
import {useWhiteboardStore, whiteboardStore} from '../../store/WhiteboardStore';
import React, {type PointerEvent} from 'react';
import {type LayerData, Layers} from '../layers/Layer';
import {boundsToClientCoords} from '../../utils/coordinateUtils';
import {Selection} from './Selection';
import {layersStore} from '../../store/CanvasStore';
import {LayersIcon} from 'ui/components/Icons';

export const handleLayerSelect = (e: PointerEvent, layer: LayerData) => {
	if (e.button !== 0) {
		return;
	}

	whiteboardStore.setState(state => {
		const layerExists = state.selectedLayers.some(selectedLayer => selectedLayer.uuid === layer.uuid);
		if (e.ctrlKey) {
			return {
				selectedLayers: layerExists
					? state.selectedLayers.filter(selectedLayer => selectedLayer.uuid !== layer.uuid)
					: [...state.selectedLayers, layer],
			};
		}

		return {
			selectedLayers: layerExists ? state.selectedLayers : [layer],
		};
	});
};

export const useSelection = () => {
	const {canvasRef} = useWhiteboardStore(({canvasRef}) => ({
		canvasRef,
	}));

	useEvent(canvasRef, 'pointerdown', (e: PointerEvent) => {
		const {selectedLayers} = whiteboardStore.getState();
		if (e.button !== 0 || e.ctrlKey || selectedLayers.length <= 0) {
			return;
		}

		whiteboardStore.setState({
			selectedLayers: [],
		});
	});

	const documentRef = React.useRef(window);
	useEvent(documentRef, 'keydown', (e: KeyboardEvent) => {
		const {selectedLayers} = whiteboardStore.getState();
		const {layers, removeLayer} = layersStore.getState();
		if (e.key === 'a' && e.ctrlKey) {
			e.preventDefault();
			whiteboardStore.setState({
				selectedLayers: layers,
			});
		}

		if (e.key === 'd' && e.ctrlKey) {
			e.preventDefault();
			whiteboardStore.setState({
				selectedLayers: [],
			});
		}

		if (e.key === 'Backspace' || e.key === 'Delete') {
			e.preventDefault();
			whiteboardStore.setState(state => ({
				selectedLayers: [],
			}));
			removeLayer(...selectedLayers.map(layer => layer.uuid));
		}
	});

	return {handleLayerSelect};
};

export const Selections = () => {
	const {camera, selectedLayers} = useWhiteboardStore();

	const boundingBoxes = React.useMemo(() => selectedLayers.map(layer => {
		const bound = Layers.getFactory(layer.type).getBounds(layer as never);
		return boundsToClientCoords(bound, camera);
	}), [selectedLayers, camera]);

	return (
		<>
			{boundingBoxes.map((box, index) => (
				<Selection key={selectedLayers[index].uuid} bounds={box} padding={10}/>
			))}
		</>
	);
};

export const SelectionsToolbar = () => {
	const {selectedLayers} = useWhiteboardStore();

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

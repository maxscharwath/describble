import {useEvent} from '../../hooks/useEvents';
import {useWhiteboardContext, whiteboardStore} from '../WhiteboardContext';
import React, {type PointerEvent} from 'react';
import {type LayerData, Layers} from '../layers/Layer';
import {boundsToClientCoords} from '../../utils/coordinateUtils';
import {Selection} from './Selection';

export const useSelection = () => {
	const {canvasRef, selectedLayers} = useWhiteboardContext();

	useEvent(canvasRef, 'pointerdown', (e: PointerEvent) => {
		if (e.button !== 0 || e.ctrlKey || selectedLayers.length <= 0) {
			return;
		}

		whiteboardStore.setState({
			selectedLayers: [],
		});
	});

	const documentRef = React.useRef(window);
	useEvent(documentRef, 'keydown', (e: KeyboardEvent) => {
		if (e.key === 'a' && e.ctrlKey) {
			e.preventDefault();
			whiteboardStore.setState(state => ({
				selectedLayers: state.layers,
			}));
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
				layers: state.layers.filter(layer => !state.selectedLayers.includes(layer)),
				selectedLayers: [],
			}));
		}
	});

	const handleLayerSelect = (e: PointerEvent, layer: LayerData) => {
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

	return {handleLayerSelect};
};

export const Selections = () => {
	const {camera, selectedLayers} = useWhiteboardContext();

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

import {useWhiteboardStore, whiteboardStore} from '../../store/WhiteboardStore';
import React, {useMemo, useState} from 'react';
import {Selection} from '../ui/Selection';
import {usePointerEvents} from '../../hooks/usePointerEvents';
import {type Bounds} from '../../utils/types';
import {boundsToClientCoords, mouseEventToCanvasPoint} from '../../utils/coordinateUtils';
import {type LayerData, Layers} from '../layers/Layer';
import {QuadTree} from '../../utils/QuadTree';
import {useLayersStore} from '../../store/CanvasStore';
import {useWhiteboard} from '../../core/useWhiteboard';

/**
 * This tool allows the user to select a region of the canvas.
 * @constructor
 */
export const SelectedTool: React.FC = () => {
	const {canvasRef} = useWhiteboardStore(({canvasRef}) => ({canvasRef}));
	const {layers} = useLayersStore(({layers}) => ({layers}));
	const [selection, setSelection] = useState<Bounds | null>(null);
	const app = useWhiteboard();
	const camera = app.useStore(state => state.document.camera);
	const quadTree = useMemo(() => {
		const tree = new QuadTree<LayerData>();
		layers.forEach(layer => {
			const layerBounds = Layers.getFactory(layer.type).getBounds(layer as never);
			tree.insert({bounds: layerBounds, data: layer});
		});
		return tree;
	}, [layers]);

	usePointerEvents(canvasRef, {
		onPointerDown(event) {
			if (event.buttons !== 1) {
				return;
			}

			const point = mouseEventToCanvasPoint(event, app.camera);
			setSelection({
				...point,
				width: 0,
				height: 0,
			});
		},
		onPointerUp(event) {
			if (selection) {
				const selectedLayers = quadTree.query(selection);
				if (selectedLayers.length > 0) {
					whiteboardStore.setState(state => {
						if (event.ctrlKey) {
							const selectedLayerIds = new Set(state.selectedLayers.map(layer => layer.uuid));
							const newSelectedLayers = selectedLayers.filter(layer => !selectedLayerIds.has(layer.uuid));
							return {
								selectedLayers: [...state.selectedLayers, ...newSelectedLayers],
							};
						}

						return {
							selectedLayers,
						};
					});
				}
			}

			setSelection(null);
		},
		onPointerMove(event) {
			if (event.buttons !== 1) {
				return;
			}

			const point = mouseEventToCanvasPoint(event, app.camera);
			if (selection) {
				setSelection({
					...selection,
					width: point.x - selection.x,
					height: point.y - selection.y,
				});
			}
		},
	});

	const remappedSelection = useMemo(() => {
		if (selection) {
			return boundsToClientCoords(selection, app.camera);
		}
	}, [selection, camera]);

	return remappedSelection ? <Selection bounds={remappedSelection}/> : null;
};

import React from 'react';
import {
	useBoundsEvents,
	useCanvasEvents,
	useDropImageTool,
	useKeyEvents, useLayersTree,
	useSelection, useShortcuts, useViewport,
	useWhiteboard, useZoom,
} from '~core/hooks';
import {DottedGridBackground} from '~components/ui/DottedGridBackground';
import {HandledSelection, Handles, Selection} from '~components/ui/Selection';
import {shallow} from 'zustand/shallow';
import {LayerElement} from '~components/LayerElement';
import {cameraSelector, layersSelector, selectionSelector} from '~core/selectors';
import {type Layer} from '~core/layers';
import {useHandleEvents} from '~core/hooks/useHandleEvents';

export const Canvas = () => {
	const app = useWhiteboard();
	const layersId = app.document.useStore(state =>
		Object.values(layersSelector(state))
			.filter(layer => layer.visible)
			.map(layer => layer.id)
	, shallow);
	const camera = app.document.useStore(cameraSelector, shallow);
	const selection = app.useStore(selectionSelector, shallow);
	useZoom(app.whiteboardRef);
	useDropImageTool(app.whiteboardRef);
	useShortcuts();
	const viewport = useViewport(app.whiteboardRef);

	const tree = useLayersTree(app, layersId);

	const layers = tree.query(app.getCanvasBounds(viewport));

	useKeyEvents();
	const {bounds, selectedLayers} = useSelection();

	const canvasEvents = useCanvasEvents();
	const boundsEvents = useBoundsEvents();
	const handleEvents = useHandleEvents();

	let layerWithHandles: Layer | undefined;
	if (selectedLayers.length === 1) {
		const layer = app.document.layers.get(selectedLayers[0]);
		if (layer?.handles) {
			layerWithHandles = layer;
		}
	}

	return (
		<svg
			className='absolute inset-0 h-full w-full touch-none bg-gray-200 dark:bg-gray-900'
			ref={app.whiteboardRef}
			{...canvasEvents}
		>
			<DottedGridBackground camera={camera}/>
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>
				{layers.map(layer => (
					<LayerElement
						key={layer.id}
						layerId={layer.id}
						selected={selectedLayers.includes(layer.id)}
					/>
				))}
				{selection && <Selection bounds={selection}/>}
			</g>
			{!layerWithHandles && bounds && <HandledSelection bounds={app.getScreenBounds(bounds)} padding={10} events={boundsEvents}/>}
			{layerWithHandles && <Handles layer={layerWithHandles} camera={camera} events={handleEvents}/>}
		</svg>
	);
};

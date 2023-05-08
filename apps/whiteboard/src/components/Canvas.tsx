import React from 'react';
import {
	useCanvasEvents,
	useDropImageTool,
	useKeyEvents, useLayersTree,
	useSelection,
	useTouchZoom, useViewport,
	useWheelPan,
	useWheelZoom,
	useWhiteboard,
} from '~core/hooks';
import {DottedGridBackground} from '~components/ui/DottedGridBackground';
import {Selection} from '~components/ui/Selection';
import {shallow} from 'zustand/shallow';
import {Layer} from '~components/Layer';
import {cameraSelector, layersSelector, selectionSelector} from '~core/selectors';

export const Canvas = () => {
	const app = useWhiteboard();
	const layersId = app.useStore(state =>
		Object.values(layersSelector(state))
			.filter(layer => layer.visible)
			.sort((a, b) => (a.zIndex ?? Infinity) - (b.zIndex ?? Infinity))
			.map(layer => layer.id)
	, shallow);
	const camera = app.useStore(cameraSelector, shallow);
	const selection = app.useStore(selectionSelector, shallow);
	useTouchZoom(app.whiteboardRef);
	useWheelZoom(app.whiteboardRef);
	useWheelPan(app.whiteboardRef);
	useDropImageTool(app.whiteboardRef);
	useViewport(app.whiteboardRef);

	const tree = useLayersTree(app, layersId);

	const layers = React.useMemo(() => tree.query(app.getCanvasBounds(app.viewport)), [tree, app.viewport, camera]);

	useKeyEvents();
	const events = useCanvasEvents();
	const selections = useSelection();

	return (
		<svg
			className='absolute inset-0 h-full w-full touch-none bg-gray-200 dark:bg-gray-900'
			ref={app.whiteboardRef}
			{...events}
		>
			<DottedGridBackground camera={camera}/>
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>
				{layers.map(layer => (
					<Layer
						key={layer.id}
						layerId={layer.id}
					/>
				))}
			</g>
			{selection && <Selection bounds={app.getScreenBounds(selection)}/>}
			{selections && <Selection bounds={app.getScreenBounds(selections)} padding={10}/>}
		</svg>
	);
};

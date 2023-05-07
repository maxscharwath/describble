import React from 'react';
import {
	useCanvasEvents,
	useDropImageTool,
	useKeyEvents,
	useSelection,
	useTouchZoom,
	useViewport,
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
	const canvasRef = React.useRef<SVGSVGElement>(null);
	useTouchZoom(canvasRef);
	useWheelZoom(canvasRef);
	useWheelPan(canvasRef);
	useDropImageTool(canvasRef);

	useKeyEvents();
	useViewport(canvasRef);
	const events = useCanvasEvents();
	const selections = useSelection();

	return (
		<svg
			className='fixed inset-0 h-full w-full touch-none bg-gray-200 dark:bg-gray-900'
			ref={canvasRef}
			{...events}
		>
			<DottedGridBackground camera={camera}/>
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>
				{layersId.map(layer => (
					<Layer
						key={layer}
						layerId={layer}
					/>
				))}
			</g>
			{selection && <Selection bounds={app.getScreenBounds(selection)}/>}
			{selections && <Selection bounds={app.getScreenBounds(selections)} padding={10}/>}
		</svg>
	);
};

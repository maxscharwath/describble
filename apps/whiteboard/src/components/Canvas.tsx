import React from 'react';
import {useDropImageTool} from '../hooks/UseDropImageTool';
import {useTouchZoom} from '../hooks/useTouchZoom';
import {useWheelZoom} from '../hooks/useWheelZoom';
import {useWheelPan} from '../hooks/useWheelPan';
import {DottedGridBackground} from './ui/DottedGridBackground';
import {useWhiteboard} from '../core/useWhiteboard';
import {shallow} from 'zustand/shallow';
import {Layer} from './Layer';
import {useKeyEvents} from '../core/hooks/useKeyEvents';
import {usePointerEvents} from '../core/hooks/usePointerEvents';
import {useViewport} from '../core/hooks/useViewport';

export const Canvas = () => {
	const app = useWhiteboard();
	const layersId = app.useStore(state =>
		Object.values(state.document.layers)
			.filter(layer => layer.visible)
			.sort((a, b) => (a.zIndex ?? Infinity) - (b.zIndex ?? Infinity))
			.map(layer => layer.id)
	, shallow);
	const camera = app.useStore(state => state.document.camera, shallow);
	const canvasRef = React.useRef<SVGSVGElement>(null);
	useTouchZoom(canvasRef);
	useWheelZoom(canvasRef);
	useWheelPan(canvasRef);
	useDropImageTool(canvasRef);

	useKeyEvents();
	useViewport(canvasRef);
	const events = usePointerEvents();

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
		</svg>
	);
};

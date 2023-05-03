import style from './Canvas.module.scss';
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
	const events = usePointerEvents();

	return (
		<svg
			className={style.whiteboard}
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

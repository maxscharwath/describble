import style from './Canvas.module.scss';
import React, {useMemo} from 'react';
import {useWhiteboardStore} from '../store/WhiteboardStore';
import {SelectableLayer} from './layers/Layer';
import {GlobalTools, LayerTools} from './tools/Tools';
import {useDropImageTool} from './tools/ImageTool';
import {useTouchZoom} from '../hooks/useTouchZoom';
import {useWheelZoom} from '../hooks/useWheelZoom';
import {useWheelPan} from '../hooks/useWheelPan';
import {Selections, useSelection} from './ui/Selections';
import {DottedGridBackground} from './ui/DottedGridBackground';
import {useLayersStore} from '../store/CanvasStore';
import {useWhiteboard} from '../core/useWhiteboard';
import {shallow} from 'zustand/shallow';
import {Layer} from './Layer';
import {useKeyEvents} from '../core/hooks/useKeyEvents';
import {usePointerEvents} from '../core/hooks/usePointerEvents';

export const Canvas = () => {
	const {canvasRef} = useWhiteboardStore(({canvasRef}) => ({
		canvasRef,
	}));

	const app = useWhiteboard();
	const layersId = app.useStore(state => Object.keys(state.document.layers), shallow);
	const camera = app.useStore(state => state.document.camera, shallow);

	const {layers} = useLayersStore(({layers}) => ({layers}));

	useTouchZoom();
	useWheelZoom(canvasRef);
	useWheelPan(canvasRef);
	useDropImageTool();
	useSelection();

	useKeyEvents();
	const events = usePointerEvents();

	const visibleLayers = useMemo(
		() => layers.filter(layer => layer.visible),
		[layers],
	);

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

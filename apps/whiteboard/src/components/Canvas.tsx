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

export const Canvas = () => {
	const {camera, canvasRef} = useWhiteboardStore(({camera, canvasRef}) => ({
		camera,
		canvasRef,
	}));

	const app = useWhiteboard();

	const {layers} = useLayersStore(({layers}) => ({layers}));

	useTouchZoom();
	useWheelZoom(canvasRef);
	useWheelPan(canvasRef);
	useDropImageTool();
	useSelection();

	const visibleLayers = useMemo(
		() => layers.filter(layer => layer.visible),
		[layers],
	);

	return (
		<svg
			className={style.whiteboard}
			ref={canvasRef}
			onPointerDown={app.pointerEvent.onPointerDown}
			onPointerMove={app.pointerEvent.onPointerMove}
			onPointerUp={app.pointerEvent.onPointerUp}
		>
			<DottedGridBackground camera={camera}/>
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.scale})`}>
				{visibleLayers.map(layer => (
					<SelectableLayer
						key={layer.uuid}
						layer={layer}
					/>
				))}
				<LayerTools/>
			</g>
			<Selections/>
			<GlobalTools/>
		</svg>
	);
};

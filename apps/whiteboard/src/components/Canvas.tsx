import style from './Canvas.module.scss';
import React from 'react';
import {useWhiteboardContext} from './WhiteboardContext';
import {Layer} from './layers/Layer';
import {GlobalTools, LayerTools} from './tools/Tools';
import {useDropImageTool} from './tools/ImageTool';
import {useTouchZoom} from '../hooks/useTouchZoom';
import {useWheelZoom} from '../hooks/useWheelZoom';
import {useWheelPan} from '../hooks/useWheelPan';
import {Selections, useSelection} from './ui/Selections';
import {DottedGridBackground} from './ui/DottedGridBackground';

export const Canvas = () => {
	const {camera, canvasRef, layers, currentTool} = useWhiteboardContext();

	useTouchZoom();
	useWheelZoom(canvasRef);
	useWheelPan(canvasRef);
	useDropImageTool();
	const {handleLayerSelect} = useSelection();

	return (
		<svg
			className={style.whiteboard}
			ref={canvasRef}
		>
			<DottedGridBackground camera={camera}/>
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.scale})`}>
				{layers
					.filter(layer => layer.visible)
					.map(layer => (
						<Layer
							key={layer.uuid}
							layer={layer}
							onPointerDown={e => {
								if (currentTool === 'select') {
									handleLayerSelect(e, layer);
								}
							}}
						/>
					))}
				<LayerTools/>
			</g>
			<Selections/>
			<GlobalTools/>
		</svg>
	);
};

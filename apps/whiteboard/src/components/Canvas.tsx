import style from './Canvas.module.scss';
import React from 'react';
import {type Camera, useWhiteboardContext} from './WhiteboardContext';
import {Layer, type LayerData, Layers} from './layers/Layer';
import {GlobalTools, LayerTools} from './tools/Tools';
import {useDropImageTool} from './tools/ImageTool';
import {useTouchZoom} from '../hooks/useTouchZoom';
import {useWheelZoom} from '../hooks/useWheelZoom';
import {useWheelPan} from '../hooks/useWheelPan';

const GridBackground = ({camera}: {camera: Camera}) => (
	<>
		<defs>
			<pattern
				id='smallGrid'
				width={10 * camera.scale}
				height={10 * camera.scale}
				patternUnits='userSpaceOnUse'
			>
				<path
					d='M 10 0 L 0 0 0 10'
					fill='none'
					stroke='gray'
					strokeWidth={0.5}
					transform={`scale(${camera.scale})`}
				/>
			</pattern>
			<pattern
				id='grid'
				width={100 * camera.scale}
				height={100 * camera.scale}
				patternUnits='userSpaceOnUse'
				patternTransform={`translate(${camera.x}, ${camera.y})`}
			>
				<rect
					width={100 * camera.scale}
					height={100 * camera.scale}
					fill='url(#smallGrid)'
				/>
				<path
					d='M 100 0 L 0 0 0 100'
					fill='none'
					stroke='silver'
					strokeWidth={1}
					transform={`scale(${camera.scale})`}
				/>
			</pattern>
		</defs>

		<rect width='100%' height='100%' fill='url(#grid)'/>
	</>
);

const DottedGridBackground = ({camera}: {camera: Camera}) => (
	<>
		<defs>
			<pattern
				id='dottedGrid'
				width={40 * camera.scale}
				height={40 * camera.scale}
				patternUnits='userSpaceOnUse'
				patternTransform={`translate(${camera.x}, ${camera.y})`}
			>
				<circle
					cx={20 * camera.scale}
					cy={20 * camera.scale}
					r={1.5 * camera.scale}
					fill='silver'
				/>
			</pattern>
		</defs>

		<rect width='100%' height='100%' fill='url(#dottedGrid)'/>
	</>
);

export const Canvas = () => {
	const {camera, canvasRef, layers, currentTool} = useWhiteboardContext();

	useTouchZoom();
	useWheelZoom(canvasRef);
	useWheelPan(canvasRef);
	useDropImageTool();

	const [selectedLayer, setSelectedLayer] = React.useState<LayerData | null>(null);

	const boundingBox = React.useMemo(() => {
		if (!selectedLayer) {
			return null;
		}

		const bound = Layers.getFactory(selectedLayer.type).getBounds(selectedLayer as never);
		return {
			x: (bound.x * camera.scale) + camera.x,
			y: (bound.y * camera.scale) + camera.y,
			width: bound.width * camera.scale,
			height: bound.height * camera.scale,
		};
	}, [selectedLayer, camera]);

	return (
		<svg
			className={style.whiteboard}
			ref={canvasRef}
			onPointerDown={() => {
				setSelectedLayer(null);
			}}
		>
			<DottedGridBackground camera={camera}/>
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.scale})`}>
				{layers.filter(layer => layer.visible).map(layer => (
					<Layer key={layer.uuid} layer={layer} onPointerDown={e => {
						e.stopPropagation();
						if (currentTool === 'select') {
							setSelectedLayer(layer);
						}
					}}/>
				))}
				<LayerTools/>
			</g>
			{boundingBox && (
				<rect x={boundingBox.x}
					y={boundingBox.y}
					width={boundingBox.width}
					height={boundingBox.height}
					fill='rgba(0,0,255,0.1)'
					stroke='black'
					strokeWidth='2'
					strokeDasharray='5,5'/>
			)}
			<GlobalTools/>
		</svg>
	);
};

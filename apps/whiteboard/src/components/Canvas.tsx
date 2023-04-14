import style from './Canvas.module.scss';
import React, {useEffect} from 'react';
import {type Camera, useWhiteboardContext, whiteboardStore} from './WhiteboardContext';
import {Layer} from './layers/Layer';
import {GlobalTools, LayerTools, useZoomTool} from './tools/Tools';
import {useDropImageTool} from './tools/ImageTool';

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

		<rect width='100%' height='100%' fill='url(#grid)' />
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

		<rect width='100%' height='100%' fill='url(#dottedGrid)' />
	</>
);

export const Canvas = () => {
	const store = whiteboardStore;
	const {camera, canvasRef, layers} = useWhiteboardContext();

	useZoomTool();
	useDropImageTool();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Backspace') {
				if (e.metaKey || e.ctrlKey) {
					store.setState({layers: []});
				} else {
					store.setState(l => ({layers: l.layers.slice(0, -1)}));
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	return (
		<svg
			className={style.whiteboard}
			ref={canvasRef}
		>
			<DottedGridBackground camera={camera}/>
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.scale})`}>
				{layers.filter(layer => layer.visible).map(layer => (
					<Layer key={layer.uuid} {...layer} />
				))}
				<LayerTools/>
			</g>
			<GlobalTools/>
		</svg>
	);
};

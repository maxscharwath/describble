import style from './Canvas.module.scss';
import React, {useEffect} from 'react';
import {useWhiteboardContext, whiteboardStore} from './WhiteboardContext';
import {Layer} from './layers/Layer';
import {GlobalTools, LayerTools, useZoomTool} from './tools/Tools';

export const Canvas = () => {
	const store = whiteboardStore;
	const {camera, canvasRef, layers} = useWhiteboardContext();

	useZoomTool();

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
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.scale})`}>
				{layers.filter(layer => layer.visible).map(layer => (
					<Layer key={layer.uuid} {...layer} />
				))}
				<LayerTools />
			</g>
			<GlobalTools />
		</svg>
	);
};

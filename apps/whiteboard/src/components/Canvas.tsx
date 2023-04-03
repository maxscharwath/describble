import style from './Canvas.module.scss';
import React, {type PointerEvent, useEffect, useState, type WheelEvent} from 'react';
import {useCamera, useWhiteboardContext, whiteboardStore} from './WhiteboardContext';
import {Layer, type LayerData} from './layers/Layer';
import {Selection, type SelectionBox} from './Selection';
import {nanoid} from 'nanoid';

export const Canvas = () => {
	const store = whiteboardStore;
	const context = useWhiteboardContext();
	const {camera, setCamera} = useCamera();

	const [data, setData] = useState<LayerData | null>(null);

	const [selection, setSelection] = useState<SelectionBox | null>(null);

	function handlePointerMove(e: PointerEvent<SVGElement>) {
		if (e.buttons !== 1) {
			return;
		}

		const x = (e.clientX - camera.x) / camera.scale;
		const y = (e.clientY - camera.y) / camera.scale;

		switch (context.currentTool) {
			case 'path': {
				setData(d => {
					if (d && d.type === 'path') {
						return {
							...d,
							points: [...d.points, [x, y, e.pressure]],
						};
					}

					return {
						type: 'path',
						uuid: nanoid(),
						visible: true,
						points: [[x, y, e.pressure]],
						color: context.selectedColor,
						strokeOptions: {
							size: 16,
							thinning: 0.5,
							smoothing: 0.5,
							roundness: 0.5,
						},
					};
				});
				break;
			}

			case 'rectangle': {
				setData(d => {
					if (d && d.type === 'rectangle') {
						return {
							...d,
							width: x - d.x,
							height: y - d.y,
						};
					}

					return {
						type: 'rectangle',
						uuid: nanoid(),
						visible: true,
						color: context.selectedColor,
						x,
						y,
						width: 0,
						height: 0,
					};
				});
				break;
			}

			case 'circle': {
				setData(d => {
					if (d && d.type === 'circle') {
						return {
							...d,
							width: x - d.x,
							height: y - d.y,
						};
					}

					return {
						type: 'circle',
						uuid: nanoid(),
						visible: true,
						color: context.selectedColor,
						x,
						y,
						width: 0,
						height: 0,
					};
				});
				break;
			}

			case 'image': {
				setData(d => {
					if (d && d.type === 'image') {
						return {
							...d,
							width: x - d.x,
							height: y - d.y,
						};
					}

					return {
						type: 'image',
						uuid: nanoid(),
						visible: true,
						src: 'https://f.hellowork.com/blogdumoderateur/2013/02/nyan-cat-gif-1.gif',
						x,
						y,
						width: 0,
						height: 0,
					};
				});
				break;
			}

			case 'move': {
				setCamera({x: camera.x + e.movementX, y: camera.y + e.movementY, scale: camera.scale});
				break;
			}

			case 'select': {
				setSelection(s => {
					if (s) {
						return {
							...s,
							x2: e.clientX,
							y2: e.clientY,
						};
					}

					return {
						x1: e.clientX,
						y1: e.clientY,
						x2: e.clientX,
						y2: e.clientY,
					};
				});
				break;
			}

			default:
				throw new Error('Invalid tool');
		}
	}

	function handlePointerUp() {
		if (data) {
			store.setState(l => ({
				layers: [...l.layers, data],
				history: [],
			}));
		}

		setSelection(null);
		setData(null);
	}

	function handleWheel(e: WheelEvent<SVGElement>) {
		const scale = Math.max(0.1, Math.min(10, camera.scale + ((e.deltaY > 0 ? -0.1 : 0.1) * camera.scale)));
		const x = e.clientX - ((e.clientX - camera.x) * scale / camera.scale);
		const y = e.clientY - ((e.clientY - camera.y) * scale / camera.scale);
		setCamera({x, y, scale});
	}

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
			onWheelCapture={handleWheel}
			onPointerDown={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerMove={handlePointerMove}
			className={style.whiteboard}
			ref={context.canvasRef}
		>
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.scale})`}>
				{context.layers.filter(layer => layer.visible).map(layer => (
					<Layer key={layer.uuid} data={layer} />
				))}
				{data && <Layer data={data} />}
			</g>
			{selection && <Selection box={selection} />}
		</svg>
	);
};

import style from './Canvas.module.scss';
import React, {type PointerEvent, useEffect, useMemo, useState, type WheelEvent} from 'react';
import {getStroke} from 'perfect-freehand';
import {type Layer, useWhiteboard} from './WhiteboardContext';

type Point = number[];

type Mode = 'draw' | 'pan';

/**
 * Convert a stroke to a path string with quadratic curves
 * @param stroke - A stroke as an array of [x, y, pressure] points
 */
function strokeToPath(stroke: Point[]) {
	if (!stroke.length) {
		return '';
	}

	const d = stroke.reduce(
		(acc, [x0, y0], i, arr) => {
			const [x1, y1] = arr[(i + 1) % arr.length];
			acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
			return acc;
		},
		['M', ...stroke[0], 'Q'],
	);

	return [...d, 'Z'].join(' ');
}

export const Canvas = () => {
	const {selectedColor, layers} = useWhiteboard();
	const [mode, setMode] = useState<Mode>('draw');
	const [camera, setCamera] = useState({x: 0, y: 0, scale: 1});
	const [points, setPoints] = useState<Point[]>([]);
	const pathData = useMemo(() => {
		const stroke = getStroke(points, {
			size: 16,
			thinning: 0.5,
			smoothing: 0.5,
			streamline: 0.5,
		});
		return strokeToPath(stroke);
	}, [points]);

	function handlePointerMove(e: PointerEvent<SVGElement>) {
		if (e.buttons !== 1) {
			return;
		}

		switch (mode) {
			case 'draw': {
				const x = (e.clientX - camera.x) / camera.scale;
				const y = (e.clientY - camera.y) / camera.scale;
				setPoints([...points, [x, y, e.pressure]]);
				break;
			}

			case 'pan': {
				setCamera({x: camera.x + e.movementX, y: camera.y + e.movementY, scale: camera.scale});
				break;
			}

			default:
				throw new Error('Invalid mode');
		}
	}

	function handlePointerUp() {
		if (mode !== 'draw') {
			return;
		}

		const layer = {
			zIndex: 0,
			component: ({transform}) => (
				<path d={pathData} fill={selectedColor.value} transform={transform}/>
			),
		} satisfies Layer;
		layers.set(layers => [...layers, layer]);
		setPoints([]);
	}

	function handleWheel(e: WheelEvent<SVGElement>) {
		const scale = Math.min(Math.max(camera.scale + (e.deltaY * 0.01), 0.1), 20);
		const x = e.clientX - ((e.clientX - camera.x) * scale / camera.scale);
		const y = e.clientY - ((e.clientY - camera.y) * scale / camera.scale);
		setCamera({x, y, scale});
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'Backspace':
					if (e.metaKey) {
						layers.value = [];
						break;
					}

					layers.set(layers => layers.slice(0, -1));
					break;
				case ' ':
					setMode(mode === 'draw' ? 'pan' : 'draw');
					break;
				default:
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [mode]);

	return (
		<svg
			onWheel={handleWheel}
			onPointerDown={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerMove={handlePointerMove}
			className={style.whiteboard}
		>
			{layers.value.map((layer, i) =>
				<layer.component
					key={i}
					transform={`translate(${camera.x}, ${camera.y}) scale(${camera.scale})`}
				/>,
			)}
			{points
				&& <path
					d={pathData}
					fill={selectedColor.value}
					transform={`translate(${camera.x}, ${camera.y}) scale(${camera.scale})`}
				/>}
		</svg>
	);
};

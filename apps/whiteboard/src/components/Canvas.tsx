import style from './Canvas.module.scss'
import React, { type PointerEvent, useMemo, useState } from 'react'
import { getStroke } from 'perfect-freehand'

type Point = number[];

type Layer = {
	path: string;
	color: string;
};

/**
 * Convert a stroke to a path string with quadratic curves
 * @param stroke - A stroke as an array of [x, y, pressure] points
 */
function strokeToPath (stroke: Point[]) {
	if (!stroke.length) {
		return ''
	}

	const d = stroke.reduce(
		(acc, [x0, y0], i, arr) => {
			const [x1, y1] = arr[(i + 1) % arr.length]
			acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
			return acc
		},
		['M', ...stroke[0], 'Q'],
	)

	return [...d, 'Z'].join(' ')
}

export const Canvas = () => {
	const [layers, setLayers] = useState<Layer[]>([])
	const [points, setPoints] = useState<Point[]>([])
	const [color] = useState<string>('black')
	const pathData = useMemo(() => {
		const stroke = getStroke(points, {
			size: 16,
			thinning: 0.5,
			smoothing: 0.5,
			streamline: 0.5,
		})
		return strokeToPath(stroke)
	}, [points])

	function handlePointerDown (e: PointerEvent<SVGElement>) {
		(e.target as SVGElement).setPointerCapture(e.pointerId)
		setPoints([[e.pageX, e.pageY, e.pressure]])
	}

	function handlePointerMove (e: PointerEvent<SVGElement>) {
		if (e.buttons !== 1) {
			return
		}

		setPoints([...points, [e.pageX, e.pageY, e.pressure]])
	}

	function handlePointerUp () {
		setLayers([...layers, { path: pathData, color }])
		setPoints([])
	}

	return (
		<svg
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
			onPointerMove={handlePointerMove}
			className={style.whiteboard}
		>
			{layers.map((layer, i) => (
				<path key={i} d={layer.path} fill={layer.color}/>
			))}
			{points && <path d={pathData} fill={color}/>}
		</svg>
	)
}

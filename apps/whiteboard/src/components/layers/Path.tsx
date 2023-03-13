import {type StrokeOptions} from 'perfect-freehand/dist/types/types';
import React, {useMemo} from 'react';
import {getStroke} from 'perfect-freehand';
import {createLayerComponent, type InferLayerData} from './Layer';

/**
 * Convert a stroke to a path string with quadratic curves
 * @param stroke - A stroke as an array of [x, y, pressure] points
 */
function strokeToPath(stroke: number[][]) {
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

export const PathComponent = createLayerComponent('path')<{
	points: number[][];
	color: string;
	strokeOptions: StrokeOptions;
}>(({data, ...props}) => {
	const {points, color, strokeOptions} = data;
	const path = useMemo(() => {
		const stroke = getStroke(points, strokeOptions);
		return strokeToPath(stroke);
	}, [points, strokeOptions]);
	return <path d={path} fill={color} {...props} />;
});
export type PathData = InferLayerData<typeof PathComponent>;

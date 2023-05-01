import {getStroke, type StrokeOptions} from 'perfect-freehand';
import {type PathLayer} from './PathLayerUtil';

export type Stroke = number[][];

/**
 * Convert a stroke to a path string with quadratic curves
 * @param stroke - A stroke as an array of [x, y, pressure] points
 */
export function strokeToPath(stroke: Stroke) {
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

export function toStroke(layer: PathLayer, options?: StrokeOptions) {
	return getStroke(layer.path, options) as Stroke;
}

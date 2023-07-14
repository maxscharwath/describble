import {getStroke, getStrokePoints, type StrokeOptions} from 'perfect-freehand';
import {type PathLayer} from '~core/layers/Path/PathLayerUtil';

export type Stroke = number[][];

/**
 * Convert a stroke to a path string with quadratic curves
 * @param stroke - A stroke as an array of [x, y, pressure] points
 * @param closePath - Optional boolean indicating whether the path should be closed or not, defaults to true
 */
export function strokeToPath(stroke: Stroke, closePath = true) {
	if (!stroke.length) {
		return '';
	}

	let d = `M${stroke[0][0]} ${stroke[0][1]} Q`;

	for (let i = 0; i < stroke.length - 1; i++) {
		const [x0, y0] = stroke[i].slice(0, 2);
		const [x1, y1] = stroke[i + 1].slice(0, 2);
		d += `${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2} `;
	}

	if (closePath) {
		const [x0, y0] = stroke[stroke.length - 1].slice(0, 2);
		const [x1, y1] = stroke[0].slice(0, 2);
		d += `${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2} Z`;
	} else {
		const [x0, y0] = stroke[stroke.length - 1].slice(0, 2);
		const [x1, y1] = stroke[stroke.length - 2].slice(0, 2);
		d += `${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}`;
	}

	return d;
}

export function toStroke(layer: PathLayer, options?: StrokeOptions) {
	return getStroke(layer.path.map(([x, y, ...rest]) => [x * layer.scaleX, y * layer.scaleY, ...rest]), options) as Stroke;
}

export function toPath(layer: PathLayer, options?: StrokeOptions) {
	return getStrokePoints(layer.path, options).map(({point: [x, y, ...rest]}) => [x * layer.scaleX, y * layer.scaleY, ...rest]) as Stroke;
}

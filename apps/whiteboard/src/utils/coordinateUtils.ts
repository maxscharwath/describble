import {type Camera} from '../components/WhiteboardContext';
import {type Bounds, type Point} from './types';

/**
 * Converts a point from client coordinates to canvas coordinates
 * @param point - point in client coordinates
 * @param camera - camera object
 */
export const clientCoordsToCanvasPoint = (point: Point, camera: Camera): Point => ({
	x: (point.x - camera.x) / camera.scale,
	y: (point.y - camera.y) / camera.scale,
});

/**
 * Converts a point from canvas coordinates to client coordinates
 * @param point
 * @param camera
 */
export const canvasPointToClientCoords = (point: Point, camera: Camera): Point => ({
	x: (point.x * camera.scale) + camera.x,
	y: (point.y * camera.scale) + camera.y,
});

/**
 * Converts a bounds from client coordinates to canvas coordinates
 * @param bounds
 * @param camera
 */
export const boundsToClientCoords = (bounds: Bounds, camera: Camera): Bounds => ({
	...canvasPointToClientCoords(bounds, camera),
	width: bounds.width * camera.scale,
	height: bounds.height * camera.scale,
});

export const boundsToCanvasCoords = (bounds: Bounds, camera: Camera): Bounds => ({
	...clientCoordsToCanvasPoint(bounds, camera),
	width: bounds.width / camera.scale,
	height: bounds.height / camera.scale,
});

type MouseEvent = {
	clientX: number;
	clientY: number;
};

/**
 * Converts a mouse event to a canvas point
 * @param event - mouse event
 * @param camera - camera object
 */
export const mouseEventToCanvasPoint = (event: MouseEvent, camera: Camera): Point => {
	const point = clientCoordsToCanvasPoint({x: event.clientX, y: event.clientY}, camera);
	return {
		x: Math.round(point.x),
		y: Math.round(point.y),
	};
};

/**
 * Merges two bounds into one
 * @param bounds - bounds to merge
 */
export const mergeBounds = (...bounds: Bounds[]): Bounds => {
	const x = Math.min(...bounds.map(b => b.x));
	const y = Math.min(...bounds.map(b => b.y));
	const width = Math.max(...bounds.map(b => b.x + b.width)) - x;
	const height = Math.max(...bounds.map(b => b.y + b.height)) - y;
	return {x, y, width, height};
};

/**
 * Normalizes a bounds object so that the width and height are positive
 * @param bounds
 */
export const normalizeBounds = (bounds: Bounds): Bounds => {
	const {x, y, width, height} = bounds;
	return {
		x: width < 0 ? x + width : x,
		y: height < 0 ? y + height : y,
		width: Math.abs(width),
		height: Math.abs(height),
	};
};

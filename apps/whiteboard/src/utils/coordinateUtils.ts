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

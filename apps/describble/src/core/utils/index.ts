import {type StoreApi} from 'zustand/vanilla';
import {type UseBoundStore, useStore} from 'zustand';
import {type Bounds, type Camera, type Patch, type Point} from '~core/types';

export * from './vector';

export function deepmerge<T>(target: T, patch: Patch<T>): T {
	const result: T = {...target};

	const entries = Object.entries(patch) as Array<[keyof T, T[keyof T]]>;

	for (const [key, value] of entries) {
		result[key]
      = value === Object(value) && !Array.isArray(value)
				? deepmerge(result[key], value)
				: value;
	}

	return result;
}

export function deepcopy<T>(target: T): T {
	return structuredClone(target);
}

export const createUseStore = <T> (store: StoreApi<T>) => ((selector, equalityFn) => useStore(store, selector, equalityFn)) as UseBoundStore<StoreApi<T>>;

/**
 * Normalizes a bounds object so that the width and height are positive
 * @param bounds
 * @param padding
 */
export const normalizeBounds = (bounds: Bounds, padding = 0): Bounds => {
	const {x, y, width, height} = bounds;
	return {
		x: (width < 0 ? x + width : x) - padding,
		y: (height < 0 ? y + height : y) - padding,
		width: Math.abs(width) + (padding * 2),
		height: Math.abs(height) + (padding * 2),
	};
};

export const createBounds = (p1: Point, p2: Point): Bounds => ({
	x: Math.min(p1.x, p2.x),
	y: Math.min(p1.y, p2.y),
	width: Math.abs(p1.x - p2.x),
	height: Math.abs(p1.y - p2.y),
});

export const getCanvasPoint = (point: Point, {x, y, zoom}: Camera) => ({
	x: (point.x - x) / zoom,
	y: (point.y - y) / zoom,
});

export const getScreenPoint = (point: Point, {x, y, zoom}: Camera) => ({
	x: (point.x * zoom) + x,
	y: (point.y * zoom) + y,
});

export const getScreenBounds = (bounds: Bounds, {x, y, zoom}: Camera) => ({
	x: (bounds.x * zoom) + x,
	y: (bounds.y * zoom) + y,
	width: bounds.width * zoom,
	height: bounds.height * zoom,
});

export const getCanvasBounds = (bounds: Bounds, {x, y, zoom}: Camera) => ({
	x: (bounds.x - x) / zoom,
	y: (bounds.y - y) / zoom,
	width: bounds.width / zoom,
	height: bounds.height / zoom,
});

export const generateWhiteboardName = () => {
	const adjectives = [
		'Wonderful',
		'Amazing',
		'Stunning',
		'Remarkable',
		'Marvelous',
		'Fantastic',
		'Incredible',
		'Magnificent',
		'Breathtaking',
		'Astonishing',
		'Epic',
		'Unbelievable',
		'Spectacular',
		'Majestic',
		'Impressive',
		'Inspirational',
		'Enchanting',
		'Phenomenal',
		'Extraordinary',
		'Glorious',
		'Awesome',
		'Beautiful',
		'Lovely',
	];
	const nouns = [
		'Drawing',
		'Sketch',
		'Art',
		'Design',
		'Doodle',
		'Artwork',
		'Masterpiece',
		'Creation',
		'Diagram',
		'Draft',
		'Scheme',
		'Picture',
		'Canvas',
		'Painting',
	];

	const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
	const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

	return `My ${randomAdjective} ${randomNoun}`;
};

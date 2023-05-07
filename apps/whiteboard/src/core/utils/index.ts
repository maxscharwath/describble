import {type StoreApi} from 'zustand/vanilla';
import {type UseBoundStore, useStore} from 'zustand';
import {type Bounds, type Patch, type Point} from '~core/types';

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

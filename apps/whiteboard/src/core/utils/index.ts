export * from './vector';
import {type Bounds, type Patch} from '../types';
import {type StoreApi} from 'zustand/vanilla';
import {type UseBoundStore, useStore} from 'zustand';

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
export const normalizeBounds = (bounds: Bounds): Bounds => {
	const {x, y, width, height} = bounds;
	return {
		x: width < 0 ? x + width : x,
		y: height < 0 ? y + height : y,
		width: Math.abs(width),
		height: Math.abs(height),
	};
};

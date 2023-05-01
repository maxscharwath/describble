import {type Bounds, type Point} from '../types';
import React from 'react';
import {type LayerStyle} from './shared';

export interface BaseLayer {
	id: string;
	name: string;
	type: string;
	visible: boolean;
	style: LayerStyle;
	position: Point;
	rotation: number;
}

export interface ComponentProps<T extends BaseLayer, E = any> {
	layer: T;
	ref?: React.Ref<E>;
}

export abstract class LayerUtil<T extends BaseLayer> {
	abstract Component: React.ForwardRefExoticComponent<ComponentProps<T>>;
	abstract type: T['type'];
	abstract getLayer(props: Partial<T>): T;
	abstract getBounds(layer: T): Bounds;

	protected static makeComponent<T extends BaseLayer, E extends Element = any>(component: (props: ComponentProps<T, E>, ref: React.Ref<E>) => React.ReactElement) {
		return React.forwardRef(component);
	}
}

// ---UTILS---
export type LayerUtils<U extends BaseLayer> = {
	[K in U['type']]: LayerUtil<Extract<U, {type: K}>>;
};

export type LayerUtilsKey<T extends LayerUtils<any>> = keyof T & string;
export type LayerUtilsType<T extends LayerUtils<any>> = {
	[K in LayerUtilsKey<T>]: T[K] extends LayerUtil<infer U> ? U : never;
}[LayerUtilsKey<T>];

type InferLayer<T extends string, M extends LayerUtils<any>> = M[T] extends LayerUtil<infer U> ? U : never;
type TypedPartial<T extends string, M extends LayerUtils<any>> = Partial<InferLayer<T, M>> & {type: T};
type LayerUtilsFromInstances<T extends Array<LayerUtil<any>>> = {
	[K in T[number]['type']]: Extract<T[number], {type: K}>
};

/**
 * Create a function to get a LayerUtil from a Layer
 * @param layerUtils
 */
export const makeGetLayerUtil = <T extends LayerUtils<any>>(layerUtils: T) => <K extends LayerUtilsKey<T>>(layer: K | TypedPartial<K, T>): T[K] => {
	const type = typeof layer === 'string' ? layer : layer.type;
	return layerUtils[type];
};

/**
 * Create a Record of LayerUtils keyed by their type
 * @param layerUtils - An array of LayerUtils
 * @returns A Record of LayerUtils keyed by their type
 */
export function createLayerUtils<T extends Array<LayerUtil<any>>>(...layerUtils: T): LayerUtilsFromInstances<T> {
	return layerUtils.reduce<Partial<LayerUtilsFromInstances<T>>>((acc, util) => {
		(acc as any)[util.type] = util;
		return acc;
	}, {}) as LayerUtilsFromInstances<T>;
}

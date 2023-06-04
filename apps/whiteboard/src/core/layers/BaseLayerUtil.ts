import React from 'react';
import {type Bounds, type Handle, type Point} from '~core/types';
import {type LayerStyle} from '~core/layers/shared';
import {type Asset} from '~core/WhiteboardApp';
import {normalizeBounds} from '~core/utils';

export interface BaseLayer {
	id: string;
	name: string;
	type: string;
	assetId?: string;
	visible: boolean;
	zIndex?: number;
	style: LayerStyle;
	position: Point;
	rotation: number;
	handles?: Handle[];
}

export interface ComponentProps<T extends BaseLayer> {
	layer: T;
	asset?: Asset;
	selected?: boolean;
}

export abstract class BaseLayerUtil<T extends BaseLayer> {
	public PreviewComponent?: React.FC<ComponentProps<T>>;
	public abstract type: T['type'];
	public abstract readonly Component: React.FC<ComponentProps<T>>;

	public create(props: Partial<T> & {id: string}): T {
		return this.getLayer(props);
	}

	public resize(layer: T, bounds: Bounds): T {
		const {x, y} = normalizeBounds(bounds);
		layer.position.x = x;
		layer.position.y = y;
		return layer;
	}

	public translate(layer: T, delta: Point): T {
		layer.position.x += delta.x;
		layer.position.y += delta.y;
		return layer;
	}

	public setHandle(layer: T, index: number, handle: Handle): T {
		if (!layer.handles) {
			return layer;
		}

		layer.handles[index] = handle;
		return layer;
	}

	public getCenter(layer: T): Point {
		const bounds = this.getBounds(layer);
		return {
			x: bounds.x + (bounds.width / 2),
			y: bounds.y + (bounds.height / 2),
		};
	}

	abstract getLayer(props: Partial<T>): T;

	abstract getBounds(layer: T): Bounds;

	protected static makeComponent<T extends BaseLayer>(component: React.FC<ComponentProps<T>>): React.FC<ComponentProps<T>> {
		return React.memo(component);
	}
}

// ---UTILS---
type LayerUtils<U extends BaseLayer> = {
	[K in U['type']]: BaseLayerUtil<Extract<U, {type: K}>>;
};

export type LayerUtilsKey<T extends LayerUtils<any>> = keyof T & string;
export type LayerUtilsType<T extends LayerUtils<any>> = {
	[K in LayerUtilsKey<T>]: T[K] extends BaseLayerUtil<infer U> ? U : never;
}[LayerUtilsKey<T>];

type InferLayer<T extends string, M extends LayerUtils<any>> = M[T] extends BaseLayerUtil<infer U> ? U : never;
type TypedPartial<T extends string, M extends LayerUtils<any>> = Partial<InferLayer<T, M>> & {type: T};
type LayerUtilsFromInstances<T extends Array<BaseLayerUtil<any>>> = {
	[K in T[number]['type']]: Extract<T[number], {type: K}>
};

/**
 * Create a function to get a LayerUtil from a Layer
 * @param layerUtils
 */
export const makeGetLayerUtil = <T extends LayerUtils<any>> (layerUtils: T) => {
	function getLayerUtil<K extends LayerUtilsKey<T>>(layer: K): T[K];
	function getLayerUtil<K extends LayerUtilsKey<T>>(layer: TypedPartial<K, T>): T[K];
	function getLayerUtil<K extends LayerUtilsKey<T>>(layer: LayerUtilsType<T>): T[K];
	function getLayerUtil<K extends LayerUtilsKey<T>>(layer: K | TypedPartial<K, T> | LayerUtilsType<T>): T[K] {
		const type = typeof layer === 'string' ? layer : layer.type;
		return layerUtils[type as K];
	}

	return getLayerUtil;
};

/**
 * Create a Record of LayerUtils keyed by their type
 * @param layerUtils - An array of LayerUtils
 * @returns A Record of LayerUtils keyed by their type
 */
export function createLayerUtils<T extends Array<BaseLayerUtil<any>>>(...layerUtils: T): LayerUtilsFromInstances<T> {
	return layerUtils.reduce<Partial<LayerUtilsFromInstances<T>>>((acc, util) => {
		(acc as any)[util.type] = util;
		return acc;
	}, {}) as LayerUtilsFromInstances<T>;
}

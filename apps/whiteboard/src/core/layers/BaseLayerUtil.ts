import React from 'react';
import {type Bounds, type Point} from '~core/types';
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
	handles?: Point[];
}

export interface ComponentProps<T extends BaseLayer, E = any> {
	layer: T;
	asset?: Asset;
	selected?: boolean;
	ref?: React.Ref<E>;
}

export abstract class BaseLayerUtil<T extends BaseLayer> {
	public PreviewComponent?: React.FC<ComponentProps<T>>;
	public abstract type: T['type'];
	public abstract readonly Component: React.FC<ComponentProps<T>>;

	public create(props: Partial<T> & {id: string}): T {
		return this.getLayer(props);
	}

	public resize(layer: T, bounds: Bounds): Partial<T> {
		const {x, y} = normalizeBounds(bounds);
		return {
			position: {
				x,
				y,
			},
		} satisfies Partial<BaseLayer> as Partial<T>;
	}

	public translate(layer: T, delta: Point): Partial<T> {
		return {
			position: {
				x: layer.position.x + delta.x,
				y: layer.position.y + delta.y,
			},
		} satisfies Partial<BaseLayer> as Partial<T>;
	}

	public setHandle(layer: T, index: number, handle: Point): Partial<T> {
		if (!layer.handles) {
			return {};
		}

		const handles = [...layer.handles];
		handles[index] = handle;
		return {
			handles,
		} satisfies Partial<BaseLayer> as Partial<T>;
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

	protected static makeComponent<T extends BaseLayer, E extends Element = any>(component: React.FC<ComponentProps<T, E>>): React.FC<ComponentProps<T, E>> {
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

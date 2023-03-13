import React, {memo} from 'react';
import {PathComponent} from './Path';
import {RectangleComponent} from './Rectangle';
import {CircleComponent} from './Circle';

type LayerComponent<D = {}, T = string> = React.FC<React.SVGProps<any> & {data: D}> & {type: T};

type Prettify<T> = {
	[K in keyof T]: T[K];
} & Record<string, any>;

export type InferLayerData<T> = Prettify<T extends LayerComponent<infer D, any> ? {type: T['type']} & D : never>;

export function createLayerComponent<Type extends string>(type: Type) {
	return <D extends Record<string, any>> (Component: React.FC<React.SVGProps<any> & {data: D}>) =>
		Object.assign(Component, {type}) as LayerComponent<D, Type>;
}

// List of all available layer components
const layerComponents = [PathComponent, RectangleComponent, CircleComponent] as const;

export type LayerData = InferLayerData<typeof layerComponents[number]>;
export type LayerType = LayerData['type'];

export const Layer = memo(({data, ...props}: React.SVGProps<any> & {data: LayerData}) => {
	const Component = layerComponents.find(c => c.type === data.type) as LayerComponent | undefined;
	return Component ? <Component data={data} {...props} /> : null;
});
Layer.displayName = 'Layer';

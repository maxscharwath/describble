import React, {memo} from 'react';
import {PathComponent} from './Path';
import {RectangleComponent} from './Rectangle';
import {CircleComponent} from './Circle';

type LayerComponent<D = any, T = string> = React.FC<React.SVGProps<any> & {data: D}> & {type: T};

type Prettify<T> = {
	[K in keyof T]: T[K];
} & Record<string, any>;

export type InferLayerData<T> = Prettify<T extends LayerComponent<infer D, any> ? {type: T['type']} & D : never>;

export function createLayerComponent<Type extends string>(type: Type) {
	return <D extends Record<string, any>> (Component: React.FC<React.SVGProps<any> & {data: D}>) =>
		Object.assign(Component, {type}) as LayerComponent<D, Type>;
}

// List of all available layer components
class LayerComponentsManager<T extends LayerComponent[]> extends Map<string, LayerComponent> {
	constructor(...Layers: T) {
		super(
			Layers.map(layer => [layer.type, layer]),
		);
	}
}
const layerComponents = new LayerComponentsManager(
	PathComponent,
	RectangleComponent,
	CircleComponent,
);

type LayerComponentType = typeof layerComponents extends LayerComponentsManager<infer T> ? T[number] : never;

export type LayerData = InferLayerData<LayerComponentType>;
export type LayerType = LayerData['type'];

export const Layer = memo(({data, ...props}: React.SVGProps<any> & {data: LayerData}) => {
	const Component = layerComponents.get(data.type);
	if (!Component) {
		return null;
	}

	return <Component data={data} {...props} />;
});
Layer.displayName = 'Layer';

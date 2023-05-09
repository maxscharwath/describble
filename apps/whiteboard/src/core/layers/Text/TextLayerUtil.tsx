import React from 'react';
import {deepmerge} from '~core/utils';
import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, type Dimension} from '~core/types';
import {defaultLayerStyle} from '~core/layers/shared';

const type = 'text' as const;
type TLayer = TextLayer;
type TElement = SVGTextElement;

export interface TextLayer extends BaseLayer {
	type: typeof type;
	dimensions: Dimension;
	text: string;
}

export class TextLayerUtil extends BaseLayerUtil<TLayer> {
	type = type;

	Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer}, ref) =>
		<text
			ref={ref}
			x={layer.position.x}
			y={layer.position.y}
			width={layer.dimensions.width}
			height={layer.dimensions.height}
			transform={`rotate(${layer.rotation})`}
		>
			{layer.text}
		</text>,
	);

	public getLayer(props: Partial<TLayer>): TLayer {
		return deepmerge<TLayer>(
			{
				id: '',
				name: '',
				type,
				visible: true,
				position: {x: 0, y: 0},
				text: 'Text',
				dimensions: {width: 0, height: 0},
				rotation: 0,
				style: defaultLayerStyle,
			}, props);
	}

	public getBounds(layer: TLayer): Bounds {
		const {position, dimensions} = layer;
		return {
			...position,
			...dimensions,
		};
	}

	public resize(layer: TLayer, bounds: Bounds): Partial<TLayer> {
		return {
			position: {
				x: bounds.x,
				y: bounds.y,
			},
			dimensions: {
				width: bounds.width,
				height: bounds.height,
			},
		};
	}
}

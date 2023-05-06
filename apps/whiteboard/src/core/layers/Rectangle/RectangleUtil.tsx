import React from 'react';
import {deepmerge} from '../../utils';
import {type BaseLayer, BaseLayerUtil} from '../BaseLayerUtil';
import {type Bounds, type Dimension} from '../../types';
import {defaultLayerStyle, getBaseStyle} from '../shared';

const type = 'rectangle' as const;
type TLayer = RectangleLayer;
type TElement = SVGRectElement;

export interface RectangleLayer extends BaseLayer {
	type: typeof type;
	dimensions: Dimension;
}

export class RectangleLayerUtil extends BaseLayerUtil<TLayer> {
	type = type;

	Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer}, ref) =>
		<rect
			ref={ref}
			x={layer.position.x}
			y={layer.position.y}
			rx={5}
			width={layer.dimensions.width}
			height={layer.dimensions.height}
			transform={`rotate(${layer.rotation})`}
			{...getBaseStyle(layer.style)}
		/>,
	);

	public getLayer(props: Partial<TLayer>): TLayer {
		return deepmerge<TLayer>(
			{
				id: '',
				name: '',
				type,
				visible: true,
				position: {x: 0, y: 0},
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

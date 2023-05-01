import React from 'react';
import {deepmerge} from '../../utils';
import {type BaseLayer, BaseLayerUtil} from '../BaseLayerUtil';
import {type Bounds, type Dimension} from '../../types';
import {defaultLayerStyle} from '../shared';

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
			width={layer.dimensions.width}
			height={layer.dimensions.height}
			rotate={layer.rotation}
			fill={layer.style.color}
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

	getBounds(layer: TLayer): Bounds {
		const {position, dimensions} = layer;
		return {
			...position,
			...dimensions,
		};
	}
}

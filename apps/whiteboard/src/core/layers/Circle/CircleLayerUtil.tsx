import React from 'react';
import {deepmerge} from '../../utils';
import {type BaseLayer, BaseLayerUtil} from '../BaseLayerUtil';
import {type Bounds} from '../../types';
import {defaultLayerStyle} from '../shared';

const type = 'circle' as const;
type TLayer = CircleLayer;
type TElement = SVGEllipseElement;

export interface CircleLayer extends BaseLayer {
	type: typeof type;
	rx: number;
	ry: number;
}

export class CircleLayerUtil extends BaseLayerUtil<TLayer> {
	type = type;
	Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer}, ref) =>
		<ellipse
			ref={ref}
			x={layer.position.x}
			y={layer.position.y}
			rx={layer.rx}
			ry={layer.ry}
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
				rotation: 0,
				rx: 0,
				ry: 0,
				style: defaultLayerStyle,
			}, props);
	}

	public getBounds(layer: TLayer): Bounds {
		const {position: {x, y}, rx, ry} = layer;
		return {
			x: x - rx,
			y: y - ry,
			width: rx * 2,
			height: ry * 2,
		};
	}
}

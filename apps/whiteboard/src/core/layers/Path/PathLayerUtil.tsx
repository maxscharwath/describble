import React from 'react';
import {deepmerge} from '../../utils';
import {type BaseLayer, BaseLayerUtil} from '../BaseLayerUtil';
import {type Bounds} from '../../types';
import {defaultLayerStyle} from '../shared';
import {strokeToPath, toStroke} from './PathHelpers';

const type = 'path' as const;
type TLayer = PathLayer;
type TElement = SVGPathElement;

export interface PathLayer extends BaseLayer {
	type: typeof type;
	path: number[][];
}

export class PathLayerUtil extends BaseLayerUtil<TLayer> {
	type = type;
	Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer}, ref) =>
		<path
			ref={ref}
			x={layer.position.x}
			y={layer.position.y}
			rotate={layer.rotation}
			fill={layer.style.color}
			d={strokeToPath(toStroke(layer))}
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
				path: [],
				style: defaultLayerStyle,
			}, props);
	}

	public getBounds(_layer: TLayer): Bounds {
		return {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
		};
	}
}

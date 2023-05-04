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
			transform={`translate(${layer.position.x} ${layer.position.y})`}
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
				position: {x: 0, y: 0}, // Where is the first point
				rotation: 0,
				path: [], // Relative to position
				style: defaultLayerStyle,
			}, props);
	}

	public getBounds(layer: TLayer): Bounds {
		const {path} = layer;
		if (path.length < 1) {
			return {...layer.position, width: 0, height: 0};
		}

		const bounds = path.reduce(
			(acc, [x, y]) => ({
				minX: Math.min(acc.minX, x),
				minY: Math.min(acc.minY, y),
				maxX: Math.max(acc.maxX, x),
				maxY: Math.max(acc.maxY, y),
			}),
			{minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity},
		);

		return {
			x: layer.position.x + bounds.minX,
			y: layer.position.y + bounds.minY,
			width: bounds.maxX - bounds.minX,
			height: bounds.maxY - bounds.minY,
		};
	}
}

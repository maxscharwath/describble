import React from 'react';
import {deepmerge} from '../../utils';
import {type BaseLayer, BaseLayerUtil} from '../BaseLayerUtil';
import {type Bounds, type Dimension} from '../../types';
import {defaultLayerStyle} from '../shared';

const type = 'image' as const;
type TLayer = ImageLayer;
type TElement = SVGImageElement;

export interface ImageLayer extends BaseLayer {
	type: typeof type;
	dimensions: Dimension;
	assetId: string;
}

export class ImageLayerUtil extends BaseLayerUtil<TLayer> {
	type = type;

	Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer, asset}, ref) =>
		<image
			ref={ref}
			x={layer.position.x}
			y={layer.position.y}
			width={layer.dimensions.width}
			height={layer.dimensions.height}
			rotate={layer.rotation}
			href={asset?.src ?? 'https://media.tenor.com/lx2WSGRk8bcAAAAC/pulp-fiction-john-travolta.gif'}
			preserveAspectRatio='none'
		/>,
	);

	public getLayer(props: Partial<TLayer>): TLayer {
		return deepmerge<TLayer>(
			{
				id: '',
				name: '',
				type,
				assetId: '',
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

	resize(layer: TLayer, bounds: Bounds): Partial<TLayer> {
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

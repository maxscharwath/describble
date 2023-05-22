import React from 'react';
import {deepmerge, normalizeBounds} from '~core/utils';
import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, type Dimension} from '~core/types';
import {defaultLayerStyle} from '~core/layers/shared';

const type = 'image' as const;
type TLayer = ImageLayer;
type TElement = SVGImageElement;

export interface ImageLayer extends BaseLayer {
	type: typeof type;
	dimensions: Dimension;
	assetId: string;
}

export class ImageLayerUtil extends BaseLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer, asset}, ref) =>
		<image
			ref={ref}
			x={layer.position.x}
			y={layer.position.y}
			width={layer.dimensions.width}
			height={layer.dimensions.height}
			transform={`rotate(${layer.rotation})`}
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

	public getBounds(layer: TLayer): Bounds {
		const {position, dimensions} = layer;
		return {
			...position,
			...dimensions,
		};
	}

	public resize(layer: TLayer, bounds: Bounds): Partial<TLayer> {
		const {x, y, width, height} = normalizeBounds(bounds);
		return {
			position: {
				x,
				y,
			},
			dimensions: {
				width,
				height,
			},
		};
	}
}

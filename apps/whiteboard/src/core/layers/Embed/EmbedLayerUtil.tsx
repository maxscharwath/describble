import React from 'react';
import {deepmerge, normalizeBounds} from '~core/utils';
import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, type Dimension} from '~core/types';
import {defaultLayerStyle} from '~core/layers/shared';

const type = 'embed' as const;
type TLayer = EmbedLayer;
type TElement = SVGForeignObjectElement;

export interface EmbedLayer extends BaseLayer {
	type: typeof type;
	dimensions: Dimension;
	url: string;
}

export class EmbedLayerUtil extends BaseLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer}, ref) => <foreignObject
		width={layer.dimensions.width}
		height={layer.dimensions.height}
		x={layer.position.x}
		y={layer.position.y}
		ref={ref}
	>
		<iframe
			className='flex h-full w-full select-none items-center justify-center border-0'
			src={layer.url}
			allow='autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
		/>
	</foreignObject>,
	);

	public PreviewComponent = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer}) => {
		const url = new URL(layer.url).hostname;
		return <image
			href={`https://www.google.com/s2/favicons?domain=${url}&sz=64`}
			width='100%'
			height='100%'
		/>;
	});

	public getLayer(props: Partial<TLayer>): TLayer {
		return deepmerge<TLayer>(
			{
				id: '',
				name: '',
				type,
				visible: true,
				position: {x: 0, y: 0},
				url: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
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

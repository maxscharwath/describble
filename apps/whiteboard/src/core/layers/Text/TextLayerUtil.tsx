import React from 'react';
import {deepmerge} from '~core/utils';
import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, type Dimension} from '~core/types';
import {defaultLayerStyle, getTextStyle} from '~core/layers/shared';

const type = 'text' as const;
type TLayer = TextLayer;
type TElement = SVGForeignObjectElement;

export interface TextLayer extends BaseLayer {
	type: typeof type;
	dimensions: Dimension;
	text: string;
}

export class TextLayerUtil extends BaseLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer}, ref) => {
		const style = getTextStyle(layer.style);
		return <foreignObject
			width={layer.dimensions.width}
			height={layer.dimensions.height}
			x={layer.position.x}
			y={layer.position.y}
			ref={ref}
		>
			<span className='font-caveat flex h-full w-full select-none items-center justify-center' style={style}>
				{layer.text}
			</span>
		</foreignObject>;
	},
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

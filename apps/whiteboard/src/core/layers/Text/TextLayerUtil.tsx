import React from 'react';
import {deepmerge, normalizeBounds} from '~core/utils';
import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, type Dimension} from '~core/types';
import {defaultLayerStyle, getTextStyle} from '~core/layers/shared';

const type = 'text' as const;
type TLayer = TextLayer;

export interface TextLayer extends BaseLayer {
	type: typeof type;
	dimensions: Dimension;
	text: string;
}

export class TextLayerUtil extends BaseLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer>(({layer, selected}) => {
		const style = getTextStyle(layer.style);
		return <g transform={`rotate(${layer.rotation})`}>
			<foreignObject
				width={layer.dimensions.width}
				height={layer.dimensions.height}
				x={layer.position.x}
				y={layer.position.y}
			>
				<span className='flex h-full w-full select-none items-center justify-center font-caveat' style={style}>
					{layer.text}
				</span>
			</foreignObject>

			{selected && (
				<rect
					x={layer.position.x}
					y={layer.position.y}
					rx={5}
					width={layer.dimensions.width}
					height={layer.dimensions.height}
					strokeWidth={5}
					fill='none'
					className='stroke-dashed stroke-gray-400/90'
					vectorEffect='non-scaling-stroke'
				/>
			)}
		</g>;
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

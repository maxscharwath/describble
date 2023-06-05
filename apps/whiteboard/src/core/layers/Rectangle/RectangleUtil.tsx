import React from 'react';
import {deepmerge, normalizeBounds} from '~core/utils';
import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, type Dimension} from '~core/types';
import {defaultLayerStyle, getBaseStyle} from '~core/layers/shared';

const type = 'rectangle' as const;
type TLayer = RectangleLayer;

export interface RectangleLayer extends BaseLayer {
	type: typeof type;
	dimensions: Dimension;
}

export class RectangleLayerUtil extends BaseLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer>(({layer, selected}) =>
		<g transform={`rotate(${layer.rotation})`}>
			<rect
				x={layer.position.x}
				y={layer.position.y}
				rx={5}
				width={layer.dimensions.width}
				height={layer.dimensions.height}
				{...getBaseStyle(layer.style)}
			/>
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
		</g>,
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

	public resize(current: TLayer, layer: TLayer, bounds: Bounds): TLayer {
		const {x, y, width, height} = normalizeBounds(bounds);
		current.position.x = x;
		current.position.y = y;
		current.dimensions.width = width;
		current.dimensions.height = height;
		return current;
	}
}

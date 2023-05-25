import React from 'react';
import {deepmerge, normalizeBounds} from '~core/utils';
import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds} from '~core/types';
import {defaultLayerStyle, getBaseStyle} from '~core/layers/shared';

const type = 'circle' as const;
type TLayer = CircleLayer;
type TElement = SVGEllipseElement;

export interface CircleLayer extends BaseLayer {
	type: typeof type;
	rx: number;
	ry: number;
}

export class CircleLayerUtil extends BaseLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer, selected}, ref) =>
		<g transform={`rotate(${layer.rotation})`}>
			<ellipse
				ref={ref}
				cx={layer.position.x}
				cy={layer.position.y}
				rx={layer.rx}
				ry={layer.ry}
				{...getBaseStyle(layer.style)}
			/>
			{selected && (
				<ellipse
					cx={layer.position.x}
					cy={layer.position.y}
					rx={layer.rx}
					ry={layer.ry}
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

	public resize(layer: TLayer, bounds: Bounds): Partial<TLayer> {
		const {x, y, width, height} = normalizeBounds(bounds);
		return {
			position: {
				x: x + (width / 2),
				y: y + (height / 2),
			},
			rx: Math.abs(width / 2),
			ry: Math.abs(height / 2),
		};
	}
}

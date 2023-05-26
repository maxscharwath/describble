import React from 'react';
import {deepmerge} from '~core/utils';
import {BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Handle} from '~core/types';
import {defaultLayerStyle, getBaseStyle} from '~core/layers/shared';
import {type BaseHandlesLayer, BaseHandlesLayerUtil} from '~core/layers/BaseHandlesLayerUtil';

const type = 'line' as const;
type TLayer = LineLayer;

export interface LineLayer extends BaseHandlesLayer {
	type: typeof type;
	handles: [Handle, Handle];
}

export class LineLayerUtil extends BaseHandlesLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer>(({layer, selected}) => {
		const [start, end] = layer.handles;
		return <g transform={`rotate(${layer.rotation}) translate(${layer.position.x} ${layer.position.y})`}>
			<path
				{...getBaseStyle(layer.style)}
				d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
			/>
			{selected && (
				<path
					d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
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
				rotation: 0,
				handles: [
					{x: 0, y: 0},
					{x: 1, y: 1},
				],
				style: defaultLayerStyle,
			}, props);
	}
}

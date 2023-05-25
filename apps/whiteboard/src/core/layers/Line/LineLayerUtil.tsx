import React from 'react';
import {deepmerge} from '~core/utils';
import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, type Point} from '~core/types';
import {defaultLayerStyle, getBaseStyle} from '~core/layers/shared';

const type = 'line' as const;
type TLayer = LineLayer;
type TElement = SVGPathElement;

export interface LineLayer extends BaseLayer {
	type: typeof type;
	handles: [Point, Point];
}

export class LineLayerUtil extends BaseLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer, selected}) => {
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

	public getBounds(layer: TLayer): Bounds {
		const [start, end] = layer.handles;
		const x = Math.min(start.x, end.x) + layer.position.x;
		const y = Math.min(start.y, end.y) + layer.position.y;
		const width = Math.abs(end.x - start.x);
		const height = Math.abs(end.y - start.y);

		return {x, y, width, height};
	}

	public resize(layer: TLayer, bounds: Bounds): Partial<TLayer> {
		const oldBounds = this.getBounds(layer);

		const scaleX = bounds.width / oldBounds.width;
		const scaleY = bounds.height / oldBounds.height;

		const handles = layer.handles.map(({x, y}) => ({
			x: x * scaleX,
			y: y * scaleY,
		})) as [Point, Point];

		const position = {
			x: ((layer.position.x - oldBounds.x) * scaleX) + bounds.x,
			y: ((layer.position.y - oldBounds.y) * scaleY) + bounds.y,
		};

		return {
			handles,
			position,
		};
	}
}

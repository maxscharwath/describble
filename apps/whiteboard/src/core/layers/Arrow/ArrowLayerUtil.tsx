import React from 'react';
import {deepmerge} from '~core/utils';
import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds, type Point} from '~core/types';
import {defaultLayerStyle, getArrowStyle, getBaseStyle, Size} from '~core/layers/shared';
import {match} from 'ts-pattern';

const type = 'arrow' as const;
type TLayer = ArrowLayer;
type TElement = SVGPathElement;

export interface ArrowLayer extends BaseLayer {
	type: typeof type;
	points: {
		start: Point;
		end: Point;
	};
}

export class ArrowLayerUtil extends BaseLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer, TElement>(({layer, selected}, ref) => {
		const arrowSize = match(layer.style)
			.with({size: Size.Small}, () => 20)
			.with({size: Size.Medium}, () => 30)
			.with({size: Size.Large}, () => 60)
			.exhaustive();
		const dx = layer.points.end.x - layer.points.start.x;
		const dy = layer.points.end.y - layer.points.start.y;
		const angle = Math.atan2(dy, dx);
		const lineLength = Math.hypot(dx, dy) - arrowSize;

		return (
			<g ref={ref} transform={`rotate(${layer.rotation}) translate(${layer.position.x} ${layer.position.y})`}>
				{ lineLength > 0
					&& <path
						d={`M ${layer.points.start.x} ${layer.points.start.y} L ${layer.points.start.x + (lineLength * Math.cos(angle))} ${layer.points.start.y + (lineLength * Math.sin(angle))}`}
						{...getBaseStyle(layer.style)}
					/>
				}
				<polygon
					transform={`translate(${layer.points.end.x}, ${layer.points.end.y}) rotate(${angle * 180 / Math.PI})`}
					points={`0,0 ${-arrowSize},${-arrowSize / 2} ${-arrowSize},${arrowSize / 2}`}
					{...getArrowStyle(layer.style)}
				/>
				{selected && (
					<>
						{lineLength > 0
							&& <path
								d={`M ${layer.points.start.x} ${layer.points.start.y} L ${layer.points.start.x + (lineLength * Math.cos(angle))} ${layer.points.start.y + (lineLength * Math.sin(angle))}`}
								strokeWidth={5}
								fill='none'
								className='stroke-dashed stroke-gray-400/90'
								vectorEffect='non-scaling-stroke'
							/>
						}
						<polygon
							transform={`translate(${layer.points.end.x}, ${layer.points.end.y}) rotate(${angle * 180 / Math.PI})`}
							points={`0,0 ${-arrowSize},${-arrowSize / 2} ${-arrowSize},${arrowSize / 2}`}
							strokeWidth={5}
							fill='none'
							className='stroke-dashed stroke-gray-400/90'
							vectorEffect='non-scaling-stroke'
						/>
					</>
				)}
			</g>
		);
	});

	public getLayer(props: Partial<TLayer>): TLayer {
		return deepmerge<TLayer>(
			{
				id: '',
				name: '',
				type,
				visible: true,
				position: {x: 0, y: 0},
				rotation: 0,
				points: {
					start: {x: 0, y: 0},
					end: {x: 0, y: 0},
				},
				style: defaultLayerStyle,
			}, props);
	}

	public getBounds(layer: TLayer): Bounds {
		const {start, end} = layer.points;
		const x = Math.min(start.x, end.x) + layer.position.x;
		const y = Math.min(start.y, end.y) + layer.position.y;
		const width = Math.abs(end.x - start.x);
		const height = Math.abs(end.y - start.y);

		return {x, y, width, height};
	}

	public resize(layer: TLayer, bounds: Bounds): Partial<TLayer> {
		const {x, y, width, height} = bounds;
		const diagonal = Math.hypot(width, height);
		const angle = Math.atan2(height, width);

		const newStart = {
			x: x - layer.position.x,
			y: y - layer.position.y,
		};
		const newEnd = {
			x: newStart.x + (diagonal * Math.cos(angle)),
			y: newStart.y + (diagonal * Math.sin(angle)),
		};

		return {
			points: {
				start: newStart,
				end: newEnd,
			},
		};
	}
}

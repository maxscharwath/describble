import React from 'react';
import {match} from 'ts-pattern';
import {type StrokeOptions} from 'perfect-freehand';
import {deepmerge} from '~core/utils';
import {type BaseLayer, BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Bounds} from '~core/types';
import {BorderStyle, defaultLayerStyle, FillStyle, getBaseStyle} from '~core/layers/shared';
import {strokeToPath, toPath, toStroke} from '~core/layers/Path/PathHelpers';

const type = 'path' as const;
type TLayer = PathLayer;

export interface PathLayer extends BaseLayer {
	type: typeof type;
	path: number[][];
}

export class PathLayerUtil extends BaseLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer>(({layer, selected}) => {
		const isClosed = this.isShapeClosed(layer);
		const style = getBaseStyle(layer.style);
		const strokeOptions: StrokeOptions = {
			size: Number(style.strokeWidth),
		};
		return (
			<g
				transform={`translate(${layer.position.x} ${layer.position.y}) rotate(${layer.rotation})`}
			>
				{isClosed && layer.style.fillStyle !== FillStyle.Empty && <path
					fill={style.fill}
					d={strokeToPath(toPath(layer, strokeOptions))}
				/>}
				{
					match(layer.style)
						.with({borderStyle: BorderStyle.Solid}, () => <path fill={style.stroke} d={strokeToPath(toStroke(layer, strokeOptions))}/>)
						.otherwise(() => <path {...style} fill='none' d={strokeToPath(toPath(layer, {...strokeOptions, last: false}), false)}/>)
				}
				{selected && (
					<path
						d={strokeToPath(toPath(layer, strokeOptions), false)}
						strokeWidth={5}
						fill='none'
						className='stroke-dashed stroke-gray-400/90'
						vectorEffect='non-scaling-stroke'
					/>
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
				path: [],
				style: defaultLayerStyle,
			}, props);
	}

	public getBounds(layer: TLayer): Bounds {
		const {path} = layer;
		if (path.length < 1) {
			return {...layer.position, width: 0, height: 0};
		}

		const bounds = path.reduce(
			(acc, [x, y]) => ({
				minX: Math.min(acc.minX, x),
				minY: Math.min(acc.minY, y),
				maxX: Math.max(acc.maxX, x),
				maxY: Math.max(acc.maxY, y),
			}),
			{minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity},
		);

		return {
			x: layer.position.x + bounds.minX,
			y: layer.position.y + bounds.minY,
			width: bounds.maxX - bounds.minX,
			height: bounds.maxY - bounds.minY,
		};
	}

	public isShapeClosed(layer: TLayer, delta = 10): boolean {
		const {path} = layer;

		if (path.length < 2) {
			return false;
		}

		const firstPoint = path[0];
		const lastPoint = path[path.length - 1];

		const distance = Math.hypot(lastPoint[0] - firstPoint[0], lastPoint[1] - firstPoint[1]);

		return distance <= delta;
	}

	public resize(layer: TLayer, bounds: Bounds): Partial<TLayer> {
		const oldBounds = this.getBounds(layer);

		const scaleX = bounds.width / oldBounds.width;
		const scaleY = bounds.height / oldBounds.height;

		const path = layer.path.map(([x, y, ...rest]) => [
			x * scaleX,
			y * scaleY,
			...rest,
		]);

		return {
			path,
			position: {
				x: ((layer.position.x - oldBounds.x) * scaleX) + bounds.x,
				y: ((layer.position.y - oldBounds.y) * scaleY) + bounds.y,
			},
		};
	}
}

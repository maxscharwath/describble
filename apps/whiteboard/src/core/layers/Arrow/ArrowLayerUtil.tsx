import React from 'react';
import {deepmerge} from '~core/utils';
import {BaseLayerUtil} from '~core/layers/BaseLayerUtil';
import {type Handle} from '~core/types';
import {defaultLayerStyle} from '~core/layers/shared';
import {ArrowHeadStyle, ArrowLayerComponent} from '~core/layers/Arrow/components/ArrowLayerComponent';
import {type BaseHandlesLayer, BaseHandlesLayerUtil} from '~core/layers/BaseHandlesLayerUtil';

const type = 'arrow' as const;
type TLayer = ArrowLayer;

export interface ArrowLayer extends BaseHandlesLayer {
	type: typeof type;
	bend: number;
	handles: [Handle, Handle];
}

export class ArrowLayerUtil extends BaseHandlesLayerUtil<TLayer> {
	public type = type;

	public Component = BaseLayerUtil.makeComponent<TLayer>(({layer, selected}) => {
		const start = layer.handles.at(0) ?? {x: 0, y: 0};
		const end = layer.handles.at(-1) ?? {x: 0, y: 0};
		return (
			<g transform={`translate(${layer.position.x}, ${layer.position.y}) rotate(${layer.rotation})`}>
				<ArrowLayerComponent
					start={start}
					end={end}
					style={layer.style}
					selected={selected}
					endArrow={ArrowHeadStyle.DoubleLine}
					startArrow={ArrowHeadStyle.Round}
				/>
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
				bend: 0,
				handles: [
					{x: 0, y: 0},
					{x: 1, y: 1},
				],
				style: defaultLayerStyle,
			}, props);
	}
}

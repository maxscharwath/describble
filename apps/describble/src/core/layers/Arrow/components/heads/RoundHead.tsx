import {type BaseHeadArrow} from '~core/layers/Arrow/components/ArrowLayerComponent';
import {getArrowStyle, Size} from '~core/layers/shared';
import React from 'react';
import {match} from 'ts-pattern';

export const RoundHead: BaseHeadArrow = {
	Component: ({end, rotation, size, style, selected}) => (
		<>
			<circle
				transform={`translate(${end.x}, ${end.y}) rotate(${rotation * 180 / Math.PI})`}
				r={size}
				{...getArrowStyle(style)}
			/>
			{selected && (
				<circle
					transform={`translate(${end.x}, ${end.y}) rotate(${rotation * 180 / Math.PI})`}
					r={size}
					strokeWidth={5}
					fill='none'
					className='stroke-dashed stroke-gray-400/90'
					vectorEffect='non-scaling-stroke'
				/>
			)}
		</>
	),
	settings(style) {
		const size = match(style.size)
			.with(Size.Small, () => 8)
			.with(Size.Medium, () => 15)
			.with(Size.Large, () => 25)
			.exhaustive();
		return {size, offset: size};
	},
};

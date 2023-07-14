import {type BaseHeadArrow} from '~core/layers/Arrow/components/ArrowLayerComponent';
import {getArrowStyle, Size} from '~core/layers/shared';
import React from 'react';
import {match} from 'ts-pattern';

export const TriangleHead: BaseHeadArrow = {
	Component: ({end, rotation, size, style, selected}) => (
		<>
			<polygon
				transform={`translate(${end.x}, ${end.y}) rotate(${rotation * 180 / Math.PI})`}
				points={`0,0 ${-size},${-size / 2} ${-size},${size / 2}`}
				{...getArrowStyle(style)}
			/>
			{selected && (
				<polygon
					transform={`translate(${end.x}, ${end.y}) rotate(${rotation * 180 / Math.PI})`}
					points={`0,0 ${-size},${-size / 2} ${-size},${size / 2}`}
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
			.with(Size.Small, () => 20)
			.with(Size.Medium, () => 30)
			.with(Size.Large, () => 60)
			.exhaustive();
		return {size, offset: size};
	},
};

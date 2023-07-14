import {type BaseHeadArrow} from '~core/layers/Arrow/components/ArrowLayerComponent';
import {getArrowStyle, Size} from '~core/layers/shared';
import React from 'react';
import {match} from 'ts-pattern';

export const DoubleLineHead: BaseHeadArrow = {
	Component: ({end, rotation, size, style, selected}) => (
		<>
			<line
				transform={`translate(${end.x}, ${end.y}) rotate(${rotation * 180 / Math.PI})`}
				x1={-size} y1={-size / 2} x2={0} y2={0}
				{...getArrowStyle(style)}
			/>
			<line
				transform={`translate(${end.x}, ${end.y}) rotate(${rotation * 180 / Math.PI})`}
				x1={-size} y1={size / 2} x2={0} y2={0}
				{...getArrowStyle(style)}
			/>
			{selected && (
				<>
					<line
						transform={`translate(${end.x}, ${end.y}) rotate(${rotation * 180 / Math.PI})`}
						x1={-size} y1={-size / 2} x2={0} y2={0}
						strokeWidth={5}
						fill='none'
						className='stroke-dashed stroke-gray-400/90'
						vectorEffect='non-scaling-stroke'
					/>
					<line
						transform={`translate(${end.x}, ${end.y}) rotate(${rotation * 180 / Math.PI})`}
						x1={-size} y1={size / 2} x2={0} y2={0}
						strokeWidth={5}
						fill='none'
						className='stroke-dashed stroke-gray-400/90'
						vectorEffect='non-scaling-stroke'
					/>
				</>
			)}
		</>
	),
	settings(style) {
		const size = match(style.size)
			.with(Size.Small, () => 20)
			.with(Size.Medium, () => 30)
			.with(Size.Large, () => 60)
			.exhaustive();
		return {size, offset: 0};
	},
};

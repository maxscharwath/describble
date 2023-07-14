import {getBaseStyle, type LayerStyle} from '~core/layers/shared';
import React from 'react';
import {type Point} from '~core/types';

type ArrowBodyProps = {
	start: Point;
	lineLength: number;
	rotation: number;
	style: LayerStyle;
};

export const ArrowBody = ({start, lineLength, rotation, style}: ArrowBodyProps) => {
	if (lineLength <= 0) {
		return null;
	}

	return <path
		d={`M ${start.x} ${start.y} L ${start.x + (lineLength * Math.cos(rotation))} ${start.y + (lineLength * Math.sin(rotation))}`}
		{...getBaseStyle(style)}
	/>;
};

export const ArrowBodyOverlay = ({start, lineLength, rotation}: Omit<ArrowBodyProps, 'style'>) => {
	if (lineLength <= 0) {
		return null;
	}

	return <path
		d={`M ${start.x} ${start.y} L ${start.x + (lineLength * Math.cos(rotation))} ${start.y + (lineLength * Math.sin(rotation))}`}
		strokeWidth={5}
		fill='none'
		className='stroke-dashed stroke-gray-400/90'
		vectorEffect='non-scaling-stroke'
	/>;
};

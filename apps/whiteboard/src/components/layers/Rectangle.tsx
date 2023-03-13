import React from 'react';
import {createLayerComponent, type InferLayerData} from './Layer';

export const RectangleComponent = createLayerComponent('rectangle')<{
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
}>(({data, ...props}) => {
	let {x, y, width, height, color} = data;
	if (width < 0) {
		x += width;
		width = -width;
	}

	if (height < 0) {
		y += height;
		height = -height;
	}

	return <rect x={x} y={y} width={width} height={height} fill={color} {...props} />;
});
export type RectangleData = InferLayerData<typeof RectangleComponent>;

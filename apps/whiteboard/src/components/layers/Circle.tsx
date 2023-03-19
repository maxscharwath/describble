import React from 'react';
import {createLayerComponent, type InferLayerData} from './Layer';

export const CircleComponent = createLayerComponent('circle')<{
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
}>(({data, ...props}) => {
	const {x, y, width, height, color} = data;
	const cx = x + (width / 2);
	const cy = y + (height / 2);
	const rx = Math.abs(width / 2);
	const ry = Math.abs(height / 2);
	return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} {...props} />;
});
export type CircleData = InferLayerData<typeof CircleComponent>;

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
	return <ellipse cx={x} cy={y} rx={Math.abs(width)} ry={Math.abs(height)} fill={color} {...props} />;
});
export type CircleData = InferLayerData<typeof CircleComponent>;

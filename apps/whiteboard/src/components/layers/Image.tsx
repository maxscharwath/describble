import React from 'react';
import {createLayerComponent, type InferLayerData} from './Layer';

export const ImageComponent = createLayerComponent('image')<{
	x: number;
	y: number;
	width: number;
	height: number;
	src: string;
}>(({data, ...props}) => {
	let {x, y, width, height, src} = data;
	if (width < 0) {
		x += width;
		width = -width;
	}

	if (height < 0) {
		y += height;
		height = -height;
	}

	return <image x={x} y={y} width={width} height={height} href={src} preserveAspectRatio='none' {...props} />;
});
export type ImageData = InferLayerData<typeof ImageComponent>;

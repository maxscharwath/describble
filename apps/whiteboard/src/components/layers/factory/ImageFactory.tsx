import React from 'react';
import {z} from 'zod';
import {BaseLayerSchema, LayerFactory} from './LayerFactory';

export const ImageSchema = BaseLayerSchema.extend({
	type: z.literal('image'),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
	src: z.string(),
});

export class ImageFactory extends LayerFactory<typeof ImageSchema> {
	constructor() {
		super('image', ImageSchema);
	}

	createComponent(props: z.infer<typeof ImageSchema>): React.ReactElement {
		let {x, y, width, height, src} = props;
		if (width < 0) {
			x += width;
			width = -width;
		}

		if (height < 0) {
			y += height;
			height = -height;
		}

		return <image x={x} y={y} width={width} height={height} href={src} preserveAspectRatio='none'/>;
	}
}

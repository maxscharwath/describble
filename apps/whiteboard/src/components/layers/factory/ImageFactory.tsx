import React from 'react';
import {z} from 'zod';
import {BaseShapeFactory, BaseShapeSchema} from './BaseShapeFactory';
import {createLayerComponent} from './LayerFactory';

export const ImageSchema = BaseShapeSchema.extend({
	type: z.literal('image'),
	src: z.string(),
});

export class ImageFactory extends BaseShapeFactory<typeof ImageSchema> {
	public component = createLayerComponent<z.infer<typeof ImageSchema>>(({data, ...props}) => {
		const {src} = data;
		const {x, y, width, height} = this.getBounds(data);

		return <image x={x} y={y} width={width} height={height} href={src} preserveAspectRatio='none' {...props}/>;
	});

	public constructor() {
		super('image', ImageSchema);
	}
}

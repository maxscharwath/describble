import React from 'react';
import {z} from 'zod';
import {BaseShapeFactory, BaseShapeSchema} from './BaseShapeFactory';

export const ImageSchema = BaseShapeSchema.extend({
	type: z.literal('image'),
	src: z.string(),
});

export class ImageFactory extends BaseShapeFactory<typeof ImageSchema> {
	public constructor() {
		super('image', ImageSchema);
	}

	public component: React.FC<z.infer<typeof ImageSchema>> = props => {
		const {src} = props;
		const {x, y, width, height} = this.getBounds(props);

		return <image x={x} y={y} width={width} height={height} href={src} preserveAspectRatio='none'/>;
	};
}

import React from 'react';
import {z} from 'zod';
import {BaseShapeFactory, BaseShapeSchema} from './BaseShapeFactory';
import {createLayerComponent} from './LayerFactory';

export const CircleSchema = BaseShapeSchema.extend({
	type: z.literal('circle'),
	color: z.string(),
});

export class CircleFactory extends BaseShapeFactory<typeof CircleSchema> {
	public component = createLayerComponent<z.infer<typeof CircleSchema>>(({data, ...props}) => {
		const {x, y, width, height, color} = data;
		const cx = x + (width / 2);
		const cy = y + (height / 2);
		const rx = Math.abs(width / 2);
		const ry = Math.abs(height / 2);
		return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} {...props}/>;
	});

	public constructor() {
		super('circle', CircleSchema);
	}
}

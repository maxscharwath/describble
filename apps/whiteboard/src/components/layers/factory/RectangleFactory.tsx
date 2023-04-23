import React from 'react';
import {z} from 'zod';
import {BaseShapeFactory, BaseShapeSchema} from './BaseShapeFactory';
import {createLayerComponent} from './LayerFactory';

export const RectangleSchema = BaseShapeSchema.extend({
	type: z.literal('rectangle'),
	color: z.string(),
});

export class RectangleFactory extends BaseShapeFactory<typeof RectangleSchema> {
	public component = createLayerComponent<z.infer<typeof RectangleSchema>>(({data, ...props}) => {
		const {color} = data;
		const {x, y, width, height} = this.getBounds(data);

		return <rect x={x} y={y} width={width} height={height} fill={color} {...props}/>;
	});

	public constructor() {
		super('rectangle', RectangleSchema);
	}
}

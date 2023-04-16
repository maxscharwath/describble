import React from 'react';
import {z} from 'zod';
import {BaseShapeFactory, BaseShapeSchema} from './BaseShapeFactory';
import {type LayerComponent} from './LayerFactory';

export const RectangleSchema = BaseShapeSchema.extend({
	type: z.literal('rectangle'),
	color: z.string(),
});

export class RectangleFactory extends BaseShapeFactory<typeof RectangleSchema> {
	public constructor() {
		super('rectangle', RectangleSchema);
	}

	public component: LayerComponent<z.infer<typeof RectangleSchema>> = ({data, ...props}) => {
		const {color} = data;
		const {x, y, width, height} = this.getBounds(data);

		return <rect x={x} y={y} width={width} height={height} fill={color} {...props}/>;
	};
}

import React from 'react';
import {z} from 'zod';
import {BaseLayerSchema, LayerFactory} from './LayerFactory';

export const RectangleSchema = BaseLayerSchema.extend({
	type: z.literal('rectangle'),
	x: z.number(),
	y: z.number(),
	width: z.number().refine(value => value !== 0, 'Width cannot be 0'),
	height: z.number().refine(value => value !== 0, 'Height cannot be 0'),
	color: z.string(),
});

export class RectangleFactory extends LayerFactory<typeof RectangleSchema> {
	constructor() {
		super('rectangle', RectangleSchema);
	}

	component: React.FC<z.infer<typeof RectangleSchema>> = props => {
		let {x, y, width, height, color} = props;
		if (width < 0) {
			x += width;
			width = -width;
		}

		if (height < 0) {
			y += height;
			height = -height;
		}

		return <rect x={x} y={y} width={width} height={height} fill={color}/>;
	};
}

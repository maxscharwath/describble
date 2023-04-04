import React from 'react';
import {z} from 'zod';
import {BaseLayerSchema, LayerFactory} from './LayerFactory';

export const RectangleSchema = BaseLayerSchema.extend({
	type: z.literal('rectangle'),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
	color: z.string(),
});

export class RectangleFactory extends LayerFactory<typeof RectangleSchema> {
	constructor() {
		super('rectangle', RectangleSchema);
	}

	createComponent(props: z.infer<typeof RectangleSchema>): React.ReactElement {
		let {x, y, width, height, color} = props;
		if (width < 0) {
			x += width;
			width = -width;
		}

		if (height < 0) {
			y += height;
			height = -height;
		}

		return <rect x={x} y={y} width={width} height={height} fill={color} />;
	}
}

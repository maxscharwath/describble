import React from 'react';
import {z} from 'zod';
import {BaseLayerSchema, LayerFactory} from './LayerFactory';

export const CircleSchema = BaseLayerSchema.extend({
	type: z.literal('circle'),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
	color: z.string(),
});

export class CircleFactory extends LayerFactory<typeof CircleSchema> {
	constructor() {
		super('circle', CircleSchema);
	}

	createComponent(props: z.infer<typeof CircleSchema>): React.ReactElement {
		const {x, y, width, height, color} = props;
		const cx = x + (width / 2);
		const cy = y + (height / 2);
		const rx = Math.abs(width / 2);
		const ry = Math.abs(height / 2);
		return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} />;
	}
}

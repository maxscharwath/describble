import React from 'react';
import {z} from 'zod';
import {BaseShapeFactory, BaseShapeSchema} from './BaseShapeFactory';

export const RectangleSchema = BaseShapeSchema.extend({
	type: z.literal('rectangle'),
	color: z.string(),
});

export class RectangleFactory extends BaseShapeFactory<typeof RectangleSchema> {
	public constructor() {
		super('rectangle', RectangleSchema);
	}

	public component: React.FC<z.infer<typeof RectangleSchema>> = props => {
		const {color} = props;
		const {x, y, width, height} = this.getBounds(props);

		return <rect x={x} y={y} width={width} height={height} fill={color}/>;
	};
}

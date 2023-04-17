import {BaseLayerSchema, LayerFactory} from './LayerFactory';
import {z} from 'zod';
import {type Bounds} from '../../../utils/types';

export const BaseShapeSchema = BaseLayerSchema.extend({
	x: z.number(),
	y: z.number(),
	width: z.number().refine(value => value !== 0, 'Width cannot be 0'),
	height: z.number().refine(value => value !== 0, 'Height cannot be 0'),
});

export abstract class BaseShapeFactory<
	T extends z.ZodSchema<z.infer<typeof BaseShapeSchema>>,
> extends LayerFactory<T> {
	public getBounds(data: z.infer<T>): Bounds {
		let {x, y, width, height} = data;
		if (width < 0) {
			x += width;
			width = -width;
		}

		if (height < 0) {
			y += height;
			height = -height;
		}

		return {x, y, width, height};
	}
}

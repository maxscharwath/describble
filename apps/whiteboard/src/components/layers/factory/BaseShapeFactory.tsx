import {BaseLayerSchema, LayerFactory} from './LayerFactory';
import {z} from 'zod';
import {type Bounds} from '../../../utils/types';
import {normalizeBounds} from '../../../utils/coordinateUtils';

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
		return normalizeBounds(data);
	}
}

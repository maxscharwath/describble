import {z} from 'zod';
import type React from 'react';
import {memo} from 'react';
import {type Bounds} from '../../../utils/types';
import {deepEqual} from 'fast-equals';

export const BaseLayerSchema = z.object({
	type: z.string(),
	uuid: z.string(),
	visible: z.boolean(),
});

export type LayerComponent<T> = React.FC<{
	data: T;
} & React.SVGProps<never>>;

export function createLayerComponent<T>(component: LayerComponent<T>): LayerComponent<T> {
	return memo(component, (prev, next) => deepEqual(prev.data, next.data));
}

export abstract class LayerFactory<T extends z.ZodSchema<z.infer<typeof BaseLayerSchema>> = z.ZodSchema> {
	public abstract component: LayerComponent<z.infer<T>>;

	protected constructor(public readonly type: z.infer<T>['type'], protected readonly _schema: T) {}

	get schema(): T {
		return this._schema;
	}

	public abstract getBounds(data: z.infer<T>): Bounds;
}

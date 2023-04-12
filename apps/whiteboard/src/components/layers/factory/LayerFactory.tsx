import {z} from 'zod';
import type React from 'react';

export const BaseLayerSchema = z.object({
	type: z.string(),
	uuid: z.string(),
	visible: z.boolean(),
});

export abstract class LayerFactory<T extends z.ZodSchema = z.ZodSchema, P = z.infer<T>> {
	public abstract component: React.FC<P>;

	protected constructor(public readonly type: z.infer<T>['type'], protected readonly _schema: T) {}

	get schema(): T {
		return this._schema;
	}
}

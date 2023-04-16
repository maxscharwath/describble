import {z} from 'zod';
import type React from 'react';

export const BaseLayerSchema = z.object({
	type: z.string(),
	uuid: z.string(),
	visible: z.boolean(),
});

export type Bounds = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type LayerComponent<T> = React.FC<{
	data: T;
} & React.SVGProps<never>>;

export abstract class LayerFactory<T extends z.ZodSchema<z.infer<typeof BaseLayerSchema>> = z.ZodSchema> {
	public abstract component: LayerComponent<z.infer<T>>;

	protected constructor(public readonly type: z.infer<T>['type'], protected readonly _schema: T) {}

	get schema(): T {
		return this._schema;
	}

	public abstract getBounds(data: z.infer<T>): Bounds;
}

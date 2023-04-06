import {type LayerFactory} from './factory/LayerFactory';
import {type z} from 'zod';

/**
 * Convert an array of factories to a record of factories.
 */
type LayerFactories<T extends LayerFactory[]> = {
	[K in T[number]['type']]: Extract<T[number], {type: K}> extends LayerFactory<infer U>
		? Extract<T[number], {type: K}>
		: never;
};

/**
 * Convert an array of factories to a record of factories.
 * @param factories - The array of factories.
 */
function factoriesToRecord<T extends LayerFactory[]>(factories: T): LayerFactories<T> {
	return factories.reduce<Partial<LayerFactories<T>>>((acc, factory) => ({
		...acc,
		[factory.type]: factory,
	}), {}) as LayerFactories<T>;
}

/**
 * A manager for layer factories.
 */
export class LayerFactoryManager<T extends LayerFactory[]> {
	public readonly records: LayerFactories<T>;
	public readonly array: T;

	constructor(...factories: T) {
		this.records = factoriesToRecord(factories);
		this.array = factories;
	}

	/**
	 * Get a factory by its type.
	 * @param type - The type of the factory.
	 */
	public getFactory<U extends string>(type: U) {
		return this.records[type] as U extends T[number]['type'] ? LayerFactories<T>[U] : undefined;
	}
}

export type LayerFactoryManagerSchema<T extends LayerFactoryManager<LayerFactory[]>> = T extends LayerFactoryManager<infer U> ? U[number]['schema'] : never;

/**
 * The data of a layer factory manager.
 */
export type LayerFactoryManagerData<T extends LayerFactoryManager<LayerFactory[]>> = T extends LayerFactoryManager<infer U> ? z.infer<U[number]['schema']> : never;
